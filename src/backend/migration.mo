import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type Student = {
    fullName : Text;
    rollNumber : Nat;
    parentMobileNumber : Text;
    className : Text;
    section : Text;
  };

  type StoredStudent = {
    id : Nat;
    student : Student;
  };

  type DailyRollCall = {
    date : Text;
    section : Text;
    className : Text;
    studentRecords : [Nat];
    wasPresent : [Bool];
  };

  type RollCallRecord = {
    className : Text;
    section : Text;
    students : [Nat];
    attendance : [Bool];
  };

  type RollCallDay = {
    year : Nat;
    month : Text;
    day : Nat;
    records : [RollCallRecord];
  };

  type RollCallMonth = {
    year : Nat;
    month : Text;
    days : [RollCallDay];
  };

  type RollCallPersistence = {
    months : [RollCallMonth];
  };

  type UserProfile = {
    name : Text;
    role : Text;
  };

  type OldActor = {
    students : Map.Map<Nat, Student>;
    rollCalls : Map.Map<Text, DailyRollCall>;
    classSectionStudents : Map.Map<Text, Map.Map<Nat, Nat>>;
    authorizedTeachers : Map.Map<Principal, Bool>;
    userProfiles : Map.Map<Principal, UserProfile>;
    idCounter : Nat;
  };

  type NewActor = {
    students : Map.Map<Nat, Student>;
    rollCalls : Map.Map<Text, DailyRollCall>;
    classSectionStudents : Map.Map<Text, Map.Map<Nat, Nat>>;
    authorizedTeachers : Map.Map<Principal, Bool>;
    userProfiles : Map.Map<Principal, UserProfile>;
    idCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
