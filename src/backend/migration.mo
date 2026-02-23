import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { email : Text }>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { email : Text }>;
    chaptersByUser : Map.Map<Principal, List.List<{ name : Text; status : { #pending; #completed }; studyTimeMinutes : Nat }>>;
    dailyStudyGoalsByUser : Map.Map<Principal, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      chaptersByUser = Map.empty<Principal, List.List<{ name : Text; status : { #pending; #completed }; studyTimeMinutes : Nat }>>();
      dailyStudyGoalsByUser = Map.empty<Principal, Nat>();
    };
  };
};
