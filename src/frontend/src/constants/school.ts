export const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
export const SECTIONS = ['A', 'B', 'C', 'D'];

export function getClassDisplayName(className: string): string {
  if (className === 'Nursery' || className === 'LKG' || className === 'UKG') {
    return className;
  }
  return `Class ${className}`;
}
