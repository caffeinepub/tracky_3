import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, Clock, AlertCircle, Pause } from 'lucide-react';
import { useAddStudyTime } from '../hooks/useQueries';

interface StudyTimerProps {
  selectedChapter?: string | null;
  subjectId?: bigint | null;
}

export default function StudyTimer({ selectedChapter, subjectId }: StudyTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const addStudyTimeMutation = useAddStudyTime();

  // Reset timer when selected chapter changes
  useEffect(() => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
  }, [selectedChapter]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedChapter?.trim()) return;
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(Date.now());
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setIsPaused(false);

    if (elapsedSeconds > 0 && selectedChapter?.trim() && subjectId !== null && subjectId !== undefined) {
      const minutes = Math.ceil(elapsedSeconds / 60);
      try {
        await addStudyTimeMutation.mutateAsync({
          chapterName: selectedChapter.trim(),
          minutes,
          subjectId,
        });
        setElapsedSeconds(0);
        setStartTime(null);
      } catch (err) {
        console.error('Failed to save study time:', err);
      }
    } else {
      setElapsedSeconds(0);
      setStartTime(null);
    }
  };

  const getStatusText = () => {
    if (isPaused) return 'Timer paused';
    if (isRunning) return 'Timer is running...';
    return 'Ready to start studying';
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground mb-2 font-mono">{formatTime(elapsedSeconds)}</div>
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          {selectedChapter && (
            <p className="text-xs text-muted-foreground mt-1">Tracking: {selectedChapter}</p>
          )}
        </div>

        {!selectedChapter && !isRunning && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Select a chapter from the list below to start tracking time.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!isRunning && !isPaused ? (
            <Button
              onClick={handleStart}
              disabled={!selectedChapter?.trim()}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : isPaused ? (
            <>
              <Button
                onClick={handleResume}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4" />
                Resume
              </Button>
              <Button
                onClick={handleStop}
                disabled={addStudyTimeMutation.isPending}
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
              >
                <Square className="w-4 h-4" />
                {addStudyTimeMutation.isPending ? 'Saving...' : 'Stop'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handlePause}
                className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button
                onClick={handleStop}
                disabled={addStudyTimeMutation.isPending}
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
              >
                <Square className="w-4 h-4" />
                {addStudyTimeMutation.isPending ? 'Saving...' : 'Stop'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
