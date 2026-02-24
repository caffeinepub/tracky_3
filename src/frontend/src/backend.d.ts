import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AuthResult {
    isNewUser: boolean;
    userId?: string;
    authenticated: boolean;
}
export interface UserProfile {
    id: Principal;
    name: string;
    mobileNumber: string;
}
export interface SignupInput {
    name: string;
    mobileNumber: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cleanupExpiredOTPs(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendOTP(mobileNumber: string): Promise<void>;
    signup(input: SignupInput): Promise<UserProfile>;
    verifyOTP(mobileNumber: string, code: string): Promise<AuthResult>;
}
