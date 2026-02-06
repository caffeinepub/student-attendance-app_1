import { AttendanceStatus } from './types';

export interface AttendanceSummary {
  present: number;
  absent: number;
  total: number;
}

export function computeSummary(attendance: Record<string, AttendanceStatus>): AttendanceSummary {
  let present = 0;
  let absent = 0;

  Object.values(attendance).forEach((status) => {
    if (status === 'present') {
      present++;
    } else if (status === 'absent') {
      absent++;
    }
  });

  return {
    present,
    absent,
    total: present + absent,
  };
}
