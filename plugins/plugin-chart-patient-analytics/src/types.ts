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
import { ChartPluginProps, QueryFormData } from '@superset-ui/core';

export interface PatientBarChartFormData extends QueryFormData {
  colorScheme?: string;
  showLabels?: boolean;
  barWidth?: number;
  labelType?: 'percentage' | 'value' | 'both';
  chartTitle?: string;
  groupby?: string[];
  metric?: string;
}

export interface PatientLineChartFormData extends QueryFormData {
  colorScheme?: string;
  showMarkers?: boolean;
  smooth?: boolean;
  groupby?: string[];
  timeColumn?: string;
  metric?: string;
}

export interface PatientBarChartProps
  extends ChartPluginProps<PatientBarChartFormData> {
  formData: PatientBarChartFormData;
  data: Array<{ category: string; value: number }>;
}

export interface PatientLineChartProps
  extends ChartPluginProps<PatientLineChartFormData> {
  formData: PatientLineChartFormData;
  data: Array<{ time: string; value: number }>;
}

export type PatientBarChartTransformedProps = {
  data: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  colorScheme?: string;
  showLabels?: boolean;
  barWidth?: number;
  labelType?: 'percentage' | 'value' | 'both';
  chartTitle?: string;
  subtitle?: string;
  height: number;
  width: number;
};

export type PatientLineChartTransformedProps = {
  data: Array<{
    time: string;
    value: number;
    growth: number | undefined; // percentage growth from previous period
  }>;
  colorScheme?: string;
  showMarkers?: boolean;
  smooth?: boolean;
  showGrowth?: boolean;
  height: number;
  width: number;
};