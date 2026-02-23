import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, Clock, AlertCircle } from 'lucide-react';
import { useAddStudyTime } from '../hooks/useQueries';

export default function StudyTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chapterName, setChapterName] = useState('');
  const addStudyTimeMutation = useAddStudyTime();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!chapterName.trim()) return;
    setIsRunning(true);
  };

  const handleStop = async () => {
    setIsRunning(false);

    if (elapsedSeconds > 0 && chapterName.trim()) {
      const minutes = Math.ceil(elapsedSeconds / 60);
      try {
        await addStudyTimeMutation.mutateAsync({
          chapterName: chapterName.trim(),
          minutes,
        });
        setElapsedSeconds(0);
        setChapterName('');
      } catch (err) {
        console.error('Failed to save study time:', err);
      }
    } else {
      setElapsedSeconds(0);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-terracotta" />
          Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground mb-2 font-mono">{formatTime(elapsedSeconds)}</div>
          <p className="text-sm text-muted-foreground">
            {isRunning ? 'Timer is running...' : 'Ready to start studying'}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="timerChapter" className="text-sm font-medium text-foreground">
            Chapter Name
          </label>
          <input
            id="timerChapter"
            type="text"
            placeholder="Enter chapter name to track time"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {!chapterName.trim() && !isRunning && (
          <Alert className="bg-cream/50 border-border">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">Enter a chapter name before starting the timer.</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!chapterName.trim()}
              className="flex-1 gap-2 bg-sage hover:bg-sage/90"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={addStudyTimeMutation.isPending}
              className="flex-1 gap-2 bg-terracotta hover:bg-terracotta/90"
            >
              <Square className="w-4 h-4" />
              {addStudyTimeMutation.isPending ? 'Saving...' : 'Stop'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
