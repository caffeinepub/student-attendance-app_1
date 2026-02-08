/**
 * LEGACY: This module is deprecated and no longer the source of truth.
 * Student data is now stored in the canister backend.
 * Use hooks from useStudents.ts instead.
 */

import { Student } from './types';
import { getFromLocalStorage, saveToLocalStorage } from './localStore';

function getStudentsKey(classValue: string, section: string): string {
  return `students_${classValue}_${section}`;
}

export function getStudents(classValue: string, section: string): Student[] {
  const key = getStudentsKey(classValue, section);
  return getFromLocalStorage<Student[]>(key, []);
}

export function addStudent(
  classValue: string,
  section: string,
  studentData: Omit<Student, 'id'>
): Student {
  const students = getStudents(classValue, section);
  const newStudent: Student = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...studentData,
  };
  students.push(newStudent);
  const key = getStudentsKey(classValue, section);
  saveToLocalStorage(key, students);
  return newStudent;
}

export function deleteStudent(
  classValue: string,
  section: string,
  studentId: string
): void {
  const students = getStudents(classValue, section);
  const filteredStudents = students.filter(s => s.id !== studentId);
  const key = getStudentsKey(classValue, section);
  saveToLocalStorage(key, filteredStudents);
}
