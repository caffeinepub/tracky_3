import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatStudyTime } from '../utils/timeFormatters';

interface StudyTimeCardProps {
  totalMinutes: number;
}

export default function StudyTimeCard({ totalMinutes }: StudyTimeCardProps) {
  const formattedTime = formatStudyTime(totalMinutes);

  return (
    <Card className="shadow-soft hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta/20">
          <Clock className="h-4 w-4 text-terracotta" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-foreground">{formattedTime}</div>
          <p className="text-xs text-muted-foreground">Accumulated across all subjects</p>
        </div>
      </CardContent>
    </Card>
  );
}
