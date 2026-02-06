import { Student } from './types';

function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  
  return cleaned;
}

// Shared type for WhatsApp payload
export interface WhatsAppPayload {
  messageText: string;
  waUrl: string;
  targetNumber: string;
  studentName?: string;
  isBulk?: boolean;
}

// Build single-recipient WhatsApp payload
export function buildSingleWhatsAppPayload(
  phoneNumber: string,
  messageText: string,
  studentName?: string
): WhatsAppPayload {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Fallback to safe default if message is empty
  const message = messageText && messageText.trim().length > 0 
    ? messageText 
    : 'Attendance update from Sunshine Academy';
  
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${normalized}?text=${encodedMessage}`;
  
  return {
    messageText: message,
    waUrl,
    targetNumber: normalized,
    studentName,
    isBulk: false,
  };
}

// Build bulk WhatsApp payload
export function buildBulkWhatsAppPayload(
  students: Student[],
  messageText: string
): WhatsAppPayload {
  if (students.length === 0) {
    return {
      messageText: '',
      waUrl: '',
      targetNumber: '',
      isBulk: true,
    };
  }
  
  // For multiple numbers, we'll use the first number and include all numbers in the message
  const phoneNumbers = students.map(s => normalizePhoneNumber(s.parentMobile));
  const firstNumber = phoneNumbers[0];
  
  // Fallback to safe default if message is empty
  const message = messageText && messageText.trim().length > 0 
    ? messageText 
    : 'Attendance update from Sunshine Academy';
  
  // Create a message that includes all parent numbers
  const fullMessage = `${message}\n\n---\n\nअभिभावक संपर्क / Parent contacts:\n${students.map((s, i) => 
    `${i + 1}. ${s.name}: ${s.parentMobile}`
  ).join('\n')}`;
  
  const encodedMessage = encodeURIComponent(fullMessage);
  const waUrl = `https://wa.me/${firstNumber}?text=${encodedMessage}`;
  
  return {
    messageText: fullMessage,
    waUrl,
    targetNumber: firstNumber,
    isBulk: true,
  };
}

// Legacy functions for backward compatibility (deprecated)
export function buildWhatsAppLink(phoneNumber: string, messageText: string): string {
  return buildSingleWhatsAppPayload(phoneNumber, messageText).waUrl;
}

export function buildBulkWhatsAppLink(students: Student[], messageText: string): string {
  return buildBulkWhatsAppPayload(students, messageText).waUrl;
}
