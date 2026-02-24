import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
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
  type AuthResult = {
    authenticated : Bool;
    userId : ?Text;
  };

  public type UserProfile = {
    name : Text;
    mobileNumber : Text;
  };

  // Storage
  let devOtpStore = Map.empty<Text, OTPRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper function to generate OTP (simple for dev)
  func generateOtp() : Text {
    "123456";
  };

  // Send OTP method - No authorization needed (guest access)
  // Anyone should be able to request an OTP to authenticate
  public shared ({ caller }) func sendOTP(mobileNumber : Text) : async () {
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

  // Verify OTP method - No authorization needed (guest access)
  // This is the authentication mechanism itself
  public shared ({ caller }) func verifyOTP(mobileNumber : Text, code : Text) : async AuthResult {
    switch (devOtpStore.get(mobileNumber)) {
      case (?record) {
        if (Time.now() > record.expiry) {
          Runtime.trap("OTP Expired");
        };

        if (record.code == code) {
          devOtpStore.remove(mobileNumber);
          return { authenticated = true; userId = ?mobileNumber };
        } else {
          Runtime.trap("Invalid code");
        };
      };
      case (null) {
        Runtime.trap("Please request new OTP first");
      };
    };
  };

  // User Profile Management - Required by frontend

  // Get caller's own profile - Users only
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get any user's profile - Own profile or admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's profile - Users only
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
