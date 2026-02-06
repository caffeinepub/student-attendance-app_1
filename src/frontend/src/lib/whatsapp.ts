import { AttendanceStatus, Student } from './types';

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

export function buildWhatsAppLink(phoneNumber: string, status: AttendanceStatus): string {
  const normalized = normalizePhoneNumber(phoneNumber);
  const message = status === 'present' 
    ? 'Your child is present today.'
    : 'Your child is absent today.';
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
}

export function buildBulkWhatsAppLink(students: Student[], message: string): string {
  if (students.length === 0) return '';
  
  // For multiple numbers, we'll use the first number and include all numbers in the message
  const phoneNumbers = students.map(s => normalizePhoneNumber(s.parentMobile));
  const firstNumber = phoneNumbers[0];
  
  // Create a message that includes all parent numbers
  const fullMessage = `${message}\n\nParent contacts:\n${students.map((s, i) => 
    `${i + 1}. ${s.name}: ${s.parentMobile}`
  ).join('\n')}`;
  
  const encodedMessage = encodeURIComponent(fullMessage);
  return `https://wa.me/${firstNumber}?text=${encodedMessage}`;
}
