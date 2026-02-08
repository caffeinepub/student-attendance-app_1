import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
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
};
