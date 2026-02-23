import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import { useGetSubjects, useGetChapterStats, useGetDashboardProgress } from '../hooks/useQueries';

export default function ProgressReport() {
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjects();
  const { data: chapterStats, isLoading: statsLoading } = useGetChapterStats();
  const { data: overallProgress, isLoading: progressLoading } = useGetDashboardProgress();

  const isLoading = subjectsLoading || statsLoading || progressLoading;

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-terracotta" />
            Progress Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSubjects = subjects?.length ?? 0;
  const stats = chapterStats
    ? {
        total: Number(chapterStats[0]),
        completed: Number(chapterStats[1]),
        pending: Number(chapterStats[2]),
      }
    : { total: 0, completed: 0, pending: 0 };
  const overallPercentage = Number(overallProgress ?? 0n);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-terracotta" />
          Progress Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{totalSubjects}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Subjects</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Chapters</p>
            </div>
            <div className="p-4 rounded-lg bg-sage/10 text-center">
              <p className="text-2xl font-bold text-sage">{stats.completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="p-4 rounded-lg bg-terracotta/10 text-center">
              <p className="text-2xl font-bold text-terracotta">{stats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Remaining</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 text-center">
              <p className="text-2xl font-bold text-primary">{overallPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">Overall</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Overall Completion</span>
              <span className="text-muted-foreground">{overallPercentage}%</span>
            </div>
            <Progress value={overallPercentage} className="h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
