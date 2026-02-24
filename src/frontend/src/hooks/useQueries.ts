import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, AuthResult } from '../backend';

// Temporary types until backend is restored
export type ChapterStatus = { __kind__: 'pending' } | { __kind__: 'completed' };
export type Subject = {
  id: bigint;
  name: string;
  createdAt: bigint;
};
export type Chapter = {
  name: string;
  status: ChapterStatus;
  studyTimeMinutes: bigint;
  subjectId: bigint;
};

// OTP Authentication Mutations
export function useSendOTP() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (mobileNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendOTP(mobileNumber);
    },
  });
}

export function useVerifyOTP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mobileNumber, code }: { mobileNumber: string; code: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result: AuthResult = await actor.verifyOTP(mobileNumber, code);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Subject Queries - BACKEND NOT IMPLEMENTED
export function useGetSubjects() {
  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      console.warn('Backend method getSubjects() not implemented');
      return [];
    },
    enabled: false,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      console.warn('Backend method createSubject() not implemented');
      throw new Error('Backend functionality not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardProgress'] });
    },
  });
}

export function useGetSubjectProgress(subjectId: bigint) {
  return useQuery<bigint>({
    queryKey: ['subjectProgress', subjectId.toString()],
    queryFn: async () => {
      console.warn('Backend method getSubjectProgress() not implemented');
      return BigInt(0);
    },
    enabled: false,
  });
}

// Chapter Queries - BACKEND NOT IMPLEMENTED
export function useGetChaptersBySubject(subjectId: bigint | null) {
  return useQuery<Chapter[]>({
    queryKey: ['chapters', 'bySubject', subjectId?.toString()],
    queryFn: async () => {
      console.warn('Backend method getChaptersBySubject() not implemented');
      return [];
    },
    enabled: false,
  });
}

export function useAddChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, subjectId }: { name: string; subjectId: bigint }) => {
      console.warn('Backend method addChapter() not implemented');
      throw new Error('Backend functionality not available');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['chapters', 'bySubject', variables.subjectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dashboardProgress'] });
      queryClient.invalidateQueries({ queryKey: ['chapterStats'] });
      queryClient.invalidateQueries({ queryKey: ['subjectProgress', variables.subjectId.toString()] });
    },
  });
}

export function useUpdateChapterStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterName,
      newStatus,
      subjectId,
    }: {
      chapterName: string;
      newStatus: ChapterStatus;
      subjectId: bigint;
    }) => {
      console.warn('Backend method updateChapterStatus() not implemented');
      throw new Error('Backend functionality not available');
    },
    onMutate: async ({ chapterName, newStatus, subjectId }) => {
      await queryClient.cancelQueries({ queryKey: ['chapters', 'bySubject', subjectId.toString()] });

      const previousChapters = queryClient.getQueryData<Chapter[]>([
        'chapters',
        'bySubject',
        subjectId.toString(),
      ]);

      if (previousChapters) {
        queryClient.setQueryData<Chapter[]>(
          ['chapters', 'bySubject', subjectId.toString()],
          previousChapters.map((ch) => (ch.name === chapterName ? { ...ch, status: newStatus } : ch))
        );
      }

      return { previousChapters, subjectId };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousChapters) {
        queryClient.setQueryData(
          ['chapters', 'bySubject', context.subjectId.toString()],
          context.previousChapters
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', 'bySubject', variables.subjectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dashboardProgress'] });
      queryClient.invalidateQueries({ queryKey: ['chapterStats'] });
      queryClient.invalidateQueries({ queryKey: ['subjectProgress', variables.subjectId.toString()] });
    },
  });
}

export function useAddStudyTimeToChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterName,
      minutes,
      subjectId,
    }: {
      chapterName: string;
      minutes: number;
      subjectId: bigint;
    }) => {
      console.warn('Backend method addStudyTimeToChapter() not implemented');
      throw new Error('Backend functionality not available');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', 'bySubject', variables.subjectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['totalStudyTime'] });
    },
  });
}

// Study Goal Queries - BACKEND NOT IMPLEMENTED
export function useGetDailyStudyGoal() {
  return useQuery<bigint>({
    queryKey: ['dailyStudyGoal'],
    queryFn: async () => {
      console.warn('Backend method getDailyStudyGoal() not implemented');
      return BigInt(0);
    },
    enabled: false,
  });
}

export function useSetDailyStudyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (minutes: number) => {
      console.warn('Backend method setDailyStudyGoal() not implemented');
      throw new Error('Backend functionality not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStudyGoal'] });
    },
  });
}

// Dashboard Queries - BACKEND NOT IMPLEMENTED
export function useGetDashboardProgress() {
  return useQuery<bigint>({
    queryKey: ['dashboardProgress'],
    queryFn: async () => {
      console.warn('Backend method getDashboardProgress() not implemented');
      return BigInt(0);
    },
    enabled: false,
  });
}

export function useGetChapterStats() {
  return useQuery<[bigint, bigint, bigint]>({
    queryKey: ['chapterStats'],
    queryFn: async () => {
      console.warn('Backend method getChapterStats() not implemented');
      return [BigInt(0), BigInt(0), BigInt(0)];
    },
    enabled: false,
  });
}

export function useGetTotalStudyTime() {
  return useQuery<bigint>({
    queryKey: ['totalStudyTime'],
    queryFn: async () => {
      console.warn('Backend method getTotalStudyTime() not implemented');
      return BigInt(0);
    },
    enabled: false,
  });
}
