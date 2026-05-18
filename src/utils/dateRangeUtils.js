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
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getDateRangeTables = dateRanges => {
  if (!dateRanges) {
    return {};
  }

  return dateRanges.date_ranges || dateRanges.ranges || dateRanges;
};

const getChartCandidates = chart => {
  if (!chart) {
    return [];
  }

  if (typeof chart === 'string') {
    return [chart];
  }

  return [
    chart.sliceName,
    chart.slice_name,
    chart.chartName,
    chart.chart_name,
    chart.datasourceName,
    chart.datasource_name,
    chart.datasource?.table_name,
    chart.datasource?.datasource_name,
    chart.datasource?.name,
    chart.datasource?.table,
    chart.formData?.datasource,
    chart.form_data?.datasource,
    chart.vizType,
    chart.viz_type,
  ].filter(Boolean);
};

/**
 * Get date range for a specific table/chart
 */
export const getDateRangeForChart = (dateRanges, chart) => {
  const tables = getDateRangeTables(dateRanges);
  const candidates = getChartCandidates(chart);
  if (!tables || !Object.keys(tables).length || !candidates.length) return null;
  
  const tableKeys = Object.keys(tables);
  const normalizedTableByKey = tableKeys.reduce((acc, key) => {
    acc[key] = normalize(key);
    return acc;
  }, {});
  
  let tableName = null;

  // Prefer exact/direct matches from datasource metadata or table-like chart names.
  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) continue;

    const directMatch = tableKeys.find(key => {
      const normalizedKey = normalizedTableByKey[key];
      return (
        normalizedCandidate === normalizedKey ||
        normalizedCandidate.includes(normalizedKey) ||
        normalizedKey.includes(normalizedCandidate)
      );
    });

    if (directMatch) {
      tableName = directMatch;
      break;
    }
  }
  
  // Map based on keywords in chart names as a fallback.
  const searchableText = normalize(candidates.join(' '));
  if (!tableName && (searchableText.includes('age') || searchableText.includes('category'))) {
    tableName = 'patient_age_categories';
  } else if (!tableName && searchableText.includes('gender')) {
    tableName = 'patient_gender_counts';
  } else if (!tableName && (searchableText.includes('location') || searchableText.includes('county'))) {
    tableName = 'patient_location_counts';
  } else if (!tableName && searchableText.includes('refund')) {
    tableName = 'patient_refund_count';
  } else if (!tableName && (searchableText.includes('stay') || searchableText.includes('time'))) {
    tableName = 'patient_stay_times';
  }
  
  if (!tableName) return null;
  
  const tableData = tables[tableName];
  const rawStartDate =
    tableData?.start_date ||
    tableData?.min_date ||
    tableData?.first_date ||
    tableData?.from;
  const rawEndDate =
    tableData?.end_date ||
    tableData?.max_date ||
    tableData?.last_date ||
    tableData?.to;
  if (!tableData || !rawStartDate || !rawEndDate) return null;
  
  const startDate = formatDate(rawStartDate);
  const endDate = formatDate(rawEndDate);
  
  // If start and end dates are the same, show only one date
  if (rawStartDate === rawEndDate) {
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
