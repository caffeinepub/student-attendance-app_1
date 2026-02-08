interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStudentForm(
  name: string,
  rollNumber: string,
  parentMobile: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = 'Student name is required';
  }

  if (!rollNumber.trim()) {
    errors.rollNumber = 'Roll number is required';
  }

  if (!parentMobile.trim()) {
    errors.parentMobile = 'Parent mobile number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
