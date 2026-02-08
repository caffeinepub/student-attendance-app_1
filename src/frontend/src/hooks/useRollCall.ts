import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AttendanceStatus } from '../lib/types';

// Temporary localStorage-based implementation until backend roll call methods are added
const ROLL_CALL_STORAGE_KEY = 'attendance_roll_calls';

interface StoredRollCall {
  date: string;
  className: string;
  section: string;
  attendance: Record<string, AttendanceStatus>;
}

function getRollCallsFromStorage(): StoredRollCall[] {
  try {
    const stored = localStorage.getItem(ROLL_CALL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRollCallsToStorage(rollCalls: StoredRollCall[]): void {
  try {
    localStorage.setItem(ROLL_CALL_STORAGE_KEY, JSON.stringify(rollCalls));
  } catch (err) {
    console.error('Failed to save roll calls to storage:', err);
  }
}

function findRollCall(date: string, className: string, section: string): Record<string, AttendanceStatus> {
  const rollCalls = getRollCallsFromStorage();
  const found = rollCalls.find(
    rc => rc.date === date && rc.className === className && rc.section === section
  );
  return found ? found.attendance : {};
}

function saveRollCall(date: string, className: string, section: string, attendance: Record<string, AttendanceStatus>): void {
  const rollCalls = getRollCallsFromStorage();
  const index = rollCalls.findIndex(
    rc => rc.date === date && rc.className === className && rc.section === section
  );
  
  const newRollCall: StoredRollCall = { date, className, section, attendance };
  
  if (index >= 0) {
    rollCalls[index] = newRollCall;
  } else {
    rollCalls.push(newRollCall);
  }
  
  saveRollCallsToStorage(rollCalls);
}

export function useGetRollCallForDay(date: string, className: string, section: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Record<string, AttendanceStatus>>({
    queryKey: ['rollCall', date, className, section],
    queryFn: async () => {
      // TODO: Replace with backend call when getRollCallForDay is implemented
      // const result = await actor.getRollCallForDay(date, className, section);
      return findRollCall(date, className, section);
    },
    enabled: !!actor && !actorFetching && !!date && !!className && !!section,
  });
}

export function useSaveRollCallForDay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      className,
      section,
      attendance,
    }: {
      date: string;
      className: string;
      section: string;
      attendance: Record<string, AttendanceStatus>;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // TODO: Replace with backend call when saveRollCallForDay is implemented
      // const studentIds: bigint[] = [];
      // const wasPresent: boolean[] = [];
      // Object.entries(attendance).forEach(([studentId, status]) => {
      //   studentIds.push(BigInt(studentId));
      //   wasPresent.push(status === 'present');
      // });
      // await actor.saveRollCallForDay(date, className, section, studentIds, wasPresent);
      
      saveRollCall(date, className, section, attendance);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['rollCall', variables.date, variables.className, variables.section] 
      });
    },
  });
}
