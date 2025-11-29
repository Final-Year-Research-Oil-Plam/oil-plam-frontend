/**
 * Format date to YYYY-MM-DD string format
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Calculate tree age from planted date
 */
export const calculateTreeAge = (plantedDate: string): number => {
  if (!plantedDate) return 0;

  const date = new Date(plantedDate + 'T00:00:00');
  if (isNaN(date.getTime())) return 0;

  const today = new Date();
  const age = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return age >= 0 ? age : 0;
};

/**
 * Check if date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false;
  const date = new Date(dateString + 'T00:00:00');
  return date <= new Date();
};
