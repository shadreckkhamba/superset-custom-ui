/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ChartProps,
  getMetricLabel,
  getColumnLabel,
  getNumberFormatter,
  ensureIsArray,
} from '@superset-ui/core';
import {
  PatientBarChartFormData,
  PatientBarChartTransformedProps,
  PatientLineChartFormData,
  PatientLineChartTransformedProps,
} from './types';

/**
 * Extract column names from query data
 */
function extractColumns(data: Record<string, unknown>[]): {
  groupByColumn: string;
  metricColumn: string;
} {
  if (data.length === 0) {
    return { groupByColumn: 'category', metricColumn: 'value' };
  }

  const keys = Object.keys(data[0]);
  
  // Find the groupby column (usually first string column)
  // and metric column (usually numeric)
  let groupByColumn = keys[0];
  let metricColumn = keys.find(k => 
    k !== groupByColumn && typeof data[0][k] === 'number'
  ) || keys[1];

  return { groupByColumn, metricColumn };
}

/**
 * Transform props for Bar Chart - works with ANY Superset dataset
 */
export function transformPropsForBarChart(
  props: ChartProps<PatientBarChartFormData>,
): PatientBarChartTransformedProps {
  const { height, width, formData, queriesData } = props;
  const {
    colorScheme,
    showLabels,
    barWidth,
    labelType = 'both',
    chartTitle,
    groupby,
    metric
  } = formData;

  // Extract data from Superset query results
  const data = queriesData?.[0]?.data || [];
  
  if (data.length === 0) {
    return {
      data: [],
      colorScheme,
      showLabels,
      barWidth,
      labelType,
      chartTitle,
      height,
      width,
    };
  }

  // Get column names from data or use formData
  const { groupByColumn, metricColumn } = extractColumns(data as Record<string, unknown>[]);
  
  // Use groupby from formData if available, otherwise use detected column
  const groupByKey = ensureIsArray(groupby)[0] || groupByColumn;
  
  // Use metric from formData if available, otherwise use detected column  
  const metricKey = metric || metricColumn;

  // Map data to chart format with automatic percentage calculation
  const chartData = (data as Record<string, unknown>[]).map((row, index) => {
    const category = String(row[groupByKey] ?? row[groupByColumn] ?? `Item ${index + 1}`);
    const value = Number(row[metricKey] ?? row[metricColumn] ?? 0);
    return { category, value, percentage: 0 }; // Will be calculated below
  });

  // Calculate total for percentage
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0) || 1;
  
  // Calculate percentages
  chartData.forEach(item => {
    item.percentage = Math.round((item.value / totalValue) * 100);
  });

  // Sort by value descending for better visualization
  chartData.sort((a, b) => b.value - a.value);

  return {
    data: chartData,
    colorScheme,
    showLabels,
    barWidth,
    labelType,
    chartTitle,
    subtitle: 'Figuring out stats for better health choices', // Default subtitle
    height,
    width,
  };
}

/**
 * Transform props for Line Chart - works with ANY Superset dataset
 */
export function transformPropsForLineChart(
  props: ChartProps<PatientLineChartFormData>,
): PatientLineChartTransformedProps {
  const { height, width, formData, queriesData } = props;
  const { 
    colorScheme, 
    showMarkers = true, 
    smooth = true,
    groupby,
    metric,
    timeColumn,
  } = formData;

  // Extract data from Superset query results
  const data = queriesData?.[0]?.data || [];
  
  if (data.length === 0) {
    return {
      data: [],
      colorScheme,
      showMarkers,
      smooth,
      height,
      width,
    };
  }

  // Get column names from data
  const { groupByColumn, metricColumn } = extractColumns(data as Record<string, unknown>[]);
  
  // Use time column from formData if available
  const timeKey = timeColumn || 
    Object.keys(data[0]).find(k => 
      k.toLowerCase().includes('time') || 
      k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('month')
    ) || groupByColumn;
  
  // Use metric from formData if available
  const metricKey = metric || metricColumn;

  // Map data to chart format
  const chartData = (data as Record<string, unknown>[]).map((row, index) => {
    const time = String(row[timeKey] ?? `Period ${index + 1}`);
    const value = Number(row[metricKey] ?? row[metricColumn] ?? 0);
    return { time, value, growth: undefined as number | undefined };
  });

  // Calculate growth (percentage change from previous period)
  for (let i = 1; i < chartData.length; i++) {
    const prevValue = chartData[i - 1].value;
    const currValue = chartData[i].value;
    if (prevValue > 0) {
      chartData[i].growth = Math.round(((currValue - prevValue) / prevValue) * 100);
    }
  }

  return {
    data: chartData,
    colorScheme,
    showMarkers,
    smooth,
    showGrowth: true, // Default to showing growth in tooltips
    height,
    width,
  };
}
