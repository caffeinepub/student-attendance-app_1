export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  parentMobile: string;
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  date: string;
  classValue: string;
  section: string;
  attendance: Record<string, AttendanceStatus>;
}
