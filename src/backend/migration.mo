import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";

module {
  type OldStudent = {
    id : Nat;
    fullName : Text;
    rollNumber : Nat;
    parentMobileNumber : Text;
    className : Text;
    section : Text;
  };

  type OldDailyRollCall = {
    date : Text;
    section : Text;
    className : Text;
    studentIds : [Nat];
    wasPresent : [Bool];
  };

  type OldActor = {
    students : Map.Map<Nat, OldStudent>;
    rollCalls : Map.Map<Text, OldDailyRollCall>;
    nextStudentId : Nat;
  };

  type NewStudent = {
    fullName : Text;
    rollNumber : Nat;
    parentMobileNumber : Text;
    className : Text;
    section : Text;
  };

  type NewDailyRollCall = {
    date : Text;
    section : Text;
    className : Text;
    studentRecords : [Nat];
    wasPresent : [Bool];
  };

  type NewActor = {
    students : Map.Map<Nat, NewStudent>;
    rollCalls : Map.Map<Text, NewDailyRollCall>;
    classSectionStudents : Map.Map<Text, Map.Map<Nat, Nat>>;
    idCounter : Nat;
  };

  func buildClassSectionMap(students : Map.Map<Nat, OldStudent>) : Map.Map<Text, Map.Map<Nat, Nat>> {
    let classSectionMap = Map.empty<Text, Map.Map<Nat, Nat>>();

    let entries = students.entries().toArray();
    for ((id, student) in entries.values()) {
      let sectionKey = student.className # "-" # student.section;

      if (not classSectionMap.containsKey(sectionKey)) {
        classSectionMap.add(sectionKey, Map.empty<Nat, Nat>());
      };

      switch (classSectionMap.get(sectionKey)) {
        case (null) {
          let newSection = Map.empty<Nat, Nat>();
          newSection.add(id, id);
          classSectionMap.add(sectionKey, newSection);
        };
        case (?existingSection) {
          existingSection.add(id, id);
        };
      };
    };
    classSectionMap;
  };

  func convertOldRollCalls(oldRollCalls : Map.Map<Text, OldDailyRollCall>) : Map.Map<Text, NewDailyRollCall> {
    oldRollCalls.map<Text, OldDailyRollCall, NewDailyRollCall>(
      func(_key, oldRollCall) {
        {
          oldRollCall with
          studentRecords = oldRollCall.studentIds;
        };
      }
    );
  };

  public func run(old : OldActor) : NewActor {
    let newStudents = old.students.map<Nat, OldStudent, NewStudent>(
      func(_id, oldStudent) {
        oldStudent;
      }
    );

    let classSectionStudents = buildClassSectionMap(old.students);
    let convertedRollCalls = convertOldRollCalls(old.rollCalls);

    {
      students = newStudents;
      rollCalls = convertedRollCalls;
      classSectionStudents;
      idCounter = old.students.size();
    };
  };
};
