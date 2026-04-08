/**
 * Utility functions for fetching and formatting date ranges from API
 */
import { ENDPOINTS } from '../config/endpoints';

// Cache for date ranges to avoid repeated API calls
let dateRangesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 1000; // 30 seconds - shorter cache for auto-refresh

/**
 * Fetch date ranges from API with caching
 */
export const fetchDateRanges = async (forceRefresh = false) => {
  const now = Date.now();
  
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && dateRangesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return dateRangesCache;
  }

  try {
    const response = await fetch(ENDPOINTS.DATE_RANGES);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    dateRangesCache = data;
    cacheTimestamp = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching date ranges:', error);
    // Return fallback data if API fails
    return null;
  }
};

/**
 * Clear the date ranges cache (useful for forcing refresh)
 */
export const clearDateRangesCache = () => {
  dateRangesCache = null;
  cacheTimestamp = null;
};

/**
 * Format date string to display format (e.g., "1 Apr 2026")
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

/**
 * Get date range for a specific table/chart
 */
export const getDateRangeForChart = (dateRanges, chartName) => {
  if (!dateRanges || !chartName) return null;
  
  // Convert chart name to lowercase and look for keywords to map to tables
  const lowerChartName = chartName.toLowerCase();
  
  let tableName = null;
  
  // Map based on keywords in chart names
  if (lowerChartName.includes('age') || lowerChartName.includes('category')) {
    tableName = 'patient_age_categories';
  } else if (lowerChartName.includes('gender')) {
    tableName = 'patient_gender_counts';
  } else if (lowerChartName.includes('location') || lowerChartName.includes('county')) {
    tableName = 'patient_location_counts';
  } else if (lowerChartName.includes('refund')) {
    tableName = 'patient_refund_count';
  } else if (lowerChartName.includes('stay') || lowerChartName.includes('time')) {
    tableName = 'patient_stay_times';
  }
  
  // If no keyword match, try direct table name match
  if (!tableName) {
    const directMatch = Object.keys(dateRanges).find(key => 
      lowerChartName.includes(key.toLowerCase()) || 
      key.toLowerCase().includes(lowerChartName)
    );
    tableName = directMatch;
  }
  
  if (!tableName) return null;
  
  const tableData = dateRanges[tableName];
  if (!tableData || !tableData.start_date || !tableData.end_date) return null;
  
  const startDate = formatDate(tableData.start_date);
  const endDate = formatDate(tableData.end_date);
  
  // If start and end dates are the same, show only one date
  if (tableData.start_date === tableData.end_date) {
    return startDate;
  }
  
  return `${startDate} - ${endDate}`;
};

/**
 * Get fallback date range (current implementation)
 */
export const getFallbackDateRange = () => {
  const today = new Date();
  const todayDay = today.getDate();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const from = startOfMonth.toLocaleDateString('en-GB', options);
  const to = today.toLocaleDateString('en-GB', options);
  
  if (todayDay === 1) {
    return `Today, ${from}`;
  }
  
  return `${from} - ${to}`;
};