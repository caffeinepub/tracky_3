import { useState } from 'react';
import { useGetChapterStats, useAddChapter } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, BookOpen } from 'lucide-react';
import StudyTimer from '../components/StudyTimer';
import StudyGoalCard from '../components/StudyGoalCard';

export default function SyllabusTrackerPage() {
  const [chapterName, setChapterName] = useState('');
  const { data: chapterStats, isLoading, error } = useGetChapterStats();
  const addChapterMutation = useAddChapter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim()) return;

    try {
      await addChapterMutation.mutateAsync(chapterName.trim());
      setChapterName('');
    } catch (err) {
      console.error('Failed to add chapter:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading syllabus tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load syllabus data. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = chapterStats ?? { total: 0, completed: 0, pending: 0 };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Syllabus Tracker</h1>
        <p className="text-muted-foreground">Manage your chapters and track study time</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudyTimer />
        <StudyGoalCard />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-terracotta" />
            Add New Chapter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapterName">Chapter Name</Label>
              <Input
                id="chapterName"
                type="text"
                placeholder="e.g., Introduction to Algorithms"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                disabled={addChapterMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={!chapterName.trim() || addChapterMutation.isPending}
              className="w-full sm:w-auto"
            >
              {addChapterMutation.isPending ? 'Adding...' : 'Add Chapter'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage" />
            Progress Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Chapters</p>
              </div>
              <div className="p-4 rounded-lg bg-sage/10">
                <p className="text-2xl font-bold text-sage">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="p-4 rounded-lg bg-terracotta/10">
                <p className="text-2xl font-bold text-terracotta">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
            </div>

            {stats.total === 0 && (
              <Alert className="bg-cream/50 border-border">
                <AlertDescription className="text-foreground">
                  No chapters yet. Add your first chapter above to start tracking your progress!
                </AlertDescription>
              </Alert>
            )}

            {stats.total > 0 && stats.completed === stats.total && (
              <Alert className="bg-sage/10 border-sage">
                <AlertDescription className="text-foreground font-medium">
                  🎉 Congratulations! You've completed all chapters!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
