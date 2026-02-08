import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Student, StoredStudent } from '../backend';

export function useGetClassSectionStudents(className: string, section: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoredStudent[]>({
    queryKey: ['students', className, section],
    queryFn: async () => {
      if (!actor) return [];
      const tuples = await actor.getClassSectionStudents(className, section);
      // Convert [bigint, Student][] to StoredStudent[]
      return tuples.map(([id, student]) => ({ id, student }));
    },
    enabled: !!actor && !actorFetching && !!className && !!section,
  });
}

export function useGetAllStudents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoredStudent[]>({
    queryKey: ['students', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      rollNumber,
      parentMobile,
      className,
      section,
    }: {
      name: string;
      rollNumber: string;
      parentMobile: string;
      className: string;
      section: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const newStudent: Student = {
        fullName: name,
        rollNumber: BigInt(rollNumber),
        parentMobileNumber: parentMobile,
        className,
        section,
      };

      // Backend generates and returns the ID
      return actor.addStudent(newStudent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.className, variables.section] });
      queryClient.invalidateQueries({ queryKey: ['students', 'all'] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (student: {
      id: bigint;
      fullName: string;
      rollNumber: string;
      parentMobileNumber: string;
      className: string;
      section: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const updatedStudent: Student = {
        fullName: student.fullName,
        rollNumber: BigInt(student.rollNumber),
        parentMobileNumber: student.parentMobileNumber,
        className: student.className,
        section: student.section,
      };

      return actor.updateStudent(student.id, updatedStudent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.className, variables.section] });
      queryClient.invalidateQueries({ queryKey: ['students', 'all'] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      className,
      section,
    }: {
      studentId: bigint;
      className: string;
      section: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteStudent(studentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.className, variables.section] });
      queryClient.invalidateQueries({ queryKey: ['students', 'all'] });
    },
  });
}
