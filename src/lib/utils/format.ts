// Format currency in INR (Lakhs/Crores)
export function formatCurrency(
  amount: number,
  format: 'short' | 'full' = 'short'
): string {
  if (format === 'full') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Short format (Lakhs/Crores)
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    // Crores
    return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs
    return `${sign}₹${(absAmount / 100000).toFixed(2)} L`;
  } else {
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  }
}

// Format percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format date
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'long',
      timeZone: 'Asia/Kolkata',
    }).format(d);
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(d);
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(d);
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d);
  }
}

// Format phone number (Indian)
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 91, format as +91 XXXXX XXXXX
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  // If 10 digits, format as XXXXX XXXXX
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  
  return phone;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
