import { createContext, useContext, useState, ReactNode } from 'react';

interface AttendanceSessionContextType {
  selectedClass: string | null;
  selectedSection: string | null;
  selectedDate: string | null;
  setClassSection: (classValue: string, section: string) => void;
  setSelectedDate: (date: string) => void;
}

const AttendanceSessionContext = createContext<AttendanceSessionContextType | undefined>(undefined);

export function AttendanceSessionProvider({ children }: { children: ReactNode }) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const setClassSection = (classValue: string, section: string) => {
    setSelectedClass(classValue);
    setSelectedSection(section);
  };

  return (
    <AttendanceSessionContext.Provider
      value={{
        selectedClass,
        selectedSection,
        selectedDate,
        setClassSection,
        setSelectedDate,
      }}
    >
      {children}
    </AttendanceSessionContext.Provider>
  );
}

export function useAttendanceSession() {
  const context = useContext(AttendanceSessionContext);
  if (!context) {
    throw new Error('useAttendanceSession must be used within AttendanceSessionProvider');
  }
  return context;
}
