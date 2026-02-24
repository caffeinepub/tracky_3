import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FolderOpen } from 'lucide-react';
import { useGetSubjectProgress, Subject } from '../hooks/useQueries';

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const { data: progress, isLoading } = useGetSubjectProgress(subject.id);

  const progressPercentage = Number(progress ?? 0n);
  const createdDate = new Date(Number(subject.createdAt) / 1000000).toLocaleDateString();

  return (
    <Card className="shadow-soft hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold line-clamp-1">{subject.name}</CardTitle>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sage/20 flex-shrink-0">
          <FolderOpen className="h-4 w-4 text-sage" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="h-2 bg-muted animate-pulse rounded-full"></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">{progressPercentage}%</span>
                <span className="text-xs text-muted-foreground">Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </>
          )}
          <p className="text-xs text-muted-foreground">Created on {createdDate}</p>
        </div>
      </CardContent>
    </Card>
  );
}
