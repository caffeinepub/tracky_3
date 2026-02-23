import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    email: string;
}
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
    addChapter(name: string): Promise<void>;
    addStudyTimeToChapter(chapterName: string, minutes: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChapterStats(): Promise<[bigint, bigint, bigint]>;
    getDailyStudyGoal(): Promise<bigint>;
    getDashboardProgress(): Promise<bigint>;
    getTotalStudyTime(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDailyStudyGoal(minutes: bigint): Promise<void>;
    updateChapterStatus(chapterName: string, newStatus: ChapterStatus): Promise<void>;
}
