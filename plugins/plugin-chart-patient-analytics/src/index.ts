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
  ChartPlugin,
  ChartPluginProps,
  t,
  Behavior,
} from '@superset-ui/core';
import {
  PatientBarChartFormData,
  PatientLineChartFormData,
  PatientBarChartTransformedProps,
  PatientLineChartTransformedProps,
} from './types';
import { transformPropsForBarChart, transformPropsForLineChart } from './transformProps';
import PatientBarChart from './PatientBarChart';
import PatientLineChart from './PatientLineChart';

// Default form data for the bar chart
const defaultBarFormData: Partial<PatientBarChartFormData> = {
  colorScheme: 'pastel',
  showLabels: true,
  barWidth: 40,
  labelType: 'percentage',
  chartTitle: '',
};

// Default form data for the line chart
const defaultLineFormData: Partial<PatientLineChartFormData> = {
  colorScheme: 'blue',
  showMarkers: true,
  smooth: true,
};

export default class PatientAnalyticsChartPlugin extends ChartPlugin<
  PatientBarChartFormData | PatientLineChartFormData,
  PatientBarChartTransformedProps | PatientLineChartTransformedProps
> {
  constructor(
    type: 'patient_bar' | 'patient_line',
    name: string,
    description: string,
  ) {
    const isBarChart = type === 'patient_bar';
    const formData = isBarChart ? defaultBarFormData : defaultLineFormData;
    const transformPropsFn = isBarChart
      ? transformPropsForBarChart
      : transformPropsForLineChart;
    const ChartComponent = isBarChart ? PatientBarChart : PatientLineChart;

    super({
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
        ],
        category: t('Patient Analytics'),
        credits: [],
        description: t(description),
        name: t(name),
        tags: [t('Custom'), t('Patient Analytics'), t(isBarChart ? 'Bar' : 'Line')],
      },
      formData,
      transformProps: transformPropsFn,
      loadChart: () => Promise.resolve(ChartComponent),
    });
  }
}

// Export bar chart plugin
export class PatientBarChartPlugin extends ChartPlugin<
  PatientBarChartFormData,
  PatientBarChartTransformedProps
> {
  constructor() {
    super({
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
        ],
        category: t('Patient Analytics'),
        credits: [],
        description: t(
          'Custom bar chart with gradient colors, rounded corners, and percentage labels for patient analytics.',
        ),
        name: t('Patient Bar Chart'),
        tags: [t('Custom'), t('Patient Analytics'), t('Bar')],
      },
      formData: defaultBarFormData,
      transformProps: transformPropsForBarChart,
      loadChart: () => Promise.resolve(PatientBarChart),
    });
  }
}

// Export line chart plugin
export class PatientLineChartPlugin extends ChartPlugin<
  PatientLineChartFormData,
  PatientLineChartTransformedProps
> {
  constructor() {
    super({
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
        ],
        category: t('Patient Analytics'),
        credits: [],
        description: t(
          'Custom line chart with smooth curves, markers, and gradient area fill for patient analytics.',
        ),
        name: t('Patient Line Chart'),
        tags: [t('Custom'), t('Patient Analytics'), t('Line')],
      },
      formData: defaultLineFormData,
      transformProps: transformPropsForLineChart,
      loadChart: () => Promise.resolve(PatientLineChart),
    });
  }
}

// Export components
export { default as PatientBarChart } from './PatientBarChart';
export { default as PatientLineChart } from './PatientLineChart';

// Export transform functions (named exports)
export { transformPropsForBarChart, transformPropsForLineChart } from './transformProps';

// Re-export types
export * from './types';