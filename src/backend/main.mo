import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Student = {
    fullName : Text;
    rollNumber : Nat;
    parentMobileNumber : Text;
    className : Text;
    section : Text;
  };

  public type StoredStudent = {
    id : Nat;
    student : Student;
  };

  public type DailyRollCall = {
    date : Text;
    section : Text;
    className : Text;
    studentRecords : [Nat];
    wasPresent : [Bool];
  };

  public type RollCallRecord = {
    className : Text;
    section : Text;
    students : [Nat];
    attendance : [Bool];
  };

  public type RollCallDay = {
    year : Nat;
    month : Text;
    day : Nat;
    records : [RollCallRecord];
  };

  public type RollCallMonth = {
    year : Nat;
    month : Text;
    days : [RollCallDay];
  };

  public type RollCallPersistence = {
    months : [RollCallMonth];
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let students = Map.empty<Nat, Student>();
  let classSectionStudents = Map.empty<Text, Map.Map<Nat, Nat>>();
  let rollCalls = Map.empty<Text, DailyRollCall>();
  let authorizedTeachers = Map.empty<Principal, Bool>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var idCounter = 0;

  //// User Profile Management Functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  /// Student Management Functions

  public shared ({ caller }) func addStudent(student : Student) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add students");
    };

    if (student.fullName == "") {
      Runtime.trap("Student name cannot be empty");
    };

    let newId = idCounter;
    idCounter += 1;

    students.add(newId, student);

    if (not classSectionStudents.containsKey(student.className # "-" # student.section)) {
      classSectionStudents.add(student.className # "-" # student.section, Map.empty<Nat, Nat>());
    };

    let classStudents = switch (classSectionStudents.get(student.className # "-" # student.section)) {
      case (null) { Map.empty<Nat, Nat>() };
      case (?existing) { existing };
    };
    classStudents.add(newId, newId);

    newId;
  };

  public shared ({ caller }) func updateStudent(id : Nat, student : Student) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update students");
    };
    students.add(id, student);
  };

  public query ({ caller }) func getClassSectionStudents(className : Text, section : Text) : async [(Nat, Student)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view student data");
    };
    switch (classSectionStudents.get(className # "-" # section)) {
      case (null) { [] };
      case (?sectionStudents) {
        let iter = sectionStudents.entries().flatMap(
          func((id, _)) { students.entries().filter(func((studentId, _)) { return studentId == id }) }
        );
        iter.toArray();
      };
    };
  };

  public query ({ caller }) func getAllStudents() : async [StoredStudent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view student data");
    };
    students.entries().toArray().map(func((id, student)) { { id; student } });
  };

  public query ({ caller }) func getStudent(id : Nat) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view student data");
    };
    students.get(id);
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete students");
    };

    students.remove(id);

    let entries = classSectionStudents.entries().toArray();
    for ((_, section) in entries.values()) {
      section.remove(id);
    };
  };

  /// Roll Call Management Functions

  public shared ({ caller }) func submitRollCall(year : Nat, month : Text, day : Nat, section : Text, className : Text, studentRecords : [Nat], wasPresent : [Bool]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit roll calls");
    };

    let date = year.toText() # "-" # month # "-" # day.toText();
    let dailyRollCall : DailyRollCall = {
      date;
      section;
      className;
      studentRecords;
      wasPresent;
    };
    rollCalls.add(date, dailyRollCall);
  };

  public query ({ caller }) func getDailyRollCall(year : Nat, month : Text, day : Nat, _ : Text, _ : Text) : async ?DailyRollCall {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view roll call data");
    };
    let date = year.toText() # "-" # month # "-" # day.toText();
    rollCalls.get(date);
  };

  public query ({ caller }) func getMonthlyRollCall(year : Nat, month : Text, _ : Text, _ : Text) : async [DailyRollCall] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view roll call data");
    };

    let entries = rollCalls.entries().toArray();

    let filtered = entries.filter(
      func((date, _)) {
        let components = date.split(#char '-').toArray();
        components.size() >= 3 and
        components[0] == year.toText() and
        components[1] == month
      }
    );

    filtered.map(func((_, rollCall)) { rollCall });
  };

  public query ({ caller }) func getMonthlyClassSectionRollCall(_year : Nat, _month : Text, _ : Text, _ : Text) : async [DailyRollCall] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view roll call data");
    };
    let entries = rollCalls.entries().toArray();
    entries.map(func((_, rollCall)) { rollCall });
  };
};
