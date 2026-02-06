import { AttendanceStatus } from './types';
import { getFromLocalStorage, saveToLocalStorage } from './localStore';

function getAttendanceKey(date: string, classValue: string, section: string): string {
  return `attendance_${date}_${classValue}_${section}`;
}

export function getAttendanceForDate(
  date: string,
  classValue: string,
  section: string
): Record<string, AttendanceStatus> {
  const key = getAttendanceKey(date, classValue, section);
  return getFromLocalStorage<Record<string, AttendanceStatus>>(key, {});
}

export function saveAttendance(
  date: string,
  classValue: string,
  section: string,
  attendance: Record<string, AttendanceStatus>
): void {
  const key = getAttendanceKey(date, classValue, section);
  saveToLocalStorage(key, attendance);
}
