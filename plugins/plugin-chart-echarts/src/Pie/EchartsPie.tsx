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
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { styled } from '@superset-ui/core';
import type { CSSProperties } from 'react';
import { PieChartTransformedProps } from './types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  background: #f7fafb;
  border-radius: 10px;
  border: 1px solid #d8e3e8;
  box-shadow: 0 1px 2px rgba(22, 41, 50, 0.08);
  box-sizing: border-box;
  overflow: visible;

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #1a1a2e;
    border: 1px solid #2d3a4a;
  }
`;

const PieLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PieLegendRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  background: #edf3f6;
  border: 1px solid #d4dfe4;
  margin-bottom: 3px;
  width: 100%;
  box-sizing: border-box;

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #252540;
    border: 1px solid #3d4a5a;
  }
`;

const Dot = styled.span<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color} !important;
  background-image: none !important;
  border: 2px solid white;
  box-shadow: 0 0 3px rgba(0,0,0,0.3);
  flex-shrink: 0;
  display: inline-block;

  /* Override global dark-theme pie reset that forces * to transparent */
  .dark-theme [data-test-viz-type='pie'] &,
  [data-theme='dark'] [data-test-viz-type='pie'] & {
    background-color: ${({ $color }) => $color} !important;
    background-image: none !important;
    border-radius: 50% !important;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.3) !important;
  }
`;

const PieLegendLabel = styled.span`
  font-size: 14px;
  color: #1d2d33;
  font-weight: 700;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const PieLegendPercent = styled.span`
  font-size: 14px;
  color: #5d7079;
  font-weight: 700;
  flex-shrink: 0;
  justify-self: end;
  transform: translateX(-18px);

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #b0bec5;
  }
`;

const PieTemplate = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 0;
  gap: 16px;
  align-items: stretch;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PieChartWrap = styled.div`
  flex: 0 0 58%;
  min-height: 200px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 4px 2px;
  flex: 1;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
`;

const DonutTemplate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
  min-height: 250px;
  width: 100%;
  gap: 0;
  overflow: visible;

  @media (max-width: 1200px) {
    min-height: 220px;
  }
`;

const DonutChartWrap = styled.div`
  flex: 0 0 auto;
  height: 60%;
  min-height: 180px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

const DonutLegend = styled.div`
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  width: 100%;
  min-width: 0;
  padding: 4px;
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;

const DonutLegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  min-width: 0;
  padding: 2px 6px;
  border-radius: 7px !important;
  background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.03) 48%
    ),
    rgba(20, 60, 80, 0.04);
  border: 1px solid rgba(24, 72, 96, 0.12);
  box-shadow: 0 1px 1px rgba(17, 42, 56, 0.04);
  transition: all 0.2s ease;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  min-height: 28px;
  &.priority-mini-row {
    min-height: 30px;
    padding: 2px 8px;
  }
  &:hover {
    transform: translateY(-1px);
  }
`;

const DonutLegendLabelWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;
`;

const DonutDot = styled.span<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color} !important;
  background-image: none !important;
  border: 2px solid white;
  box-shadow: 0 0 3px rgba(0,0,0,0.3);
  display: inline-block;
  flex-shrink: 0;

  /* Override global dark-theme pie reset that forces * to transparent */
  .dark-theme [data-test-viz-type='pie'] &,
  [data-theme='dark'] [data-test-viz-type='pie'] & {
    background-color: ${({ $color }) => $color} !important;
    background-image: none !important;
    border-radius: 50% !important;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.3) !important;
  }
`;

const DonutLegendLabel = styled.span`
  font-size: 24px;
  color: #1d2d33;
  font-weight: 700;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.25;
  word-break: normal;
  text-align: left;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const DonutLegendPercent = styled.span`
  font-size: 18px;
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
  color: #5d7079;
  font-variant-numeric: tabular-nums;
  font-weight: 700;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #b0bec5;
  }
`;

const DonutLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 68px;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 4px;
`;

const CenterLabel = styled.div`
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5d7079;
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 6px;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const CenterValue = styled.div`
  font-size: 56px;
  line-height: 1;
  font-weight: 900;
  color: #1d2d33;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const CHART_COLORS = [
  '#1565C0',   
  '#e03b09',  
  '#F9A825', 
  '#43A047',      
  '#EF6C00',   
  '#5E35B1',   
  '#EC407A',   
  '#546E7A',
];

function isPriorityGroupName(name: string) {
  const normalized = name.toLowerCase();
  return (
    normalized.includes('adolescent') ||
    normalized.includes('pregnant') ||
    normalized.includes('under')
  );
}

export default function EchartsPie(props: PieChartTransformedProps) {
  const { height, width, echartOptions, formData } = props;
  const series = Array.isArray(echartOptions?.series)
    ? echartOptions.series[0]
    : undefined;
  const data = series?.data || [];
  const isDonut = Boolean(formData?.donut);

  const total = data.reduce(
    (sum: number, item: { value: number }) => sum + (item.value || 0),
    0,
  );

  const capitalizeFirst = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const chartData = data.map(
    (item: { name: string; value: number }, index: number) => ({
      ...item,
      name: capitalizeFirst(item.name),
      color: CHART_COLORS[index % CHART_COLORS.length],
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
    }),
  );

  return (
    <Container style={{ width, height }}>
      {!isDonut ? (
        <PieTemplate>
          <PieChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius="88%"
                  strokeWidth={0}
                  dataKey="value"
                  animationBegin={120}
                  animationDuration={720}
                  labelLine={true}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    outerRadius,
                    value,
                    index,
                  }: {
                    cx: number;
                    cy: number;
                    midAngle: number;
                    innerRadius: number;
                    outerRadius: number;
                    value: number;
                    index: number;
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const startRadius = outerRadius;
                    const endRadius = outerRadius + 28;
                    const cornerRadius = outerRadius + 18;
                    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
                    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);
                    const cornerX = cx + cornerRadius * Math.cos(-midAngle * RADIAN);
                    const cornerY = cy + cornerRadius * Math.sin(-midAngle * RADIAN);
                    const endX = cx + endRadius * Math.cos(-midAngle * RADIAN);
                    const endY = cy + endRadius * Math.sin(-midAngle * RADIAN);
                    const isRightSide = endX >= cx;
                    const labelOffset = isRightSide ? -8 : 8;
                    const labelX = endX + labelOffset;
                    const fontSize = Math.max(
                      9,
                      Math.min(13, outerRadius * 0.11),
                    );
                    return (
                      <g key={`label-${index}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={cornerX}
                          y2={cornerY}
                          stroke="#546e7a"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                        <line
                          x1={cornerX}
                          y1={cornerY}
                          x2={endX}
                          y2={endY}
                          stroke="#546e7a"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                        <text
                          x={labelX}
                          y={endY}
                          fill="#1d2d33"
                          textAnchor={isRightSide ? 'end' : 'start'}
                          dominantBaseline="central"
                          style={{
                            fontSize: `${fontSize}px`,
                            fontWeight: 700,
                            fontFamily: 'sans-serif',
                            fill: '#ffffff',
                            stroke: '#1d2d33',
                            strokeWidth: '3px',
                            paintOrder: 'stroke fill',
                          }}
                        >
                          {value.toLocaleString()}
                        </text>
                      </g>
                    );
                  }}
                >
                  {chartData.map(
                    (
                      entry: { name: string; value: number; color: string },
                      index: number,
                    ) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ),
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </PieChartWrap>

          <RightPanel>
            <PieLegend>
              <PieLegendRow key="pie-legend-total">
                <PieLegendItem>
                  <PieLegendLabel>Total</PieLegendLabel>
                </PieLegendItem>
                <PieLegendPercent>{total.toLocaleString()}</PieLegendPercent>
              </PieLegendRow>
              {chartData.map(
                (item: {
                  name: string;
                  value: number;
                  color: string;
                  percentage: string;
                }) => (
                  <PieLegendRow key={`pie-legend-${item.name}`}>
                    <PieLegendItem>
                      <Dot
                        $color={item.color}
                        className="pie-color-dot"
                        style={
                          {
                            ['--dot-color' as string]: item.color,
                          } as CSSProperties
                        }
                      />
                      <PieLegendLabel>{item.name}</PieLegendLabel>
                    </PieLegendItem>
                    <PieLegendPercent>{item.percentage}%</PieLegendPercent>
                  </PieLegendRow>
                ),
              )}
            </PieLegend>
          </RightPanel>
        </PieTemplate>
      ) : (
        <DonutTemplate>
          <DonutChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="84%"
                  paddingAngle={1}
                  strokeWidth={0}
                  dataKey="value"
                  animationBegin={120}
                  animationDuration={760}
                  labelLine={true}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    outerRadius,
                    value,
                    index,
                  }: {
                    cx: number;
                    cy: number;
                    midAngle: number;
                    innerRadius: number;
                    outerRadius: number;
                    value: number;
                    index: number;
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const startRadius = outerRadius;
                    const endRadius = outerRadius + 35;
                    const cornerRadius = outerRadius + 22;
                    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
                    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);
                    const cornerX = cx + cornerRadius * Math.cos(-midAngle * RADIAN);
                    const cornerY = cy + cornerRadius * Math.sin(-midAngle * RADIAN);
                    const endX = cx + endRadius * Math.cos(-midAngle * RADIAN);
                    const endY = cy + endRadius * Math.sin(-midAngle * RADIAN);
                    const fontSize = Math.max(
                      11,
                      Math.min(16, outerRadius * 0.12),
                    );
                    return (
                      <g key={`donut-label-${index}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={cornerX}
                          y2={cornerY}
                          stroke="#546e7a"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                        <line
                          x1={cornerX}
                          y1={cornerY}
                          x2={endX}
                          y2={endY}
                          stroke="#546e7a"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                        <text
                          x={endX}
                          y={endY}
                          fill="#1d2d33"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: `${fontSize}px`,
                            fontWeight: 700,
                            fontFamily: 'sans-serif',
                            fill: '#ffffff',
                            stroke: '#1d2d33',
                            strokeWidth: '3px',
                            paintOrder: 'stroke fill',
                          }}
                        >
                          {value.toLocaleString()}
                        </text>
                      </g>
                    );
                  }}
                >
                  {chartData.map(
                    (
                      entry: { name: string; value: number; color: string },
                      index: number,
                    ) => (
                      <Cell key={`donut-cell-${index}`} fill={entry.color} />
                    ),
                  )}
                </Pie>
                <foreignObject
                  x="22%"
                  y="22%"
                  width="56%"
                  height="56%"
                  style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      overflow: 'visible',
                    }}
                  >
                    <CenterLabel>Total</CenterLabel>
                    <CenterValue>{total.toLocaleString()}</CenterValue>
                  </div>
                </foreignObject>
              </PieChart>
            </ResponsiveContainer>
          </DonutChartWrap>

          <DonutLegend>
            {chartData.map(
              (item: {
                name: string;
                value: number;
                color: string;
                percentage: string;
              }) => (
                <DonutLegendRow
                  key={`legend-${item.name}`}
                  className={`pie-mini-row donut-mini-row ${
                    isPriorityGroupName(item.name) ? 'priority-mini-row' : ''
                  }`}
                >
                  <DonutLegendLabelWrap>
                    <DonutDot
                      $color={item.color}
                      className="pie-color-dot"
                      style={
                        {
                          ['--dot-color' as string]: item.color,
                        } as CSSProperties
                      }
                    />
                    <DonutLegendLabel>{item.name}</DonutLegendLabel>
                  </DonutLegendLabelWrap>
                  <DonutLegendValueStack>
                    <DonutLegendPercent>{item.percentage}%</DonutLegendPercent>
                  </DonutLegendValueStack>
                </DonutLegendRow>
              ),
            )}
          </DonutLegend>
        </DonutTemplate>
      )}
    </Container>
  );
}
