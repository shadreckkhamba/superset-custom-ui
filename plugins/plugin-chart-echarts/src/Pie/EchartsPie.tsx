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
import type { EChartsCoreOption } from 'echarts/core';
import { styled } from '@superset-ui/core';
import Echart from '../components/Echart';
import { allEventHandlers } from '../utils/eventHandlers';
import { PieChartTransformedProps } from './types';

const FEMALE_COLOR = '#f68a00';
const MALE_COLOR = '#1174de';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit * 2}px;
  padding: ${({ theme }) =>
    `${theme.gridUnit * 1.5}px ${theme.gridUnit * 1.75}px`};
  min-height: 0;
  overflow: hidden;
`;

const TotalBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.gridUnit * 0.5}px;
`;

const TotalLabel = styled.span`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.base};
  line-height: 1;
`;

const TotalValue = styled.span`
  font-size: 56px;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const PieWrap = styled.div`
  width: 170px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Cards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.gridUnit * 1.5}px;
`;

const Card = styled.div`
  padding: ${({ theme }) =>
    `${theme.gridUnit * 0.5}px ${theme.gridUnit * 0.5}px`};
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit}px;
  min-width: 0;
`;

const GenderIcon = styled.span<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ $color }) => $color};
`;

const CardText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  min-width: 0;
`;

const CardLabel = styled.span`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.base};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardValue = styled.span`
  font-size: 34px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardPercent = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

function toNumericValue(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function classifyGender(name: string): 'female' | 'male' | 'unknown' {
  const value = name.trim().toLowerCase();
  if (value.includes('female') || value === 'f') return 'female';
  if (value.includes('male') || value === 'm') return 'male';
  return 'unknown';
}

function colorByName(name: string, index: number): string {
  const type = classifyGender(name);
  if (type === 'female') return FEMALE_COLOR;
  if (type === 'male') return MALE_COLOR;
  return index % 2 === 0 ? FEMALE_COLOR : MALE_COLOR;
}

function iconByName(name: string): string {
  const type = classifyGender(name);
  if (type === 'female') return '♀';
  if (type === 'male') return '♂';
  return '•';
}

export default function EchartsPie(props: PieChartTransformedProps) {
  const { echartOptions, height, refs, selectedValues, width } = props;

  const sourceSeries = (echartOptions?.series?.[0] as {
    radius?: string | number | Array<string | number>;
    center?: Array<string | number>;
    startAngle?: number;
    clockwise?: boolean;
    data?: Array<{ name?: string; value?: unknown }>;
  }) || { data: [] };

  const rawSeries = (sourceSeries as {
    data?: Array<{ name?: string; value?: unknown }>;
  }) || { data: [] };

  const sourceRadius = sourceSeries.radius;
  const resolvedRadius: string | number | Array<string | number> =
    sourceRadius ?? ['0%', '78%'];

  const chartData = (rawSeries.data || []).map((item, index) => ({
    name: item.name || '',
    value: toNumericValue(item.value),
    color: colorByName(item.name || '', index),
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const displayData = chartData.map(item => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }));

  const pieOptions: EChartsCoreOption = {
    ...echartOptions,
    tooltip: { show: false },
    legend: { show: false },
    title: undefined,
    series: [
      {
        type: 'pie',
        radius: resolvedRadius,
        center: sourceSeries.center ?? ['50%', '50%'],
        startAngle: sourceSeries.startAngle ?? 0,
        clockwise: sourceSeries.clockwise ?? true,
        avoidLabelOverlap: true,
        silent: true,
        label: { show: false },
        labelLine: { show: false },
        data: displayData.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color, opacity: 1 },
        })),
      },
    ],
  };

  const eventHandlers = allEventHandlers(props);

  return (
    <Root style={{ width, height }}>
      <Body>
        <TotalBlock>
          <TotalLabel>Total</TotalLabel>
          <TotalValue>{total.toLocaleString()}</TotalValue>
        </TotalBlock>

        <PieWrap>
          <Echart
            refs={refs}
            width={170}
            height={170}
            echartOptions={pieOptions}
            eventHandlers={eventHandlers}
            selectedValues={selectedValues}
          />
        </PieWrap>

        <Cards>
          {displayData.map(item => (
            <Card key={`${item.name}-${item.value}`}>
              <GenderIcon $color={item.color}>
                {iconByName(item.name)}
              </GenderIcon>
              <CardText>
                <CardLabel>{item.name}</CardLabel>
                <CardValue>{item.value.toLocaleString()}</CardValue>
                <CardPercent>{item.percent.toFixed(1)}%</CardPercent>
              </CardText>
            </Card>
          ))}
        </Cards>
      </Body>
    </Root>
  );
}
