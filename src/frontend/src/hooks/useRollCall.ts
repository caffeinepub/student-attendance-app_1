import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AttendanceStatus } from '../lib/types';
import { DailyRollCall } from '../backend';

export function useGetRollCallForDay(date: string, className: string, section: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Record<string, AttendanceStatus>>({
    queryKey: ['rollCall', date, className, section],
    queryFn: async () => {
      if (!actor) return {};
      
      // Parse date string (YYYY-MM-DD)
      const [year, month, day] = date.split('-');
      const result = await actor.getDailyRollCall(
        BigInt(year),
        month,
        BigInt(day),
        className,
        section
      );
      
      if (!result) return {};
      
      // Convert backend format to UI format
      const attendance: Record<string, AttendanceStatus> = {};
      result.studentRecords.forEach((studentId, index) => {
        attendance[studentId.toString()] = result.wasPresent[index] ? 'present' : 'absent';
      });
      
      return attendance;
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
      
      // Parse date string (YYYY-MM-DD)
      const [year, month, day] = date.split('-');
      
      // Convert UI format to backend format
      const studentRecords: bigint[] = [];
      const wasPresent: boolean[] = [];
      
      Object.entries(attendance).forEach(([studentId, status]) => {
        studentRecords.push(BigInt(studentId));
        wasPresent.push(status === 'present');
      });
      
      await actor.submitRollCall(
        BigInt(year),
        month,
        BigInt(day),
        section,
        className,
        studentRecords,
        wasPresent
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['rollCall', variables.date, variables.className, variables.section] 
      });
      queryClient.invalidateQueries({
        queryKey: ['rollCall', 'monthly']
      });
    },
  });
}

export function useGetMonthlyRollCall(year: number, month: string, className: string, section: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyRollCall[]>({
    queryKey: ['rollCall', 'monthly', year, month, className, section],
    queryFn: async () => {
      if (!actor) return [];
      
      return actor.getMonthlyClassSectionRollCall(
        BigInt(year),
        month,
        className,
        section
      );
    },
    enabled: !!actor && !actorFetching && !!year && !!month && !!className && !!section,
  });
}
