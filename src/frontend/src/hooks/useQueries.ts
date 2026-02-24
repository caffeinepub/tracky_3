import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ChapterStatus, Subject, Chapter } from '../backend';

// OTP Authentication Queries
export function useRequestOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (mobileNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestOtp(mobileNumber);
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ mobileNumber, otp }: { mobileNumber: string; otp: string }) => {
      if (!actor) throw new Error('Actor not available');
      const otpNumber = BigInt(otp);
      return actor.verifyOtp(mobileNumber, otpNumber);
    },
  });
}

export function useIsRegistered() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (mobileNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      const mobileNumberBigInt = BigInt(mobileNumber);
      return actor.isRegistered(mobileNumberBigInt);
    },
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mobileNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      const mobileNumberBigInt = BigInt(mobileNumber);
      return actor.createProfile(mobileNumberBigInt);
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

// Subject Queries
export function useGetSubjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSubjects();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSubject(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardProgress'] });
    },
  });
}

export function useGetSubjectProgress(subjectId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['subjectProgress', subjectId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSubjectProgress(subjectId);
    },
    enabled: !!actor && !actorFetching && subjectId !== undefined,
    retry: false,
  });
}

// Chapter Queries
export function useGetChaptersBySubject(subjectId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Chapter[]>({
    queryKey: ['chapters', 'bySubject', subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === null) throw new Error('Actor or subject not available');
      return actor.getChaptersBySubject(subjectId);
    },
    enabled: !!actor && !actorFetching && subjectId !== null,
    retry: false,
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, subjectId }: { name: string; subjectId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChapter(name, subjectId);
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
  const { actor } = useActor();
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateChapterStatus(chapterName, newStatus);
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
    onError: (err, variables, context) => {
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
  const { actor } = useActor();
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
      if (!actor) throw new Error('Actor not available');
      return actor.addStudyTimeToChapter(chapterName, BigInt(minutes));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', 'bySubject', variables.subjectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['totalStudyTime'] });
    },
  });
}

// Study Goal Queries
export function useGetDailyStudyGoal() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['dailyStudyGoal'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyStudyGoal();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSetDailyStudyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (minutes: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDailyStudyGoal(BigInt(minutes));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStudyGoal'] });
    },
  });
}

// Dashboard Queries
export function useGetDashboardProgress() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['dashboardProgress'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardProgress();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetChapterStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[bigint, bigint, bigint]>({
    queryKey: ['chapterStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getChapterStats();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetTotalStudyTime() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalStudyTime'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTotalStudyTime();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
