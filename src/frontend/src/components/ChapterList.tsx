import { Checkbox } from '@/components/ui/checkbox';
import { Check, Clock } from 'lucide-react';
import { useUpdateChapterStatus, Chapter, ChapterStatus } from '../hooks/useQueries';
import { formatStudyTime } from '../utils/timeFormatters';

interface ChapterListProps {
  chapters: Chapter[];
  subjectId: bigint;
  onChapterSelect?: (chapterName: string) => void;
  selectedChapter?: string | null;
}

export default function ChapterList({ chapters, subjectId, onChapterSelect, selectedChapter }: ChapterListProps) {
  const updateStatusMutation = useUpdateChapterStatus();

  const handleStatusChange = async (chapterName: string, currentStatus: ChapterStatus) => {
    const newStatus: ChapterStatus = currentStatus.__kind__ === 'completed' 
      ? { __kind__: 'pending' } 
      : { __kind__: 'completed' };
    try {
      await updateStatusMutation.mutateAsync({
        chapterName,
        newStatus,
        subjectId,
      });
    } catch (err) {
      console.error('Failed to update chapter status:', err);
    }
  };

  const incompleteChapters = chapters.filter((ch) => ch.status.__kind__ === 'pending');
  const completedChapters = chapters.filter((ch) => ch.status.__kind__ === 'completed');

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No chapters added yet. Create your first chapter above!</p>
      </div>
    );
  }

  const renderChapter = (chapter: Chapter) => {
    const isCompleted = chapter.status.__kind__ === 'completed';
    const isSelected = selectedChapter === chapter.name;
    const studyTime = Number(chapter.studyTimeMinutes);

    return (
      <div
        key={chapter.name}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
          isSelected
            ? 'bg-sage/10 border-sage'
            : isCompleted
            ? 'bg-muted/30 border-border'
            : 'bg-background border-border hover:bg-muted/20'
        } ${onChapterSelect ? 'cursor-pointer' : ''}`}
        onClick={() => !isCompleted && onChapterSelect?.(chapter.name)}
      >
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => handleStatusChange(chapter.name, chapter.status)}
          disabled={updateStatusMutation.isPending}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {chapter.name}
            </span>
            {isCompleted && <Check className="w-4 h-4 text-sage flex-shrink-0" />}
            {isSelected && <span className="text-xs bg-sage text-white px-2 py-0.5 rounded">Tracking</span>}
          </div>
          {studyTime > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatStudyTime(studyTime)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {incompleteChapters.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Incomplete</h3>
          <div className="space-y-2">{incompleteChapters.map(renderChapter)}</div>
        </div>
      )}

      {completedChapters.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completed</h3>
          <div className="space-y-2">{completedChapters.map(renderChapter)}</div>
        </div>
      )}
    </div>
  );
}
