export const formatTimeAgo = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export const formatDeadline = (deadlineStr: string | undefined): { text: string; isUrgent: boolean; isExpired: boolean } => {
  if (!deadlineStr) return { text: 'Ongoing', isUrgent: false, isExpired: false };
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'Closed', isUrgent: false, isExpired: true };
  } else if (diffDays === 0) {
    return { text: 'Closing Today', isUrgent: true, isExpired: false };
  } else if (diffDays <= 3) {
    return { text: `Closing in ${diffDays}d`, isUrgent: true, isExpired: false };
  } else {
    return { text: `${diffDays} days left`, isUrgent: false, isExpired: false };
  }
};
