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
  } else {
    const cleaned = parentMobile.replace(/\D/g, '');
    if (cleaned.length < 10) {
      errors.parentMobile = 'Please enter a valid mobile number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
