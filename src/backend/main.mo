import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type MobileNumber = Text;
  type OTPRecord = {
    code : Text;
    expiry : Time.Time;
  };
  type UserProfile = {
    id : Principal;
    name : Text;
    mobileNumber : Text;
    // Add more fields as needed
  };

  public type AuthResult = {
    authenticated : Bool;
    userId : ?Text;
    isNewUser : Bool;
  };

  public type SignupInput = {
    name : Text;
    mobileNumber : Text;
    // Add other fields like class/course if needed
  };

  // Storage
  let devOtpStore = Map.empty<Text, OTPRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  // Track verified mobile numbers awaiting signup
  let verifiedMobileNumbers = Map.empty<Principal, Text>();

  // Helper function to generate OTP (simple for dev)
  func generateOtp() : Text {
    "123456";
  };

  // Send OTP method - No authorization needed (public endpoint for login)
  public shared ({ caller }) func sendOTP(mobileNumber : Text) : async () {
    // Validate mobile number format (basic length check)
    if (mobileNumber.size() != 10) {
      Runtime.trap("Invalid mobile number format");
    };

    // Use static OTP for dev
    let otp = generateOtp();

    // Store OTP with expiry (5 mins)
    devOtpStore.add(
      mobileNumber,
      { code = otp; expiry = Time.now() + 5 * 60 * 1_000_000_000 } // 5 minutes in nanoseconds
    );
  };

  // Verify OTP method - No authorization needed (this IS the authentication step)
  public shared ({ caller }) func verifyOTP(mobileNumber : Text, code : Text) : async AuthResult {
    switch (devOtpStore.get(mobileNumber)) {
      case (?record) {
        if (Time.now() > record.expiry) {
          Runtime.trap("OTP Expired");
        };

        if (record.code == code) {
          devOtpStore.remove(mobileNumber);

          // Check if user exists
          let existingUser = userProfiles.values().find(
            func(profile) { profile.mobileNumber == mobileNumber }
          );

          switch (existingUser) {
            case (?profile) {
              // Existing user - assign user role
              AccessControl.assignRole(accessControlState, caller, caller, #user);
              return {
                authenticated = true;
                userId = ?profile.id.toText();
                isNewUser = false;
              };
            };
            case (null) {
              // New user - store verified mobile for signup, assign user role
              verifiedMobileNumbers.add(caller, mobileNumber);
              AccessControl.assignRole(accessControlState, caller, caller, #user);
              return {
                authenticated = true;
                userId = null;
                isNewUser = true;
              };
            };
          };
        } else {
          Runtime.trap("Invalid OTP code");
        };
      };
      case (null) {
        Runtime.trap("OTP not found - please request a new one");
      };
    };
  };

  // Signup new user - Requires user role (must have verified OTP first)
  public shared ({ caller }) func signup(input : SignupInput) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must verify OTP before signup");
    };

    // Verify that this principal has a verified mobile number
    switch (verifiedMobileNumbers.get(caller)) {
      case (?verifiedMobile) {
        // Ensure the mobile number matches
        if (verifiedMobile != input.mobileNumber) {
          Runtime.trap("Mobile number mismatch with verified OTP");
        };

        // Check if profile already exists
        switch (userProfiles.get(caller)) {
          case (?_) {
            Runtime.trap("User profile already exists");
          };
          case (null) {
            let newProfile : UserProfile = {
              id = caller;
              name = input.name;
              mobileNumber = input.mobileNumber;
            };

            userProfiles.add(caller, newProfile);
            verifiedMobileNumbers.remove(caller);
            return newProfile;
          };
        };
      };
      case (null) {
        Runtime.trap("No verified mobile number found - please verify OTP first");
      };
    };
  };

  // Delete expired OTPs - Admin only
  public shared ({ caller }) func cleanupExpiredOTPs() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can cleanup OTPs");
    };

    let now = Time.now();
    let keysToRemove = devOtpStore.entries().filter(
      func((_, record)) {
        record.expiry <= now;
      }
    ).map(func((mobile, _)) { mobile }).toArray();

    for (key in keysToRemove.values()) {
      devOtpStore.remove(key);
    };
  };

  // User Profile Management - Required by frontend

  // Get caller's own profile - Requires user role
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get any user's profile (admin or own) - Requires user role
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's profile - Requires user role
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Ensure caller can only update their own profile
    if (profile.id != caller) {
      Runtime.trap("Unauthorized: Can only update your own profile");
    };
    userProfiles.add(caller, profile);
  };
};
