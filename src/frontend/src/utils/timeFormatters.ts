/**
 * Formats study time from minutes to a readable string format
 * @param totalMinutes - Total minutes to format
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatStudyTime(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return '0m';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Formats study time with full words for better readability
 * @param totalMinutes - Total minutes to format
 * @returns Formatted string like "2 hours 30 minutes"
 */
export function formatStudyTimeLong(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return '0 minutes';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(' ');
}
