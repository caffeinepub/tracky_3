# Specification

## Summary
**Goal:** Fix the non-working OTP login flow to enable users to authenticate via mobile number and OTP code.

**Planned changes:**
- Debug and fix the Send OTP button to trigger backend sendOTP method with loading state
- Fix OTP verification screen to properly validate 6-digit codes via backend verifyOTP method
- Ensure new user signup flow displays form after OTP verification and creates user profile
- Fix useOTPAuth hook integration with backend actor methods (sendOTP and verifyOTP)
- Ensure authentication state persists in localStorage across page refreshes
- Verify backend sendOTP generates 6-digit OTP with 5-minute expiration
- Verify backend verifyOTP validates OTP, checks expiration, and returns authentication status

**User-visible outcome:** Users can successfully log in by entering their mobile number, receiving an OTP, verifying it, and either accessing their dashboard (existing users) or completing signup (new users). Authentication state persists across page refreshes.
