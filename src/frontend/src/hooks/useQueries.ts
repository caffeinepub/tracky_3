import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ChapterStatus } from '../backend';

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

// Chapter Queries
export interface Chapter {
  name: string;
  status: ChapterStatus;
  studyTimeMinutes: number;
}

export function useGetChapters() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Chapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have a getChapters method, so we'll derive from stats
      // For now, return empty array - chapters are managed through mutations
      return [];
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChapter(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardProgress'] });
      queryClient.invalidateQueries({ queryKey: ['chapterStats'] });
      queryClient.invalidateQueries({ queryKey: ['totalStudyTime'] });
    },
  });
}

export function useUpdateChapterStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterName, newStatus }: { chapterName: string; newStatus: ChapterStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateChapterStatus(chapterName, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardProgress'] });
      queryClient.invalidateQueries({ queryKey: ['chapterStats'] });
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
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['totalStudyTime'] });
      queryClient.invalidateQueries({ queryKey: ['chapterStats'] });
    },
  });
}

// Study Goal Queries
export function useGetDailyGoal() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['dailyGoal'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const goal = await actor.getDailyStudyGoal();
      return Number(goal);
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

  return useQuery<number>({
    queryKey: ['dashboardProgress'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const progress = await actor.getDashboardProgress();
      return Number(progress);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetChapterStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ total: number; completed: number; pending: number }>({
    queryKey: ['chapterStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const [total, completed, pending] = await actor.getChapterStats();
      return {
        total: Number(total),
        completed: Number(completed),
        pending: Number(pending),
      };
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetTotalStudyTime() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['totalStudyTime'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const time = await actor.getTotalStudyTime();
      return Number(time);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
