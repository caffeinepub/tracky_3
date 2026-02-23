import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ChapterStatus, Subject, Chapter } from '../backend';

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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chapters', 'bySubject', subjectId.toString()] });

      // Snapshot previous value
      const previousChapters = queryClient.getQueryData<Chapter[]>([
        'chapters',
        'bySubject',
        subjectId.toString(),
      ]);

      // Optimistically update
      if (previousChapters) {
        queryClient.setQueryData<Chapter[]>(
          ['chapters', 'bySubject', subjectId.toString()],
          previousChapters.map((ch) => (ch.name === chapterName ? { ...ch, status: newStatus } : ch))
        );
      }

      return { previousChapters, subjectId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
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

export function useAddStudyTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterName, minutes }: { chapterName: string; minutes: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStudyTimeToChapter(chapterName, BigInt(minutes));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totalStudyTime'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
}

// Study Goal Queries
export function useGetDailyGoal() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['dailyGoal'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyStudyGoal();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSetDailyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (minutes: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDailyStudyGoal(BigInt(minutes));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyGoal'] });
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
