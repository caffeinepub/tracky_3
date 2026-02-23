import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

interface ChapterStatsCardProps {
  completedCount: number;
  pendingCount: number;
}

export default function ChapterStatsCard({ completedCount, pendingCount }: ChapterStatsCardProps) {
  const totalChapters = completedCount + pendingCount;

  return (
    <Card className="shadow-soft hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Chapter Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sage/20">
                <CheckCircle2 className="h-4 w-4 text-sage" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-sage">{completedCount}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta/20">
                <Circle className="h-4 w-4 text-terracotta" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-terracotta">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalChapters}</span> chapters
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
