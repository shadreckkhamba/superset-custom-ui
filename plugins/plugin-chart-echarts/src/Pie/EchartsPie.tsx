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
  border-radius: ${({ theme }) => theme.gridUnit * 2.5}px;
  border: 1px solid #d8e3e8;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35), 0 1px 2px rgba(22, 41, 50, 0.08);
  box-sizing: border-box;
  overflow: visible;
  body.dark-theme &,
  [data-theme='dark'] & {
    background: #1a1a2e;
    border: 1px solid #2d3a4a;
    box-shadow: inset 0 0 0 1px rgba(80, 140, 165, 0.15), 0 1px 2px rgba(0, 0, 0, 0.3);
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

const PieLegendRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 2px;
  padding: 1px 3px;
  border-radius: 4px;
  background: #edf3f6;
  border: 1px solid #d4dfe4;
  box-shadow: 0 1px 1px rgba(17, 42, 56, 0.04);
  transition: background 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  min-height: 38px;
  &.priority-mini-row {
    min-height: 40px;
    padding-top: 1px;
    padding-bottom: 1px;
  }
  body.dark-theme &,
  [data-theme='dark'] & {
    background: #252540;
    border: 1px solid #3d4a5a;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  }
`;

const LegendLabelWrap = styled.div`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 2px;
  min-width: 0;
  justify-items: start;
`;

const PieLegendLabel = styled.span`
  font-size: 16px;
  color: #1d2d33;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  word-break: normal;
  text-align: left;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const PieLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  justify-self: end;
  width: auto;
  min-width: 74px;
  margin-left: auto;
  padding-right: 1px;
  transform: none;
`;

const PieLegendPercent = styled.span`
  font-size: 15px;
  line-height: 1.2;
  text-align: right;
  white-space: nowrap;
  color: #5d7079;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #b0bec5;
  }
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
  overflow: hidden;
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
  padding: 1px 3px;
  border-radius: 4px;
  background: #ebf2f5;
  border: 1px solid #d4dfe4;
  box-shadow: 0 1px 1px rgba(17, 42, 56, 0.04);
  transition: all 0.2s ease;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  min-height: 28px;
  &.priority-mini-row {
    min-height: 30px;
    padding: 1px 4px;
  }
  &:hover {
    transform: translateY(-1px);
  }
  body.dark-theme &,
  [data-theme='dark'] & {
    background: #252540;
    border: 1px solid #3d4a5a;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  }
`;

const DonutLegendLabelWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;
`;

const Dot = styled.span<{ $color: string }>`
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  border-radius: 50% !important;
  background: ${({ $color }) => $color} !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35), 0 0 12px ${({ $color }) => $color}aa !important;
  display: inline-block !important;
  flex-shrink: 0;
  body.dark-theme &,
  [data-theme='dark'] & {
    border: 2px solid #1a1a2e !important;
    box-shadow: 0 0 0 1px #555a6a !important;
  }
`;



const DonutLegendLabel = styled.span`
  font-size: 20px;
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
    color: #b0bec5;
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

  const isDarkTheme = typeof document !== 'undefined' && 
    (document.body.classList.contains('dark-theme') || 
     document.body.getAttribute('data-theme') === 'dark');

  const labelColor = isDarkTheme ? '#ffffff' : '#1d2d33';
  const connectorColor = isDarkTheme ? '#90a4ae' : '#455a64';

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
                    innerRadius,
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
                    const endRadius = outerRadius + 14;
                    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
                    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);
                    const endX = cx + endRadius * Math.cos(-midAngle * RADIAN);
                    const endY = cy + endRadius * Math.sin(-midAngle * RADIAN);
                    const isRightSide = endX >= cx;
                    const chartWidth = cx * 2;
                    const labelX = Math.max(
                      12,
                      Math.min(chartWidth - 12, endX + (isRightSide ? -4 : 4)),
                    );
                    const valueFontSize = Math.max(
                      14,
                      Math.min(24, outerRadius * 0.19),
                    );
                    const connectorWidth = Math.max(
                      3,
                      Math.min(5, outerRadius * 0.04),
                    );
                    return (
                      <g key={`label-${index}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke={connectorColor}
                          strokeWidth={connectorWidth}
                          strokeLinecap="round"
                        />
                        <text
                          x={labelX}
                          y={endY}
                          fill={labelColor}
                          textAnchor={isRightSide ? 'end' : 'start'}
                          dominantBaseline="central"
                          style={{
                            fontSize: `${valueFontSize}px`,
                            fontWeight: 700,
                            fontFamily: 'sans-serif',
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
              <PieLegendRow key="pie-legend-total" className="pie-mini-row">
                <LegendLabelWrap>
                  <Dot $color="#1565C0" className="pie-color-dot" />
                  <PieLegendLabel>Total</PieLegendLabel>
                </LegendLabelWrap>
                <PieLegendValueStack>
                  <PieLegendPercent>{total.toLocaleString()}</PieLegendPercent>
                </PieLegendValueStack>
              </PieLegendRow>
              {chartData.map(
                (item: {
                  name: string;
                  value: number;
                  color: string;
                  percentage: string;
                }) => (
                  <PieLegendRow
                    key={`pie-legend-${item.name}`}
                    className={`pie-mini-row ${
                      isPriorityGroupName(item.name) ? 'priority-mini-row' : ''
                    }`}
                  >
                    <LegendLabelWrap>
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
                    </LegendLabelWrap>
                    <PieLegendValueStack>
                      <PieLegendPercent>{item.percentage}%</PieLegendPercent>
                    </PieLegendValueStack>
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
                    innerRadius,
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
                    const endRadius = outerRadius + 24;
                    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
                    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);
                    const endX = cx + endRadius * Math.cos(-midAngle * RADIAN);
                    const endY = cy + endRadius * Math.sin(-midAngle * RADIAN);
                    const valueFontSize = Math.max(
                      16,
                      Math.min(30, outerRadius * 0.23),
                    );
                    const connectorWidth = Math.max(
                      3,
                      Math.min(5, outerRadius * 0.04),
                    );
                    return (
                      <g key={`donut-label-${index}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke={connectorColor}
                          strokeWidth={connectorWidth}
                          strokeLinecap="round"
                        />
                        <text
                          x={endX}
                          y={endY}
                          fill={labelColor}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: `${valueFontSize}px`,
                            fontWeight: 700,
                            fontFamily: 'sans-serif',
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
                    <Dot
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
