export function timeAgo(dateString: string): string {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  console.log(past);
  const diffInSeconds = Math.floor((now - past) / 1000);

  // < 1 minute
  if (diffInSeconds < 60) {
    return 'just now';
  }

  // 1–59 min
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  // 1–23 hrs
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  // 1–6 days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  // 1–3 weeks (approximate by weeks up to 28 days)
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks <= 3) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  // 1–11 months (approximate by 30-day blocks up to 330 days)
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  // >= 1 year (full-year increments)
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}