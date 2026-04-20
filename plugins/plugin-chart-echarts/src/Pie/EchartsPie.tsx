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
  --pie-bg: #f7fafb;
  --pie-border: #d8e3e8;
  --pie-muted: #5d7079;
  --pie-foreground: #1d2d33;
  --pie-row-bg: #edf3f6;
  --pie-row-bg-strong: #e8f0f3;
  --pie-donut-row-bg: #ebf2f5;
  --pie-row-border: #d4dfe4;
  --pie-row-shadow: 0 1px 2px rgba(22, 41, 50, 0.08);
  --pie-icon-bg: var(--pie-bg);
  --pie-icon-border: var(--pie-border);
  --pie-swatch-ring: #ffffff;
  --pie-swatch-outer-ring: rgba(255, 255, 255, 0.35);
  --pie-swatch-glow-multiplier: 66;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  background: var(--pie-bg);
  border-radius: ${({ theme }) => theme.gridUnit * 2.5}px;
  border: 1px solid var(--pie-border);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  box-sizing: border-box;

  body.dark-theme &,
  [data-theme='dark'] & {
    --pie-bg: #0a0a0a;
    --pie-border: #1f3744;
    --pie-muted: #77cbe5;
    --pie-foreground: #eef8fa;
    --pie-row-bg: rgba(255, 255, 255, 0.04);
    --pie-row-bg-strong: rgba(255, 255, 255, 0.06);
    --pie-donut-row-bg: rgba(255, 255, 255, 0.03);
    --pie-row-border: rgba(255, 255, 255, 0.1);
    --pie-row-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    background: #0a0a0a;
    border: 1px solid #1f3744;
    box-shadow: inset 0 0 0 1px rgba(80, 140, 165, 0.15);
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
  flex: 0 0 55%;
  min-height: 200px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const DetailCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
  overflow-y: auto;
  padding: 8px;
  flex: 1;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  min-width: 0;
  overflow: hidden;
`;

const DetailCard = styled.div`
  border-radius: ${({ theme }) => theme.gridUnit * 2.2}px !important;
  border: 1px solid var(--pie-row-border) !important;
  background: var(--pie-row-bg-strong) !important;
  box-shadow: var(--pie-row-shadow);
  padding: ${({ theme }) => theme.gridUnit * 1.5}px
    ${({ theme }) => theme.gridUnit * 2}px;
  transition: all 0.2s ease;
  overflow: visible;
  min-height: 196px;
  &.priority-mini-row {
    min-height: 220px;
    padding-top: ${({ theme }) => theme.gridUnit * 2}px;
    padding-bottom: ${({ theme }) => theme.gridUnit * 2}px;
  }
  &:hover {
    transform: translateY(-1px);
  }
`;

const CardLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.gridUnit * 0.8}px;
`;

const CardDot = styled.span<{ $color: string }>`
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid var(--pie-swatch-ring);
  box-shadow: 0 0 6px ${({ $color }) => $color}aa;
  display: inline-block;
  flex-shrink: 0;
  body.dark-theme &,
  [data-theme='dark'] & {
    border-color: rgba(232, 248, 252, 0.95);
    box-shadow: 0 0 0 1px rgba(23, 44, 54, 0.9);
  }
`;

const CardLabel = styled.span`
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pie-foreground);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  word-break: normal;
  text-align: center;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const CardPercentage = styled.div`
  font-size: 30px;
  line-height: 1.2;
  color: var(--pie-muted);
  font-weight: 700;
  margin-top: ${({ theme }) => theme.gridUnit * 0.4}px;
  text-align: center;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const PieLegendRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(172px, auto);
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit}px;
  padding: ${({ theme }) => theme.gridUnit * 1.05}px
    ${({ theme }) => theme.gridUnit * 2}px;
  border-radius: ${({ theme }) => theme.gridUnit * 1.8}px !important;
  background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.02) 48%
    ),
    var(--pie-row-bg) !important;
  border: 1px solid var(--pie-row-border) !important;
  box-shadow: var(--pie-row-shadow);
  transition: all 0.2s ease;
  overflow: visible;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  min-height: 102px;
  &.priority-mini-row {
    min-height: 108px;
    padding-top: ${({ theme }) => theme.gridUnit * 0.7}px;
    padding-bottom: ${({ theme }) => theme.gridUnit * 0.7}px;
  }
  &:hover {
    transform: translateY(-1px);
  }
`;

const LegendLabelWrap = styled.div`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit * 0.8}px;
  min-width: 0;
  justify-items: start;
`;

const PieLegendLabel = styled.span`
  font-size: 29px;
  color: var(--pie-foreground);
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

const PieLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.gridUnit * 0.3}px;
  justify-self: end;
  width: 172px;
  margin-left: auto;
  padding-right: 0;
  transform: translateX(-14px);
`;

const PieLegendPercent = styled.span`
  font-size: 27px;
  line-height: 1.2;
  text-align: right;
  white-space: nowrap;
  color: var(--pie-muted);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  opacity: 0.9;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
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
`;

const DonutLegend = styled.div`
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
  width: 100%;
  min-width: 0;
  padding: 8px;
  overflow-y: auto;s
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
  gap: 15px;
  min-width: 0;
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.gridUnit * 1.8}px !important;
  background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.02) 48%
    ),
    var(--pie-donut-row-bg) !important;
  border: 1px solid var(--pie-row-border) !important;
  box-shadow: var(--pie-row-shadow);
  transition: all 0.2s ease;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  min-height: 32px;
  &.priority-mini-row {
    min-height: 32px;
    padding: 2px 6px;
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

const Dot = styled.span<{ $color: string }>`
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  border-radius: 50% !important;
  background: ${({ $color }) => $color} !important;
  border: 2px solid var(--pie-swatch-ring) !important;
  box-shadow: 0 0 0 2px var(--pie-swatch-outer-ring),
    0 0 12px ${({ $color }) => $color}aa !important;
  display: inline-block !important;
  flex-shrink: 0;
  body.dark-theme &,
  [data-theme='dark'] & {
    border-color: rgba(232, 248, 252, 0.95) !important;
    box-shadow: 0 0 0 1px rgba(23, 44, 54, 0.9) !important;
    filter: none !important;
  }
`;



const DonutLegendLabel = styled.span`
  font-size: 32px;
  color: var(--pie-foreground);
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
  font-size: 28px;
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
  color: var(--pie-muted);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  opacity: 0.9;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const DonutLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 80px;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 10px;
`;

const CenterLabel = styled.div`
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--pie-muted);
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 6px;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #8fd8f2;
  }
`;


const CenterValue = styled.div`
  font-size: 56px;
  line-height: 1;
  font-weight: 900;
  color: var(--pie-foreground);
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

  const shouldShowCards = chartData.length > 0 && chartData.length <= 4;

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
                    const radius = outerRadius + 15;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const color = chartData[index]?.color || '#000';
                    return (
                      <g key={`label-${index}`}>
                        <line
                          x1={cx + innerRadius * Math.cos(-midAngle * RADIAN)}
                          y1={cy + innerRadius * Math.sin(-midAngle * RADIAN)}
                          x2={x}
                          y2={y}
                          stroke={color}
                          strokeWidth={1.5}
                          opacity={0.7}
                        />
                        <text
                          x={x}
                          y={y}
                          fill="var(--pie-foreground)"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            textShadow: '0 0 3px rgba(0,0,0,0.3)',
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
            {shouldShowCards && (
              <DetailCardsGrid>
                <DetailCard key="card-total" className="pie-mini-row priority-mini-row">
                  <CardLabelWrapper>
                    <CardDot $color="#1565C0" />
                    <CardLabel>Total</CardLabel>
                  </CardLabelWrapper>
                  <CardPercentage>{total.toLocaleString()}</CardPercentage>
                </DetailCard>
                {chartData.map(
                (
                  item: {
                    name: string;
                    value: number;
                    color: string;
                    percentage: string;
                  },
                  index: number,
                ) => (
                  <DetailCard
                    key={`card-${item.name}`}
                    className={`pie-mini-row ${
                      isPriorityGroupName(item.name) ? 'priority-mini-row' : ''
                    }`}
                  >
                    <CardLabelWrapper>
                      <CardDot $color={item.color} />
                      <CardLabel>{item.name}</CardLabel>
                    </CardLabelWrapper>
                    <CardPercentage>{item.percentage}%</CardPercentage>
                  </DetailCard>
                ),
              )}
              </DetailCardsGrid>
            )}
            <PieLegend>
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
                    const radius = outerRadius + 12;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const color = chartData[index]?.color || '#000';
                    return (
                      <g key={`donut-label-${index}`}>
                        <line
                          x1={cx + innerRadius * Math.cos(-midAngle * RADIAN)}
                          y1={cy + innerRadius * Math.sin(-midAngle * RADIAN)}
                          x2={x}
                          y2={y}
                          stroke={color}
                          strokeWidth={1.5}
                          opacity={0.7}
                        />
                        <text
                          x={x}
                          y={y}
                          fill="var(--pie-foreground)"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            textShadow: '0 0 3px rgba(0,0,0,0.3)',
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
