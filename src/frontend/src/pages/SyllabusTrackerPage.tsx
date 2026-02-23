import { useState } from 'react';
import { useGetSubjects, useGetChaptersBySubject, useAddChapter } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudyTimer from '../components/StudyTimer';
import StudyGoalCard from '../components/StudyGoalCard';
import ChapterList from '../components/ChapterList';

export default function SyllabusTrackerPage() {
  const [chapterName, setChapterName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterForTimer, setSelectedChapterForTimer] = useState<string | null>(null);
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjects();
  const { data: chapters, isLoading: chaptersLoading } = useGetChaptersBySubject(
    selectedSubjectId ? BigInt(selectedSubjectId) : null
  );
  const addChapterMutation = useAddChapter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim() || !selectedSubjectId) return;

    try {
      await addChapterMutation.mutateAsync({
        name: chapterName.trim(),
        subjectId: BigInt(selectedSubjectId),
      });
      setChapterName('');
    } catch (err) {
      console.error('Failed to add chapter:', err);
    }
  };

  if (subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading syllabus tracker...</p>
        </div>
      </div>
    );
  }

  const subjectsList = subjects ?? [];
  const chaptersList = chapters ?? [];
  const selectedSubject = subjectsList.find((s) => s.id.toString() === selectedSubjectId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Syllabus Tracker</h1>
        <p className="text-muted-foreground">Manage your chapters and track study time</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudyTimer selectedChapter={selectedChapterForTimer} />
        <StudyGoalCard />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage" />
            Select Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjectsList.length === 0 ? (
            <Alert className="bg-cream/50 border-border">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-foreground">
                No subjects available. Please create a subject first in the Subjects page.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="subjectSelect">Choose a subject to view its chapters</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger id="subjectSelect">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjectsList.map((subject) => (
                    <SelectItem key={subject.id.toString()} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSubjectId && (
        <>
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
                Chapters - {selectedSubject?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chaptersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ChapterList
                  chapters={chaptersList}
                  subjectId={BigInt(selectedSubjectId)}
                  onChapterSelect={setSelectedChapterForTimer}
                  selectedChapter={selectedChapterForTimer}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
