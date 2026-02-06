// WhatsApp message template management with localStorage persistence

const TEMPLATE_STORAGE_KEY = 'whatsapp_attendance_template';

// Default Hindi template matching user's requirement
const DEFAULT_TEMPLATE = `नमस्ते,
छात्र {{studentName}} कक्षा {{classValue}}-{{section}} सनशाइन एकेडमी में दिनांक {{date}} एवं {{day}} को {{status}} है।
धन्यवाद
सनशाइन एकेडमी`;

// Placeholder documentation
export const TEMPLATE_PLACEHOLDERS = {
  studentName: 'Student name',
  classValue: 'Class number',
  section: 'Section letter',
  date: 'Attendance date',
  day: 'Day of week',
  status: 'उपस्थित/अनुपस्थित (Present/Absent)',
} as const;

export type PlaceholderKey = keyof typeof TEMPLATE_PLACEHOLDERS;

// Get the current template from localStorage or return default
export function getTemplate(): string {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return stored || DEFAULT_TEMPLATE;
  } catch (error) {
    console.error('Error reading template from localStorage:', error);
    return DEFAULT_TEMPLATE;
  }
}

// Save template to localStorage
export function saveTemplate(template: string): void {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, template);
  } catch (error) {
    console.error('Error saving template to localStorage:', error);
  }
}

// Reset to default template
export function resetTemplate(): void {
  saveTemplate(DEFAULT_TEMPLATE);
}

interface TemplateData {
  studentName: string;
  classValue: string;
  section: string;
  date: string;
  day: string;
  status: string;
}

// Render template with data, replacing placeholders
export function renderTemplate(template: string, data: TemplateData): string {
  // If template is empty or only whitespace, use default
  if (!template || template.trim().length === 0) {
    template = DEFAULT_TEMPLATE;
  }

  let rendered = template;
  
  // Replace all placeholders
  rendered = rendered.replace(/\{\{studentName\}\}/g, data.studentName);
  rendered = rendered.replace(/\{\{classValue\}\}/g, data.classValue);
  rendered = rendered.replace(/\{\{section\}\}/g, data.section);
  rendered = rendered.replace(/\{\{date\}\}/g, data.date);
  rendered = rendered.replace(/\{\{day\}\}/g, data.day);
  rendered = rendered.replace(/\{\{status\}\}/g, data.status);
  
  return rendered;
}

// Render a single student message
export function renderStudentMessage(
  studentName: string,
  classValue: string,
  section: string,
  date: string,
  day: string,
  status: 'present' | 'absent' | 'unknown'
): string {
  const template = getTemplate();
  
  // Convert status to Hindi
  let statusText: string;
  if (status === 'present') {
    statusText = 'उपस्थित';
  } else if (status === 'absent') {
    statusText = 'अनुपस्थित';
  } else {
    statusText = 'स्थिति अज्ञात';
  }
  
  return renderTemplate(template, {
    studentName,
    classValue,
    section,
    date,
    day,
    status: statusText,
  });
}

// Render bulk message for multiple students
export function renderBulkMessage(
  students: Array<{
    name: string;
    status?: 'present' | 'absent';
  }>,
  classValue: string,
  section: string,
  date: string,
  day: string
): string {
  const template = getTemplate();
  
  const messages = students.map((student) => {
    let statusText: string;
    if (student.status === 'present') {
      statusText = 'उपस्थित';
    } else if (student.status === 'absent') {
      statusText = 'अनुपस्थित';
    } else {
      statusText = 'स्थिति अज्ञात';
    }
    
    return renderTemplate(template, {
      studentName: student.name,
      classValue,
      section,
      date,
      day,
      status: statusText,
    });
  });
  
  return messages.join('\n\n---\n\n');
}
