import ProgressCard from '../components/ProgressCard';
import StudyTimeCard from '../components/StudyTimeCard';
import ChapterStatsCard from '../components/ChapterStatsCard';
import { useGetDashboardProgress, useGetChapterStats, useGetTotalStudyTime } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: progressPercentage, isLoading: progressLoading, error: progressError } = useGetDashboardProgress();
  const { data: chapterStats, isLoading: statsLoading, error: statsError } = useGetChapterStats();
  const { data: totalStudyTime, isLoading: timeLoading, error: timeError } = useGetTotalStudyTime();

  const isLoading = progressLoading || statsLoading || timeLoading;
  const error = progressError || statsError || timeError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load dashboard data. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const progress = progressPercentage ?? 0;
  const studyMinutes = totalStudyTime ?? 0;
  const stats = chapterStats ?? { total: 0, completed: 0, pending: 0 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and study time</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProgressCard percentage={progress} />
        <StudyTimeCard totalMinutes={studyMinutes} />
        <ChapterStatsCard completedCount={stats.completed} pendingCount={stats.pending} />
      </div>

      {stats.total === 0 && (
        <Alert className="bg-sage/10 border-sage">
          <AlertDescription className="text-foreground">
            Welcome to Tracky! Start by visiting the Syllabus Tracker to add chapters and track your progress.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
