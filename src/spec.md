# Specification

## Summary
**Goal:** Replace Internet Identity authentication with OTP-based mobile number authentication and redesign the login/signup UI with a student-friendly light theme.

**Planned changes:**
- Remove Internet Identity authentication system completely
- Implement OTP-based mobile authentication backend (generate, store, verify OTPs)
- Update user profile model to use mobile number (10 digits) as primary identifier instead of Internet Identity principal
- Store Full Name and Class/Course fields in user profile
- Create new frontend login flow with mobile number input and "Send OTP" button
- Create OTP verification screen with 6-digit OTP input and "Verify & Login" button
- Create signup form for new users to enter Full Name and Class/Course after OTP verification
- Redesign LoginPage with light theme (white + blue), app logo, "Welcome to Tracky" title, and "Track your syllabus smartly" subtitle
- Replace useInternetIdentity hook with new OTP authentication hook throughout the application
- Update useActor hook to use OTP authentication tokens instead of Internet Identity delegation
- Remove ProfileSetupPage component (profile setup now integrated into signup flow)
- Update logout functionality to clear OTP authentication session
- Update route protection to check OTP authentication status

**User-visible outcome:** Users can log in and sign up using their mobile number with OTP verification in a redesigned, student-friendly interface with light blue and white colors.
