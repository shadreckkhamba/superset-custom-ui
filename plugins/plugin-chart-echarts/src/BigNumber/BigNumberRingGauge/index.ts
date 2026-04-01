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
import { t, Behavior } from '@superset-ui/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import thumbnail from './images/thumbnail.png';
import { BigNumberRingGaugeChartProps, BigNumberRingGaugeFormData } from './types';
import { EchartsChartPlugin } from '../../types';

const metadata = {
  category: t('KPI'),
  description: t(
    'Displays a single metric as an animated ring gauge with a big number in the center. Perfect for showing progress, completion rates, or KPI metrics.',
  ),
  name: t('Big Number Ring Gauge'),
  tags: [
    t('Additive'),
    t('Business'),
    t('Percentages'),
    t('Featured'),
    t('Report'),
  ],
  thumbnail,
  behaviors: [Behavior.DrillToDetail],
};

export default class BigNumberRingGaugeChartPlugin extends EchartsChartPlugin<
  BigNumberRingGaugeFormData,
  BigNumberRingGaugeChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./BigNumberRingGauge'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}
