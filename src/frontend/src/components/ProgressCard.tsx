import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  percentage: number;
}

export default function ProgressCard({ percentage }: ProgressCardProps) {
  return (
    <Card className="shadow-soft hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sage/20">
          <TrendingUp className="h-4 w-4 text-sage" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-foreground">{percentage.toFixed(0)}%</div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">Across all subjects</p>
        </div>
      </CardContent>
    </Card>
  );
}
