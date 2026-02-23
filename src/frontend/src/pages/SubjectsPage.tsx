import { useState } from 'react';
import { useGetSubjects, useCreateSubject } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, FolderOpen } from 'lucide-react';
import SubjectCard from '../components/SubjectCard';

export default function SubjectsPage() {
  const [subjectName, setSubjectName] = useState('');
  const { data: subjects, isLoading, error } = useGetSubjects();
  const createSubjectMutation = useCreateSubject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    try {
      await createSubjectMutation.mutateAsync(subjectName.trim());
      setSubjectName('');
    } catch (err) {
      console.error('Failed to create subject:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load subjects. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const subjectsList = subjects ?? [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Subjects</h1>
        <p className="text-muted-foreground">Manage your subjects and track progress for each one</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-terracotta" />
            Add New Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input
                id="subjectName"
                type="text"
                placeholder="e.g., Mathematics, Physics, Computer Science"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                disabled={createSubjectMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={!subjectName.trim() || createSubjectMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createSubjectMutation.isPending ? 'Adding...' : 'Add Subject'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {subjectsList.length === 0 ? (
        <Alert className="bg-cream/50 border-border">
          <FolderOpen className="h-4 w-4" />
          <AlertDescription className="text-foreground">
            No subjects yet. Add your first subject above to start organizing your syllabus!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjectsList.map((subject) => (
            <SubjectCard key={subject.id.toString()} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
