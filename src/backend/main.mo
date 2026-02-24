import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type MobileNumber = Nat; // 10 digit mobile number
  public type OTP = Nat;

  public type UserProfile = {
    mobileNumber : MobileNumber;
  };

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

  type StudyTimeEntry = {
    date : Int; // Use Int to represent Time
    minutes : Nat;
  };

  // Core data structures
  var userProfiles = Map.empty<MobileNumber, UserProfile>();
  var dailyStudyGoalsByUser = Map.empty<MobileNumber, Nat>();
  var chaptersByUser = Map.empty<MobileNumber, List.List<Chapter>>();
  var subjectsByUser = Map.empty<MobileNumber, List.List<Subject>>();
  var nextSubjectId = 0;

  // OTP Storage
  let pendingOtps = Map.empty<Text, OTP>();

  // Authentication mapping: Principal -> MobileNumber
  let principalToMobile = Map.empty<Principal, MobileNumber>();
  let mobileToPrincipal = Map.empty<MobileNumber, Principal>();

  // Helper function to get authenticated user's mobile number
  private func getAuthenticatedMobile(caller : Principal) : ?MobileNumber {
    principalToMobile.get(caller);
  };

  // Helper function to verify caller owns the mobile number
  private func verifyOwnership(caller : Principal, mobileNumber : MobileNumber) {
    switch (getAuthenticatedMobile(caller)) {
      case (?userMobile) {
        if (userMobile != mobileNumber) {
          Runtime.trap("Unauthorized: Cannot access another user's data");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // OTP Management - Accessible to guests (part of authentication flow)
  public shared ({ caller }) func requestOtp(mobileNumber : Text) : async () {
    // No authorization check - guests need to request OTP to authenticate
    let generatedOtp = 1234; // TODO: Replace with random OTP generator
    pendingOtps.add(mobileNumber, generatedOtp);
  };

  // Verify OTP and establish authenticated session - Accessible to guests
  public shared ({ caller }) func verifyOtp(mobileNumberText : Text, otp : OTP) : async Bool {
    // No authorization check - guests need to verify OTP to authenticate

    // Parse mobile number
    let mobileNumber = switch (Nat.fromText(mobileNumberText)) {
      case (?num) { num };
      case (null) { Runtime.trap("Invalid mobile number format") };
    };

    switch (pendingOtps.get(mobileNumberText)) {
      case (?storedOtp) {
        if (storedOtp == otp) {
          pendingOtps.remove(mobileNumberText);

          // Create authentication mapping
          principalToMobile.add(caller, mobileNumber);
          mobileToPrincipal.add(mobileNumber, caller);

          // Assign user role if not already assigned
          if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
            AccessControl.assignRole(accessControlState, caller, caller, #user);
          };

          return true;
        };
      };
      case (null) {};
    };
    false;
  };

  // Check if mobile number is registered - Accessible to guests (part of signup flow)
  public shared ({ caller }) func isRegistered(mobileNumber : MobileNumber) : async Bool {
    // No authorization check - guests need to check registration status
    userProfiles.containsKey(mobileNumber);
  };

  // User Profile Management

  // Create profile for authenticated user
  public shared ({ caller }) func createProfile(mobileNumber : MobileNumber) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    verifyOwnership(caller, mobileNumber);

    if (userProfiles.containsKey(mobileNumber)) {
      Runtime.trap("Profile already exists");
    };

    let profile : UserProfile = {
      mobileNumber;
    };
    userProfiles.add(mobileNumber, profile);

    let initialSubjects = List.empty<Subject>();
    subjectsByUser.add(mobileNumber, initialSubjects);
    chaptersByUser.add(mobileNumber, List.empty<Chapter>());
  };

  // Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        userProfiles.get(mobileNumber);
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // Get any user's profile (admin only or own profile)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (principalToMobile.get(user)) {
      case (?mobileNumber) {
        userProfiles.get(mobileNumber);
      };
      case (null) { null };
    };
  };

  // Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    verifyOwnership(caller, profile.mobileNumber);
    userProfiles.add(profile.mobileNumber, profile);
  };

  // Study Time Management

  public shared ({ caller }) func setDailyStudyGoal(minutes : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can set study goals");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        dailyStudyGoalsByUser.add(mobileNumber, minutes);
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public query ({ caller }) func getDailyStudyGoal() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access study goals");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (dailyStudyGoalsByUser.get(mobileNumber)) {
          case (null) { 0 };
          case (?goal) { goal };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // Subject Management

  public shared ({ caller }) func createSubject(name : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create subjects");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        let subject : Subject = {
          id = nextSubjectId;
          name;
          createdAt = Time.now();
        };
        nextSubjectId += 1;

        let currentSubjects = switch (subjectsByUser.get(mobileNumber)) {
          case (null) { List.empty<Subject>() };
          case (?subjects) { subjects };
        };

        currentSubjects.add(subject);
        subjectsByUser.add(mobileNumber, currentSubjects);
        subject.id;
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access subjects");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (subjectsByUser.get(mobileNumber)) {
          case (null) { [] };
          case (?subjects) { subjects.toArray() };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // Chapter Management

  public shared ({ caller }) func addChapter(name : Text, subjectId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add chapters");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        let newChapter : Chapter = {
          name;
          status = #pending;
          studyTimeMinutes = 0;
          subjectId;
        };

        let currentChapters = switch (chaptersByUser.get(mobileNumber)) {
          case (null) { List.empty<Chapter>() };
          case (?chapters) { chapters };
        };

        currentChapters.add(newChapter);
        chaptersByUser.add(mobileNumber, currentChapters);
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public shared ({ caller }) func updateChapterStatus(chapterName : Text, newStatus : ChapterStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update chapters");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
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
            chaptersByUser.add(mobileNumber, updatedChapters);
          };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public shared ({ caller }) func addStudyTimeToChapter(chapterName : Text, minutes : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add study time");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
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
            chaptersByUser.add(mobileNumber, updatedChapters);
          };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // Dashboard Computations

  public query ({ caller }) func getDashboardProgress() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access dashboard");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
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
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public query ({ caller }) func getChapterStats() : async (Nat, Nat, Nat) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access chapter stats");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
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
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public query ({ caller }) func getTotalStudyTime() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access study time");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
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
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // New Query Functions

  public query ({ caller }) func getChaptersBySubject(subjectId : Nat) : async [Chapter] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access chapters");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
          case (null) { [] };
          case (?chapters) {
            let filteredChapters = chapters.filter(
              func(chapter) { chapter.subjectId == subjectId }
            );
            filteredChapters.toArray();
          };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  public query ({ caller }) func getSubjectProgress(subjectId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access subject progress");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (chaptersByUser.get(mobileNumber)) {
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
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // Study Time Analysis

  public query ({ caller }) func getAverageStudyTimePerDay() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access study analytics");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        var total = 0;
        var count = 0;

        switch (chaptersByUser.get(mobileNumber)) {
          case (?chapters) {
            chapters.values().forEach(
              func(chapter) {
                count += 1;
                total += chapter.studyTimeMinutes;
              }
            );
          };
          case (null) {};
        };

        if (count == 0) { return 0 };
        total / count;
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };

  // Tracking Study Streaks

  public shared ({ caller }) func recordStudySession(minutes : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can record study sessions");
    };

    switch (getAuthenticatedMobile(caller)) {
      case (?mobileNumber) {
        switch (dailyStudyGoalsByUser.get(mobileNumber)) {
          case (?goal) {
            if (minutes >= goal) {
              // TODO: Implement streak tracking once data structure is ready
            };
          };
          case (null) {};
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not authenticated");
      };
    };
  };
};
