import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type MobileNumber = Text;

  type OTPRecord = {
    code : Text;
    expiry : Time.Time;
  };

  type OldUserProfile = {
    name : Text;
    mobileNumber : Text;
  };

  type NewUserProfile = {
    id : Principal;
    name : Text;
    mobileNumber : Text;
  };

  type OldActor = {
    devOtpStore : Map.Map<Text, OTPRecord>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    devOtpStore : Map.Map<Text, OTPRecord>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    verifiedMobileNumbers : Map.Map<Principal, Text>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(id, oldProfile) {
        { oldProfile with id };
      }
    );
    {
      devOtpStore = old.devOtpStore;
      userProfiles = newUserProfiles;
      verifiedMobileNumbers = Map.empty<Principal, Text>();
    };
  };
};
