import { StoredStudent, DailyRollCall } from '../backend';
import { arrayToCsv } from './csv';

/**
 * Generates a monthly attendance CSV with one row per student
 * and columns for each day of the month
 */
export function generateMonthlyAttendanceCsv(
  students: StoredStudent[],
  rollCalls: DailyRollCall[],
  year: number,
  month: string,
  className: string,
  section: string
): string {
  // Sort students by roll number
  const sortedStudents = [...students].sort((a, b) => 
    Number(a.student.rollNumber) - Number(b.student.rollNumber)
  );
  
  // Get all unique days from roll calls and sort them
  const daysSet = new Set<number>();
  rollCalls.forEach(rc => {
    const [, , dayStr] = rc.date.split('-');
    daysSet.add(parseInt(dayStr));
  });
  const days = Array.from(daysSet).sort((a, b) => a - b);
  
  // Build header row
  const headerRow = [
    'Roll No',
    'Student Name',
    'Parent Mobile',
    ...days.map(d => `Day ${d}`),
    'Total Present',
    'Total Absent',
    'Attendance %'
  ];
  
  // Build data rows
  const dataRows = sortedStudents.map(storedStudent => {
    const student = storedStudent.student;
    const studentId = storedStudent.id.toString();
    
    let totalPresent = 0;
    let totalAbsent = 0;
    
    // For each day, check if student was present/absent
    const dayColumns = days.map(day => {
      const rollCall = rollCalls.find(rc => {
        const [, , dayStr] = rc.date.split('-');
        return parseInt(dayStr) === day;
      });
      
      if (!rollCall) return '-';
      
      const studentIndex = rollCall.studentRecords.findIndex(
        id => id.toString() === studentId
      );
      
      if (studentIndex === -1) return '-';
      
      const wasPresent = rollCall.wasPresent[studentIndex];
      if (wasPresent) {
        totalPresent++;
        return 'P';
      } else {
        totalAbsent++;
        return 'A';
      }
    });
    
    const totalDays = totalPresent + totalAbsent;
    const attendancePercent = totalDays > 0 
      ? ((totalPresent / totalDays) * 100).toFixed(1) 
      : '0.0';
    
    return [
      student.rollNumber.toString(),
      student.fullName,
      student.parentMobileNumber,
      ...dayColumns,
      totalPresent.toString(),
      totalAbsent.toString(),
      attendancePercent + '%'
    ];
  });
  
  // Combine header and data
  const allRows = [headerRow, ...dataRows];
  
  return arrayToCsv(allRows);
}

/**
 * Generates a filename for the monthly attendance export
 */
export function generateMonthlyFilename(
  year: number,
  month: string,
  className: string,
  section: string
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `Attendance_Class${className}_Sec${section}_${year}_${month}_${timestamp}.csv`;
}
