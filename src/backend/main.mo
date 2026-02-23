import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Chapter Management

  public type ChapterStatus = {
    #pending;
    #completed;
  };

  public type Chapter = {
    name : Text;
    status : ChapterStatus;
    studyTimeMinutes : Nat;
    subjectId : Nat;
  };

  public type Subject = {
    id : Nat;
    name : Text;
    createdAt : Time.Time;
  };

  let dailyStudyGoalsByUser = Map.empty<Principal, Nat>();
  let chaptersByUser = Map.empty<Principal, List.List<Chapter>>();
  let subjectsByUser = Map.empty<Principal, List.List<Subject>>();
  var nextSubjectId = 0;

  // Subject Management

  public shared ({ caller }) func createSubject(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create subjects");
    };

    let subject : Subject = {
      id = nextSubjectId;
      name;
      createdAt = Time.now();
    };
    nextSubjectId += 1;

    let currentSubjects = switch (subjectsByUser.get(caller)) {
      case (null) { List.empty<Subject>() };
      case (?subjects) { subjects };
    };

    currentSubjects.add(subject);
    subjectsByUser.add(caller, currentSubjects);
    subject.id;
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };

    switch (subjectsByUser.get(caller)) {
      case (null) { [] };
      case (?subjects) { subjects.toArray() };
    };
  };

  // Chapter Management

  public shared ({ caller }) func addChapter(name : Text, subjectId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add chapters");
    };

    let newChapter : Chapter = {
      name;
      status = #pending;
      studyTimeMinutes = 0;
      subjectId;
    };

    let currentChapters = switch (chaptersByUser.get(caller)) {
      case (null) { List.empty<Chapter>() };
      case (?chapters) { chapters };
    };

    currentChapters.add(newChapter);
    chaptersByUser.add(caller, currentChapters);
  };

  public shared ({ caller }) func updateChapterStatus(chapterName : Text, newStatus : ChapterStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update chapter status");
    };

    switch (chaptersByUser.get(caller)) {
      case (null) {
        Runtime.trap("Chapter not found for user");
      };
      case (?chapters) {
        let updatedChapters = chapters.map<Chapter, Chapter>(
          func(chapter) {
            if (chapter.name == chapterName) {
              { chapter with status = newStatus };
            } else {
              chapter;
            };
          }
        );
        chaptersByUser.add(caller, updatedChapters);
      };
    };
  };

  public shared ({ caller }) func addStudyTimeToChapter(chapterName : Text, minutes : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add study time");
    };

    switch (chaptersByUser.get(caller)) {
      case (null) {
        Runtime.trap("Chapter not found for user");
      };
      case (?chapters) {
        let updatedChapters = chapters.map<Chapter, Chapter>(
          func(chapter) {
            if (chapter.name == chapterName) {
              { chapter with studyTimeMinutes = chapter.studyTimeMinutes + minutes };
            } else {
              chapter;
            };
          }
        );
        chaptersByUser.add(caller, updatedChapters);
      };
    };
  };

  // Study Timer

  public shared ({ caller }) func setDailyStudyGoal(minutes : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set study goals");
    };
    dailyStudyGoalsByUser.add(caller, minutes);
  };

  public query ({ caller }) func getDailyStudyGoal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study goals");
    };
    switch (dailyStudyGoalsByUser.get(caller)) {
      case (null) { 0 };
      case (?goal) { goal };
    };
  };

  // Dashboard Computations

  public query ({ caller }) func getDashboardProgress() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard progress");
    };
    switch (chaptersByUser.get(caller)) {
      case (null) { 0 };
      case (?chapters) {
        let totalChapters = chapters.size();
        if (totalChapters == 0) { return 0 };

        let completedChapters = chapters.filter(
          func(chapter) { chapter.status == #completed }
        ).size();

        completedChapters * 100 / totalChapters;
      };
    };
  };

  public query ({ caller }) func getChapterStats() : async (Nat, Nat, Nat) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view chapter stats");
    };
    switch (chaptersByUser.get(caller)) {
      case (null) { (0, 0, 0) };
      case (?chapters) {
        let total = chapters.size();
        let completed = chapters.filter(
          func(chapter) { chapter.status == #completed }
        ).size();
        let pending = chapters.filter(
          func(chapter) { chapter.status == #pending }
        ).size();

        (total, completed, pending);
      };
    };
  };

  public query ({ caller }) func getTotalStudyTime() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view total study time");
    };
    switch (chaptersByUser.get(caller)) {
      case (null) { 0 };
      case (?chapters) {
        var totalTime = 0;
        chapters.values().forEach(
          func(chapter) {
            totalTime += chapter.studyTimeMinutes;
          }
        );
        totalTime;
      };
    };
  };

  // New Query Functions

  public query ({ caller }) func getChaptersBySubject(subjectId : Nat) : async [Chapter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view chapters");
    };

    switch (chaptersByUser.get(caller)) {
      case (null) { [] };
      case (?chapters) {
        let filteredChapters = chapters.filter(
          func(chapter) { chapter.subjectId == subjectId }
        );
        filteredChapters.toArray();
      };
    };
  };

  public query ({ caller }) func getSubjectProgress(subjectId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subject progress");
    };

    switch (chaptersByUser.get(caller)) {
      case (null) { 0 };
      case (?chapters) {
        let subjectChapters = chapters.filter(
          func(chapter) { chapter.subjectId == subjectId }
        );

        let totalChapters = subjectChapters.size();
        if (totalChapters == 0) { return 0 };

        let completedChapters = subjectChapters.filter(
          func(chapter) { chapter.status == #completed }
        ).size();

        completedChapters * 100 / totalChapters;
      };
    };
  };
};
