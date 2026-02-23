# Specification

## Summary
**Goal:** Add a syllabus tracker with chapters that users can create, mark as Pending/Completed, and track study time for each chapter using a timer. Update dashboard to show real progress data.

**Planned changes:**
- Create backend data model for chapters with name, status (Pending/Completed), and accumulated study time in minutes
- Implement backend methods to add chapters, update status, and track study time per chapter with user access control
- Create syllabus tracker page showing all chapters with name, status badge, and individual study time
- Add form to manually create new chapters and status toggle on each chapter
- Build study timer component with Start/Stop buttons and chapter selection to associate timed sessions with specific chapters
- Add daily study goal setting functionality with progress indicator
- Update dashboard to calculate progress from actual chapter completion data (completed/total chapters)
- Update dashboard statistics to display real chapter counts (total, completed, pending) and sum of all chapter study times

**User-visible outcome:** Users can manually add chapters to track their syllabus, mark chapters as Pending or Completed, use a study timer to log time for specific chapters, set daily study goals, and view real progress reports on the dashboard showing completion percentages, chapter counts, and total study time.
