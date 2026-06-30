/**
 * Utility functions for fetching and formatting date ranges from API
 */
import { ENDPOINTS } from '../config/endpoints';

// Cache for date ranges to avoid repeated API calls
let dateRangesCache = null;
let cacheTimestamp = null;
let inflightDateRangesRequest = null;
const CACHE_DURATION = 30 * 1000; // 30 seconds - shorter cache for auto-refresh

export const KNOWN_DATE_RANGE_TABLES = [
  'patient_age_categories',
  'patient_gender_counts',
  'patient_location_counts',
  'patient_refund_count',
  'patient_stay_times',
];

const DATE_COLUMN_PATTERN =
  /(^|_)(date|time|timestamp|dttm|period|month|year|day|arrival|departure|push|refund|stamp)($|_)/i;

/**
 * Fetch date ranges from API with caching
 */
export const fetchDateRanges = async (forceRefresh = false) => {
  const now = Date.now();

  // Return cached data if still valid and not forcing refresh
  if (
    !forceRefresh &&
    dateRangesCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return dateRangesCache;
  }

  if (!forceRefresh && inflightDateRangesRequest) {
    return inflightDateRangesRequest;
  }

  const request = (async () => {
    try {
      const response = await fetch(ENDPOINTS.DATE_RANGES);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data?.error && !hasDateRangeTableEntries(data)) {
        throw new Error(data.error);
      }

      dateRangesCache = data;
      cacheTimestamp = Date.now();

      return data;
    } catch (error) {
      console.error('Error fetching date ranges:', error);
      return null;
    } finally {
      inflightDateRangesRequest = null;
    }
  })();

  inflightDateRangesRequest = request;
  return request;
};

export const getCachedDateRanges = () => dateRangesCache;

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
export const formatDate = dateInput => {
  const date =
    dateInput instanceof Date ? dateInput : parseTemporalValue(dateInput);
  if (!date) {
    return String(dateInput ?? '');
  }
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[._]+/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isTableRangeEntry = value =>
  Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (value.start_date ||
        value.end_date ||
        value.min_date ||
        value.max_date ||
        value.first_date ||
        value.last_date ||
        value.from ||
        value.to),
  );

const hasDateRangeTableEntries = dateRanges => {
  const tables = getDateRangeTables(dateRanges);
  return Object.keys(tables).length > 0;
};

const getDateRangeTables = dateRanges => {
  if (!dateRanges) {
    return {};
  }

  const raw = dateRanges.date_ranges || dateRanges.ranges || dateRanges;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw).filter(([key, value]) => {
      if (KNOWN_DATE_RANGE_TABLES.includes(key)) {
        return isTableRangeEntry(value);
      }
      return isTableRangeEntry(value);
    }),
  );
};

const getChartCandidates = chart => {
  if (!chart) {
    return [];
  }

  if (typeof chart === 'string') {
    return [chart];
  }

  const datasource = chart.datasource || {};
  const datasourceId = chart.formData?.datasource || chart.form_data?.datasource;
  const datasourceLabel =
    typeof datasourceId === 'string' ? datasourceId.split('__')[0] : null;

  return [
    chart.sliceName,
    chart.slice_name,
    chart.chartName,
    chart.chart_name,
    chart.datasourceName,
    chart.datasource_name,
    datasource.table_name,
    datasource.datasource_name,
    datasource.name,
    datasource.table,
    datasource.database?.database_name,
    datasourceLabel,
    chart.vizType,
    chart.viz_type,
  ].filter(Boolean);
};

const parseTemporalValue = value => {
  if (value == null || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const ms = value > 1e12 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateRangeFromRawValues = (rawStartDate, rawEndDate) => {
  if (!rawStartDate || !rawEndDate) {
    return null;
  }

  const startDate = formatDate(rawStartDate);
  const endDate = formatDate(rawEndDate);

  if (String(rawStartDate).slice(0, 10) === String(rawEndDate).slice(0, 10)) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
};

const getTableRangeLabel = tableData => {
  if (!tableData) {
    return null;
  }

  const rawStartDate =
    tableData.start_date ||
    tableData.min_date ||
    tableData.first_date ||
    tableData.from;
  const rawEndDate =
    tableData.end_date ||
    tableData.max_date ||
    tableData.last_date ||
    tableData.to;

  return formatDateRangeFromRawValues(rawStartDate, rawEndDate);
};

const getMappedTableKey = chartId => {
  if (chartId == null) {
    return null;
  }

  const map =
    ENDPOINTS.CHART_DATE_RANGE_TABLE_MAP ||
    ENDPOINTS.chartDateRangeTableMap ||
    {};

  return map[chartId] || map[String(chartId)] || null;
};

const resolveTableKeyForChart = (tables, chart) => {
  const tableKeys = Object.keys(tables);
  if (!tableKeys.length || !chart) {
    return null;
  }

  const mappedTable = getMappedTableKey(chart.chartId ?? chart.id);
  if (mappedTable && tables[mappedTable]) {
    return mappedTable;
  }

  const physicalTable = chart.datasource?.table_name;
  if (physicalTable) {
    if (tables[physicalTable]) {
      return physicalTable;
    }

    const tableSuffix = physicalTable.split('.').pop();
    const suffixMatch = tableKeys.find(
      key => normalize(key) === normalize(tableSuffix),
    );
    if (suffixMatch) {
      return suffixMatch;
    }
  }

  const candidates = getChartCandidates(chart);
  const normalizedTableByKey = tableKeys.reduce((acc, key) => {
    acc[key] = normalize(key);
    return acc;
  }, {});

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) {
      continue;
    }

    const exactMatch = tableKeys.find(
      key => normalizedTableByKey[key] === normalizedCandidate,
    );
    if (exactMatch) {
      return exactMatch;
    }
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) {
      continue;
    }

    const fuzzyMatches = tableKeys
      .filter(key => {
        const normalizedKey = normalizedTableByKey[key];
        return (
          normalizedCandidate.includes(normalizedKey) ||
          normalizedKey.includes(normalizedCandidate)
        );
      })
      .sort((a, b) => b.length - a.length);

    if (fuzzyMatches.length) {
      return fuzzyMatches[0];
    }
  }

  const searchableText = normalize(candidates.join(' '));

  for (const tableKey of tableKeys) {
    const normalizedKey = normalize(tableKey);
    const keyTokens = normalizedKey.split(' ').filter(token => token.length > 2);
    if (
      keyTokens.length > 0 &&
      keyTokens.every(token => searchableText.includes(token))
    ) {
      return tableKey;
    }
  }

  if (
    searchableText.includes('age') ||
    searchableText.includes('category') ||
    searchableText.includes('categor')
  ) {
    return tableKeys.includes('patient_age_categories')
      ? 'patient_age_categories'
      : null;
  }
  if (searchableText.includes('gender')) {
    return tableKeys.includes('patient_gender_counts')
      ? 'patient_gender_counts'
      : null;
  }
  if (
    searchableText.includes('location') ||
    searchableText.includes('county') ||
    searchableText.includes('district')
  ) {
    return tableKeys.includes('patient_location_counts')
      ? 'patient_location_counts'
      : null;
  }
  if (searchableText.includes('refund')) {
    return tableKeys.includes('patient_refund_count')
      ? 'patient_refund_count'
      : null;
  }
  if (
    searchableText.includes('stay') ||
    searchableText.includes('visit') ||
    searchableText.includes('average stay') ||
    (/\btime\b/.test(searchableText) && searchableText.includes('patient'))
  ) {
    return tableKeys.includes('patient_stay_times')
      ? 'patient_stay_times'
      : null;
  }

  return null;
};

/**
 * Get date range for a specific table/chart from the /date_ranges API payload.
 */
export const getDateRangeForChart = (dateRanges, chart) => {
  const tables = getDateRangeTables(dateRanges);
  if (!Object.keys(tables).length) {
    return null;
  }

  const tableName = resolveTableKeyForChart(tables, chart);
  if (!tableName) {
    return null;
  }

  return getTableRangeLabel(tables[tableName]);
};

const isTemporalColumn = (columnName, columnType) => {
  if (typeof columnType === 'string') {
    const normalizedType = columnType.toLowerCase();
    if (
      normalizedType.includes('temporal') ||
      normalizedType.includes('date') ||
      normalizedType.includes('time')
    ) {
      return true;
    }
  }

  if (typeof columnType === 'number') {
    // GenericDataType.Temporal === 2 in Superset.
    return columnType === 2;
  }

  return DATE_COLUMN_PATTERN.test(String(columnName || ''));
};

const getDateRangeFromQueryData = queryResult => {
  const { data, colnames, coltypes } = queryResult || {};
  if (!Array.isArray(data) || !data.length || !Array.isArray(colnames)) {
    return null;
  }

  let minDate = null;
  let maxDate = null;

  colnames.forEach((columnName, index) => {
    if (!isTemporalColumn(columnName, coltypes?.[index])) {
      return;
    }

    data.forEach(row => {
      const rawValue = Array.isArray(row) ? row[index] : row?.[columnName];
      const parsedDate = parseTemporalValue(rawValue);
      if (!parsedDate) {
        return;
      }

      if (!minDate || parsedDate < minDate) {
        minDate = parsedDate;
      }
      if (!maxDate || parsedDate > maxDate) {
        maxDate = parsedDate;
      }
    });
  });

  if (!minDate || !maxDate) {
    return null;
  }

  return formatDateRangeFromRawValues(minDate, maxDate);
};

const getDateRangeFromQueryBounds = queryResult => {
  const fromDate = parseTemporalValue(queryResult?.from_dttm);
  const toDate = parseTemporalValue(queryResult?.to_dttm);

  if (!fromDate || !toDate) {
    return null;
  }

  return formatDateRangeFromRawValues(fromDate, toDate);
};

/**
 * Derive a date range from the chart's latest query response.
 */
export const getDateRangeFromQueryResponse = queriesResponse => {
  if (!Array.isArray(queriesResponse) || !queriesResponse.length) {
    return null;
  }

  for (const queryResult of queriesResponse) {
    const dataRange = getDateRangeFromQueryData(queryResult);
    if (dataRange) {
      return dataRange;
    }
  }

  for (const queryResult of queriesResponse) {
    const boundsRange = getDateRangeFromQueryBounds(queryResult);
    if (boundsRange) {
      return boundsRange;
    }
  }

  return null;
};

/**
 * Resolve the best available date range label for a chart.
 */
export const resolveChartDateRangeLabel = ({
  dateRanges,
  chart,
  queriesResponse,
  useFallback = true,
}) => {
  const apiDateRange = getDateRangeForChart(dateRanges, chart);
  if (apiDateRange) {
    return apiDateRange;
  }

  const queryDateRange = getDateRangeFromQueryResponse(queriesResponse);
  if (queryDateRange) {
    return queryDateRange;
  }

  return useFallback ? getFallbackDateRange() : null;
};

/**
 * Get fallback date range (current month) — avoid using for badges unless explicitly desired.
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
