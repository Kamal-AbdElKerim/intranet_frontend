import { format } from 'date-fns';
import axiosInstance from '../Interceptor/axiosInstance';

export const fetchHolidays = async () => {
  try {
    const response = await axiosInstance.get('/holidays');
    if (response.data.success) {
      return response.data.data.map(holiday => holiday.date);
    }
    return [];
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const isHoliday = (dateString, holidays = []) => {
  const formattedDate = format(new Date(dateString), 'yyyy-MM-dd');
  return holidays.includes(formattedDate);
};

export const getNextWorkingDay = (date, holidays = []) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (isWeekend(nextDay) || isHoliday(format(nextDay, 'yyyy-MM-dd'), holidays)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

export const calculateWorkingDays = (startDate, endDate, holidays = []) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Reset hours to midnight to avoid time zone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  let workingDays = 0;
  const current = new Date(start);
  
  // Include both start and end dates in the calculation
  while (current <= end) {
    // Format the current date to match the holiday cache format
    const formattedDate = format(current, 'yyyy-MM-dd');
    if (!isWeekend(current) && !isHoliday(formattedDate, holidays)) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return Math.max(0, workingDays);
};

export const calculateTotalDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Reset hours to midnight to avoid time zone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate the difference in days (including start and end dates)
  const diffTime = Math.abs(end - start);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(0, totalDays);
};

export const formatDateForInput = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
}; 