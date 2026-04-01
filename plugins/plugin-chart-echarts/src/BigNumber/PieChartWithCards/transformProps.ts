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
import { PieChartWithCardsChartProps, PieChartWithCardsProps } from './types';

export default function transformProps(
  chartProps: PieChartWithCardsChartProps,
): PieChartWithCardsProps {
  const {
    width,
    height,
    formData,
  } = chartProps;
  const {
    title,
    data = [],
  } = formData;

  // Ensure data is an array of PieChartDataItem objects
  const normalizedData = Array.isArray(data) ? data : [];

  // Transform data if it comes from SQL query with different column names
  const transformedData = normalizedData.map((item: Record<string, unknown>) => {
    // Handle SQL query results with gender and patient_count columns
    if (item.gender && item.patient_count !== undefined) {
      return {
        name: item.gender === 'F' ? 'Female' : 'Male',
        value: item.patient_count as number,
      };
    }
    // Handle already formatted data
    return {
      name: (item.name as string) || 'Unknown',
      value: (item.value as number) || 0,
    };
  });

  return {
    width,
    height,
    data: transformedData,
    title,
  };
}
