import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StoredStudent {
    id: bigint;
    student: Student;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Student {
    fullName: string;
    section: string;
    parentMobileNumber: string;
    rollNumber: bigint;
    className: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Student Management Functions
     */
    addStudent(student: Student): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStudent(id: bigint): Promise<void>;
    getAllStudents(): Promise<Array<StoredStudent>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassSectionStudents(className: string, section: string): Promise<Array<[bigint, Student]>>;
    getStudent(id: bigint): Promise<Student | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateStudent(id: bigint, student: Student): Promise<void>;
}
