import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Chapter {
    status: ChapterStatus;
    name: string;
    subjectId: bigint;
    studyTimeMinutes: bigint;
}
export type OTP = bigint;
export type Time = bigint;
export interface Subject {
    id: bigint;
    name: string;
    createdAt: Time;
}
export interface UserProfile {
    mobileNumber: MobileNumber;
}
export type MobileNumber = bigint;
export enum ChapterStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChapter(name: string, subjectId: bigint): Promise<void>;
    addStudyTimeToChapter(chapterName: string, minutes: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProfile(mobileNumber: MobileNumber): Promise<void>;
    createSubject(name: string): Promise<bigint>;
    getAverageStudyTimePerDay(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChapterStats(): Promise<[bigint, bigint, bigint]>;
    getChaptersBySubject(subjectId: bigint): Promise<Array<Chapter>>;
    getDailyStudyGoal(): Promise<bigint>;
    getDashboardProgress(): Promise<bigint>;
    getSubjectProgress(subjectId: bigint): Promise<bigint>;
    getSubjects(): Promise<Array<Subject>>;
    getTotalStudyTime(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isRegistered(mobileNumber: MobileNumber): Promise<boolean>;
    recordStudySession(minutes: bigint): Promise<void>;
    requestOtp(mobileNumber: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDailyStudyGoal(minutes: bigint): Promise<void>;
    updateChapterStatus(chapterName: string, newStatus: ChapterStatus): Promise<void>;
    verifyOtp(mobileNumberText: string, otp: OTP): Promise<boolean>;
}
