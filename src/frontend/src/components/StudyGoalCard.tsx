import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2 } from 'lucide-react';
import { useGetDailyGoal, useSetDailyGoal, useGetTotalStudyTime } from '../hooks/useQueries';
import { formatStudyTime } from '../utils/timeFormatters';

export default function StudyGoalCard() {
  const { data: dailyGoal } = useGetDailyGoal();
  const { data: totalStudyTime } = useGetTotalStudyTime();
  const setDailyGoalMutation = useSetDailyGoal();
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (dailyGoal !== undefined && dailyGoal > 0) {
      setGoalInput(Number(dailyGoal).toString());
    }
  }, [dailyGoal]);

  const handleSetGoal = async () => {
    const minutes = parseInt(goalInput, 10);
    if (isNaN(minutes) || minutes <= 0) return;

    try {
      await setDailyGoalMutation.mutateAsync(minutes);
    } catch (err) {
      console.error('Failed to set daily goal:', err);
    }
  };

  const currentGoal = Number(dailyGoal ?? 0n);
  const currentTime = Number(totalStudyTime ?? 0n);
  const progressPercentage = currentGoal > 0 ? Math.min((currentTime / currentGoal) * 100, 100) : 0;
  const goalReached = currentGoal > 0 && currentTime >= currentGoal;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-sage" />
          Daily Study Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="goalInput" className="text-sm font-medium text-foreground">
            Goal (minutes)
          </label>
          <div className="flex gap-2">
            <Input
              id="goalInput"
              type="number"
              min="1"
              placeholder="e.g., 120"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              disabled={setDailyGoalMutation.isPending}
            />
            <Button
              onClick={handleSetGoal}
              disabled={!goalInput || setDailyGoalMutation.isPending}
              className="whitespace-nowrap"
            >
              {setDailyGoalMutation.isPending ? 'Saving...' : 'Set Goal'}
            </Button>
          </div>
        </div>

        {currentGoal > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">
                {formatStudyTime(currentTime)} / {formatStudyTime(currentGoal)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {goalReached && (
              <div className="flex items-center gap-2 text-sage font-medium text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Daily goal reached! 🎉</span>
              </div>
            )}
          </div>
        )}

        {currentGoal === 0 && (
          <p className="text-sm text-muted-foreground">Set a daily study goal to track your progress.</p>
        )}
      </CardContent>
    </Card>
  );
}
