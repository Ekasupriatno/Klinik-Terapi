/**
 * Utility functions for timezone-safe local date handling.
 * Avoids UTC shift bugs caused by `date.toISOString().split('T')[0]`.
 */

export const formatLocalDate = (date = new Date()) => {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMinBookingDate = () => {
  return formatLocalDate(new Date());
};

export const getMaxBookingDate = (daysAhead = 30) => {
  const max = new Date();
  max.setDate(max.getDate() + daysAhead);
  return formatLocalDate(max);
};
