import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, Timer } from 'lucide-react';

type StopwatchState = 'idle' | 'running' | 'paused';

export default function DashboardStopwatch() {
  const [state, setState] = useState<StopwatchState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setElapsedSeconds(0);
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleResume = () => {
    setState('running');
  };

  const handleStop = () => {
    setState('idle');
    setElapsedSeconds(0);
  };

  const getStatusText = () => {
    if (state === 'paused') return 'Paused';
    if (state === 'running') return 'Running...';
    return 'Ready';
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-terracotta" />
          Stopwatch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground mb-2 font-mono">{formatTime(elapsedSeconds)}</div>
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
        </div>

        <div className="flex gap-2">
          {state === 'idle' ? (
            <Button onClick={handleStart} className="flex-1 gap-2 bg-sage hover:bg-sage/90">
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : state === 'paused' ? (
            <>
              <Button onClick={handleResume} className="flex-1 gap-2 bg-sage hover:bg-sage/90">
                <Play className="w-4 h-4" />
                Resume
              </Button>
              <Button onClick={handleStop} className="flex-1 gap-2 bg-terracotta hover:bg-terracotta/90">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handlePause} className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button onClick={handleStop} className="flex-1 gap-2 bg-terracotta hover:bg-terracotta/90">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
