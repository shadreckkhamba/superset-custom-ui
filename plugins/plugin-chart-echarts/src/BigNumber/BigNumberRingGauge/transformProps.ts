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
  getMetricLabel,
  getValueFormatter,
} from '@superset-ui/core';
import { BigNumberRingGaugeChartProps, BigNumberRingGaugeProps } from './types';
import { parseMetricValue } from '../utils';

export default function transformProps(
  chartProps: BigNumberRingGaugeChartProps,
): BigNumberRingGaugeProps {
  const {
    width,
    height,
    queriesData,
    formData,
    datasource: { currencyFormats = {}, columnFormats = {} },
  } = chartProps;
  const {
    metric = 'value',
    subtitle,
    yAxisFormat,
    currencyFormat,
    percentage,
  } = formData;

  const { data = [] } = queriesData[0] || {};
  const metricName = getMetricLabel(metric);
  const rawValue = data.length === 0 ? null : data[0][metricName];
  const bigNumber =
    rawValue === null || rawValue === undefined
      ? null
      : typeof rawValue === 'bigint'
        ? Number(rawValue)
        : typeof rawValue === 'string' || typeof rawValue === 'number'
          ? rawValue
          : null;

  const numberFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    yAxisFormat,
    currencyFormat,
  );

  return {
    width,
    height,
    bigNumber,
    headerFormatter: numberFormatter,
    metricName,
    subtitle,
    percentage,
  };
}
