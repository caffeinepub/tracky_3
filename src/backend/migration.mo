import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    dailyStudyGoalsByUser : Map.Map<Principal, Nat>;
    chaptersByUser : Map.Map<Principal, List.List<Chapter>>;
    subjectsByUser : Map.Map<Principal, List.List<Subject>>;
    nextSubjectId : Nat;
  };

  type OldUserProfile = {
    email : Text;
  };

  type Chapter = {
    name : Text;
    status : {
      #pending;
      #completed;
    };
    studyTimeMinutes : Nat;
    subjectId : Nat;
  };

  type Subject = {
    id : Nat;
    name : Text;
    createdAt : Time.Time;
  };

  type NewActor = {
    userProfiles : Map.Map<Nat, NewUserProfile>;
    dailyStudyGoalsByUser : Map.Map<Nat, Nat>;
    chaptersByUser : Map.Map<Nat, List.List<Chapter>>;
    subjectsByUser : Map.Map<Nat, List.List<Subject>>;
    nextSubjectId : Nat;
  };

  type NewUserProfile = {
    mobileNumber : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = Map.empty<Nat, NewUserProfile>();
      dailyStudyGoalsByUser = Map.empty<Nat, Nat>();
      chaptersByUser = Map.empty<Nat, List.List<Chapter>>();
      subjectsByUser = Map.empty<Nat, List.List<Subject>>();
      nextSubjectId = old.nextSubjectId;
    };
  };
};
