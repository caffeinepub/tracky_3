import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  type OldMobileNumber = Nat;
  type OldUserProfile = {
    mobileNumber : OldMobileNumber;
  };
  type OldChapterStatus = {
    #pending;
    #completed;
  };
  type OldChapter = {
    name : Text;
    status : OldChapterStatus;
    studyTimeMinutes : Nat;
    subjectId : Nat;
  };
  type OldSubject = {
    id : Nat;
    name : Text;
    createdAt : Time.Time;
  };
  type OldOTP = Nat;
  type OldStudyTimeEntry = {
    date : Int;
    minutes : Nat;
  };
  type OldActor = {
    userProfiles : Map.Map<OldMobileNumber, OldUserProfile>;
    dailyStudyGoalsByUser : Map.Map<OldMobileNumber, Nat>;
    chaptersByUser : Map.Map<OldMobileNumber, List.List<OldChapter>>;
    subjectsByUser : Map.Map<OldMobileNumber, List.List<OldSubject>>;
    nextSubjectId : Nat;
    pendingOtps : Map.Map<Text, OldOTP>;
    principalToMobile : Map.Map<Principal, OldMobileNumber>;
    mobileToPrincipal : Map.Map<OldMobileNumber, Principal>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; mobileNumber : Text }>;
  };

  public func run(_ : OldActor) : NewActor {
    // Initialize empty map for new userProfiles - old data is not needed.
    // All old data structures are explicitly dropped.
    { userProfiles = Map.empty<Principal, { name : Text; mobileNumber : Text }>() };
  };
};
