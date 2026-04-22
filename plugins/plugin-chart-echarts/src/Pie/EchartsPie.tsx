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
  background: #F6F8FA;
  border-radius: 28px;
  box-shadow: 0 14px 30px rgba(22, 41, 50, 0.18);
  box-sizing: border-box;
  overflow: visible;
  --pie-connector-color: #14181d;
  body.dark-theme &,
  [data-theme='dark'] & {
    background: #2F2F2F;
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.52),
      0 0 0 1px rgba(124, 164, 185, 0.16);
    --pie-connector-color: #ffffff;
  }
`;

const PieLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const PieLegendRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 2px;
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
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
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
  font-size: 24px;
  color: #1d2d33;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const PieLegendPercent = styled.span`
  display: inline-block;
  font-size: 28px;
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

const PieLegendTotalLabel = styled(PieLegendLabel)`
  font-size: 24px;
`;

const PieLegendTotalValue = styled(PieLegendPercent)`
  font-size: 28px;
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
  flex: 0 0 60%;
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
  grid-auto-rows: max-content;
  align-content: start;
  gap: 0;
  width: 100%;
  min-width: 0;
  padding: 0 2px;
  overflow-y: hidden;
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
  gap: 8px;
  min-width: 0;
  padding: 0 3px;
  border-radius: 6px !important;
  background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.03) 48%
    ),
    rgba(20, 60, 80, 0.04);
  border: 1px solid rgba(24, 72, 96, 0.12);
  box-shadow: 0 1px 1px rgba(17, 42, 56, 0.04);
  transition: all 0.2s ease;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  height: 30px;
  &.priority-mini-row {
    height: 30px;
    padding: 0 4px;
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
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
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
  font-size: 26px;
  color: #1d2d33;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
  word-break: normal;
  text-align: left;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const DonutLegendPercent = styled.span`
  display: inline-block;
  font-size: 28px;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
  color: #5d7079;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  transform: translateX(-18px);

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
  min-width: 76px;
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

type SliceLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  value: number;
  index: number;
};

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

  const renderSliceLabel =
    (mode: 'pie' | 'donut') =>
    ({ cx, cy, midAngle, outerRadius, value, index }: SliceLabelProps) => {
      const RADIAN = Math.PI / 180;
      const angle = -midAngle * RADIAN;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const isRightSide = cos >= 0;
      const slicePercentage =
        chartData[index]?.percentage ?? (total > 0 ? ((value / total) * 100).toFixed(1) : '0.0');
      const labelText = `${slicePercentage}%`;
      const radialStart = outerRadius;
      const radialBend = outerRadius + 14;
      const labelPad = 7;
      const connectorStroke = mode === 'pie' ? 3 : 2;
      const connectorColor = 'var(--pie-connector-color)';
      const fontSize = Math.max(
        mode === 'pie' ? 22 : 22,
        Math.min(mode === 'pie' ? 36 : 34, outerRadius * 0.32),
      );

      const chartWidth = cx * 2;
      const chartHeight = cy * 2;
      const safeX = 14;
      const safeY = 10;
      const estimatedLabelWidth = Math.max(36, fontSize * 0.58 * labelText.length);
      const horizontalLen = Math.max(24, Math.min(50, chartWidth * 0.13));

      const startX = cx + radialStart * cos;
      const startY = cy + radialStart * sin;
      const bendX = cx + radialBend * cos;
      const bendY = cy + radialBend * sin;

      const rawEndX = bendX + (isRightSide ? horizontalLen : -horizontalLen);
      const edgeInset = estimatedLabelWidth + labelPad + safeX;
      const endMinX = isRightSide ? safeX : edgeInset;
      const endMaxX = isRightSide ? chartWidth - edgeInset : chartWidth - safeX;
      const endX = Math.max(endMinX, Math.min(endMaxX, rawEndX));
      const endY = Math.max(safeY, Math.min(chartHeight - safeY, bendY));

      const rawTextX = endX + (isRightSide ? labelPad : -labelPad);
      const textMinX = isRightSide ? safeX : safeX + estimatedLabelWidth;
      const textMaxX = isRightSide
        ? chartWidth - safeX - estimatedLabelWidth
        : chartWidth - safeX;
      const textX = Math.max(textMinX, Math.min(textMaxX, rawTextX));
      const textY = Math.max(safeY, Math.min(chartHeight - safeY, endY));

      const keyPrefix = mode === 'pie' ? 'label' : 'donut-label';

      return (
        <g key={`${keyPrefix}-${index}`}>
          <line
            x1={startX}
            y1={startY}
            x2={bendX}
            y2={bendY}
            stroke={connectorColor}
            strokeWidth={connectorStroke}
            strokeLinecap="round"
          />
          <line
            x1={bendX}
            y1={bendY}
            x2={endX}
            y2={endY}
            stroke={connectorColor}
            strokeWidth={connectorStroke}
            strokeLinecap="round"
          />
          <text
            x={textX}
            y={textY}
            fill="var(--pie-foreground)"
            textAnchor={isRightSide ? 'start' : 'end'}
            dominantBaseline="central"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.45)',
            }}
          >
            {labelText}
          </text>
        </g>
      );
    };

  return (
    <Container style={{ width, height }}>
      {!isDonut ? (
        <PieTemplate>
          <PieChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius="76%"
                  strokeWidth={0}
                  dataKey="value"
                  animationBegin={120}
                  animationDuration={720}
                  labelLine={false}
                  label={renderSliceLabel('pie')}
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
                  <PieLegendTotalLabel>Total</PieLegendTotalLabel>
                </PieLegendItem>
                <PieLegendTotalValue>{total.toLocaleString()}</PieLegendTotalValue>
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
                    <PieLegendPercent>{item.value.toLocaleString()}</PieLegendPercent>
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
              <PieChart margin={{ top: 8, right: 30, bottom: 8, left: 30 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="78%"
                  paddingAngle={1}
                  strokeWidth={0}
                  dataKey="value"
                  animationBegin={120}
                  animationDuration={760}
                  labelLine={false}
                  label={renderSliceLabel('donut')}
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
                    <DonutLegendPercent>{item.value.toLocaleString()}</DonutLegendPercent>
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
