import { useMutation } from '@tanstack/react-query';
import { useGetClassSectionStudents } from './useStudents';
import { useGetMonthlyRollCall } from './useRollCall';
import { generateMonthlyAttendanceCsv, generateMonthlyFilename } from '../lib/attendanceExport';
import { downloadCsv } from '../lib/csv';

export function useMonthlyExport(className: string, section: string) {
  const { data: students = [] } = useGetClassSectionStudents(className, section);
  
  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: string }) => {
      if (!className || !section) {
        throw new Error('Class and section are required');
      }
      
      if (students.length === 0) {
        throw new Error('No students found for this class and section');
      }
      
      // Fetch monthly roll calls - we need to do this inline since we can't use hooks conditionally
      const { actor } = await import('./useActor').then(m => {
        const { useActor } = m;
        // This is a workaround - in practice we'd pass the actor or use a different pattern
        throw new Error('Please use the component-level hook pattern');
      });
      
      throw new Error('This hook should be used with the component pattern');
    },
  });
}

// Export function to be called from components with all data
export async function exportMonthlyAttendance(
  year: number,
  month: string,
  className: string,
  section: string,
  students: any[],
  rollCalls: any[]
): Promise<void> {
  if (students.length === 0) {
    throw new Error('No students found for this class and section');
  }
  
  const csvContent = generateMonthlyAttendanceCsv(
    students,
    rollCalls,
    year,
    month,
    className,
    section
  );
  
  const filename = generateMonthlyFilename(year, month, className, section);
  downloadCsv(csvContent, filename);
}
