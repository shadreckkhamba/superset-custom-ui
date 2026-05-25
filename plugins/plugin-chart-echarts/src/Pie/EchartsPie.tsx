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
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { styled } from '@superset-ui/core';
import type { CSSProperties } from 'react';
import { PieChartTransformedProps } from './types';

const Container = styled.div<{ $showSkeleton?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  border-radius: 28px;
  box-shadow: 0 14px 30px rgba(22, 41, 50, 0.18);
  box-sizing: border-box;
  overflow: visible;
  --pie-connector-color: #14181d;
  --pie-foreground: #14181d;
  position: relative;

  ${({ $showSkeleton }) =>
    $showSkeleton &&
    `
    overflow: hidden;
    & > * {
      opacity: 0;
      pointer-events: none;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        90deg,
        rgba(130, 152, 164, 0.16) 0%,
        rgba(130, 152, 164, 0.32) 45%,
        rgba(130, 152, 164, 0.16) 100%
      );
      background-size: 220% 100%;
      animation: pieChartSkeletonShimmer 1.1s linear infinite;
      z-index: 3;
    }
  `}

  body.theme-transitioning & {
    overflow: hidden;
  }

  body.theme-transitioning & > * {
    opacity: 0 !important;
    pointer-events: none;
  }

  body.theme-transitioning &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      rgba(130, 152, 164, 0.16) 0%,
      rgba(130, 152, 164, 0.32) 45%,
      rgba(130, 152, 164, 0.16) 100%
    );
    background-size: 220% 100%;
    animation: pieChartSkeletonShimmer 1.1s linear infinite;
    z-index: 3;
  }

  @keyframes pieChartSkeletonShimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #2F2F2F;
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.52),
      0 0 0 1px rgba(124, 164, 185, 0.16);
    --pie-connector-color: #ffffff;
    --pie-foreground: #ffffff;
  }
`;

const SkeletonWrap = styled.div`
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SkeletonChartArea = styled.div`
  flex: 0 0 58%;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SkeletonRing = styled.div`
  width: min(72%, 240px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 22px solid rgba(130, 152, 164, 0.18);
  position: relative;
  background: transparent;

  &::after {
    content: '';
    position: absolute;
    inset: -22px;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      rgba(130, 152, 164, 0.14) 0%,
      rgba(130, 152, 164, 0.28) 45%,
      rgba(130, 152, 164, 0.14) 100%
    );
    background-size: 220% 100%;
    animation: pieChartSkeletonShimmer 1.1s linear infinite;
    -webkit-mask: radial-gradient(circle, transparent 56%, #000 57%);
    mask: radial-gradient(circle, transparent 56%, #000 57%);
  }
`;

const SkeletonLegend = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkeletonLegendRow = styled.div`
  height: 34px;
  border-radius: 7px;
  background: linear-gradient(
    90deg,
    rgba(130, 152, 164, 0.14) 0%,
    rgba(130, 152, 164, 0.28) 45%,
    rgba(130, 152, 164, 0.14) 100%
  );
  background-size: 220% 100%;
  animation: pieChartSkeletonShimmer 1.1s linear infinite;
`;

const PieLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const PieLegendRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 4px;
  padding: 6px 4px;
  border-radius: 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 0;
  width: 100%;
  box-sizing: border-box;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }

  body.dark-theme &,
  [data-theme='dark'] & {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    
    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color} !important;
  background-image: none !important;
  border: none;
  box-shadow: none;
  flex-shrink: 0;
  display: inline-block;

  /* Override global dark-theme pie reset that forces * to transparent */
  .dark-theme [data-test-viz-type='pie'] &,
  [data-theme='dark'] [data-test-viz-type='pie'] & {
    background-color: ${({ $color }) => $color} !important;
    background-image: none !important;
    border-radius: 2px !important;
    box-shadow: none !important;
  }
`;

const PieLegendLabel = styled.span`
  font-size: 22px;
  color: #1d2d33;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #e0e0e0;
  }
`;

const PieLegendPercent = styled.span`
  display: inline-block;
  font-size: 20px;
  color: #5d7079;
  font-weight: 600;
  flex-shrink: 0;
  justify-self: end;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #b0bec5;
  }
`;

const PieLegendTotalLabel = styled(PieLegendLabel)`
  font-size: 24px;
  font-weight: 600;
`;

const PieLegendTotalValue = styled(PieLegendPercent)`
  font-size: 26px;
  font-weight: 700;
`;

const PieTemplate = styled.div<{ $orientation?: string }>`
  display: flex;
  flex-direction: ${({ $orientation }) => {
    if ($orientation === 'top' || $orientation === 'bottom') return 'column';
    return 'row';
  }};
  height: 100%;
  min-height: 0;
  gap: 20px;
  align-items: stretch;
  padding: 16px 24px;
  box-sizing: border-box;
  
  ${({ $orientation }) => $orientation === 'top' && 'flex-direction: column-reverse;'}
  ${({ $orientation }) => $orientation === 'left' && 'flex-direction: row-reverse;'}
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px 16px;
  }
`;

const PieChartWrap = styled.div<{ $orientation?: string }>`
  flex: ${({ $orientation }) => {
    if ($orientation === 'top' || $orientation === 'bottom') return '1';
    return '0 0 60%';
  }};
  min-height: 200px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;

  @media (max-width: 1024px) {
    min-height: 180px;
  }

  @media (max-width: 768px) {
    min-height: 160px;
  }
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  min-width: 0;
  overflow: visible;
  padding: 4px 0;
  flex: 1;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow: visible;
`;

const DonutTemplate = styled.div<{ $orientation?: string }>`
  display: flex;
  flex-direction: ${({ $orientation }) => {
    if ($orientation === 'left' || $orientation === 'right') return 'row';
    return 'column';
  }};
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
  min-height: 250px;
  width: 100%;
  gap: 0;
  overflow: visible;
  padding: 16px 24px;
  box-sizing: border-box;

  ${({ $orientation }) => $orientation === 'top' && 'flex-direction: column-reverse;'}
  ${({ $orientation }) => $orientation === 'left' && 'flex-direction: row-reverse;'}

  @media (max-width: 1200px) {
    min-height: 220px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const DonutChartWrap = styled.div<{ $orientation?: string }>`
  flex: ${({ $orientation }) => {
    if ($orientation === 'left' || $orientation === 'right') return '0 0 60%';
    return '0 0 auto';
  }};
  height: ${({ $orientation }) => {
    if ($orientation === 'left' || $orientation === 'right') return '100%';
    return '70%';
  }};
  min-height: 180px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;

  @media (max-width: 768px) {
    min-height: 160px;
  }
`;

const DonutLegend = styled.div<{ $orientation?: string }>`
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: max-content;
  align-content: ${({ $orientation }) => {
    if ($orientation === 'bottom') return 'start';
    return 'end';
  }};
  gap: 0;
  width: 100%;
  min-width: 0;
  padding: ${({ $orientation }) => {
    if ($orientation === 'left' || $orientation === 'right') return '2px 6px';
    return '0 2px 6px';
  }};
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }

  scrollbar-width: thin;
`;

const DonutLegendRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 4px;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 0;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }

  body.dark-theme &,
  [data-theme='dark'] & {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    
    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

const DonutLegendLabelWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
`;

const DonutDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color} !important;
  background-image: none !important;
  border: none;
  box-shadow: none;
  display: inline-block;
  flex-shrink: 0;

  /* Override global dark-theme pie reset that forces * to transparent */
  .dark-theme [data-test-viz-type='pie'] &,
  [data-theme='dark'] [data-test-viz-type='pie'] & {
    background-color: ${({ $color }) => $color} !important;
    background-image: none !important;
    border-radius: 2px !important;
    box-shadow: none !important;
  }
`;

const DonutLegendLabel = styled.span`
  font-size: 18px;
  color: #1d2d33;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  word-break: normal;
  text-align: left;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #e0e0e0;
  }
`;

const DonutLegendPercent = styled.span`
  display: inline-block;
  font-size: 20px;
  line-height: 1.3;
  text-align: right;
  white-space: nowrap;
  color: #5d7079;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  justify-self: end;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #b0bec5;
  }
`;

const DonutLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  min-width: 0;
  flex-shrink: 0;
  margin-left: auto;
`;

const CenterLabel = styled.div`
  font-size: clamp(18px, 2.8vw, 32px);
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
  font-size: clamp(28px, 5vw, 56px);
  line-height: 1;
  font-weight: 900;
  color: #1d2d33;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const ChartEmptyState = styled.div`
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  border-radius: 24px;
  border: 1px dashed rgba(21, 101, 192, 0.24);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(227, 239, 246, 0.8) 100%
  );
  color: #48616d;
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 700;

  body.dark-theme &,
  [data-theme='dark'] & {
    border-color: rgba(148, 163, 184, 0.32);
    background: linear-gradient(
      180deg,
      rgba(40, 50, 63, 0.72) 0%,
      rgba(20, 24, 29, 0.92) 100%
    );
    color: #d5e5ec;
  }
`;

const LegendEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 96px;
  padding: 18px 16px;
  border-radius: 12px;
  background: #edf3f6;
  border: 1px dashed #d4dfe4;
  color: #5d7079;
  text-align: center;
  font-size: clamp(14px, 1.8vw, 18px);
  font-weight: 700;

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #252540;
    border-color: #3d4a5a;
    color: #c8d3dc;
  }
`;

type SliceLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  value: number;
  index: number;
};

export default function EchartsPie(props: PieChartTransformedProps) {
  const { height, width, echartOptions, formData } = props;
  const series = Array.isArray(echartOptions?.series)
    ? echartOptions.series[0]
    : undefined;
  const data = series?.data || [];
  const isDonut = Boolean(formData?.donut);

  const total = data.reduce(
    (sum: number, item: { value: number }) => sum + (Number(item.value) || 0),
    0,
  );

  const capitalizeFirst = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const chartData = data.map(
    (item: { name: string; value: number; itemStyle?: { color?: string } }, index: number) => ({
      ...item,
      name: capitalizeFirst(item.name),
      color: item.itemStyle?.color || '#1565C0',
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
    }),
  );
  const hasData = chartData.some((item: { value: number }) => Number(item.value) > 0);

  const [showSkeleton, setShowSkeleton] = useState(chartData.length === 0);

  useEffect(() => {
    let timeoutId: number;

    if (chartData.length > 0) {
      timeoutId = window.setTimeout(() => setShowSkeleton(false), 180);
    } else {
      setShowSkeleton(true);
      timeoutId = window.setTimeout(() => setShowSkeleton(false), 1400);
    }

    return () => window.clearTimeout(timeoutId);
  }, [chartData.length]);

  if (showSkeleton) {
    return (
      <Container style={{ width, height }}>
        <SkeletonWrap>
          <SkeletonChartArea>
            <SkeletonRing />
          </SkeletonChartArea>
          <SkeletonLegend>
            <SkeletonLegendRow />
            <SkeletonLegendRow />
            <SkeletonLegendRow />
            <SkeletonLegendRow />
          </SkeletonLegend>
        </SkeletonWrap>
      </Container>
    );
  }

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
      const radialBend = outerRadius + (mode === 'pie' ? 10 : 8);
      const labelPad = 7;
      const connectorStroke = mode === 'pie' ? 1.5 : 2;
      const connectorColor = 'var(--pie-connector-color)';
      const fontSize = Math.max(
        mode === 'pie' ? 20 : 22,
        Math.min(mode === 'pie' ? 36 : 34, outerRadius * 0.32),
      );

      const chartWidth = cx * 2;
      const chartHeight = cy * 2;
      const safeX = mode === 'pie' ? 24 : 14;
      const safeY = mode === 'pie' ? 18 : 12;
      const estimatedLabelWidth = Math.max(36, fontSize * 0.62 * labelText.length);
      const textHalfHeight = Math.max(9, fontSize * 0.52);
      const horizontalLen =
        mode === 'pie'
          ? Math.max(14, Math.min(28, chartWidth * 0.08))
          : Math.max(12, Math.min(24, chartWidth * 0.08));

      const startX = cx + radialStart * cos;
      const startY = cy + radialStart * sin;
      const bendX = cx + radialBend * cos;
      const bendY = cy + radialBend * sin;

      const rawEndX = bendX + (isRightSide ? horizontalLen : -horizontalLen);
      const edgeInset = estimatedLabelWidth + labelPad + safeX;
      const endMinX = isRightSide ? safeX : edgeInset;
      const endMaxX = isRightSide ? chartWidth - edgeInset : chartWidth - safeX;
      const endX = Math.max(endMinX, Math.min(endMaxX, rawEndX));
      const yMin = safeY + textHalfHeight;
      const yMax = chartHeight - safeY - textHalfHeight;
      const endY = Math.max(yMin, Math.min(yMax, bendY));

      const rawTextX = endX + (isRightSide ? labelPad : -labelPad);
      const textMinX = isRightSide ? safeX : safeX + estimatedLabelWidth;
      const textMaxX = isRightSide
        ? chartWidth - safeX - estimatedLabelWidth
        : chartWidth - safeX;
      const textX = Math.max(textMinX, Math.min(textMaxX, rawTextX));
      const textY = Math.max(yMin, Math.min(yMax, endY));

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
        <PieTemplate $orientation={formData?.legendOrientation}>
          <PieChartWrap $orientation={formData?.legendOrientation}>
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={`${formData?.outerRadius ?? 80}%`}
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
            ) : (
              <ChartEmptyState>No data available</ChartEmptyState>
            )}
          </PieChartWrap>

          {formData?.showLegend !== false && (
            <RightPanel>
              <PieLegend>
                <PieLegendRow key="pie-legend-total">
                  <PieLegendItem>
                    <PieLegendTotalLabel>Total</PieLegendTotalLabel>
                  </PieLegendItem>
                  <PieLegendTotalValue>{total.toLocaleString()}</PieLegendTotalValue>
                </PieLegendRow>
                {hasData ? (
                  chartData.map(
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
                  )
                ) : (
                  <LegendEmptyState>No data available</LegendEmptyState>
                )}
              </PieLegend>
            </RightPanel>
          )}
        </PieTemplate>
      ) : (
        <DonutTemplate $orientation={formData?.legendOrientation}>
          <DonutChartWrap $orientation={formData?.legendOrientation}>
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={`${formData?.innerRadius ?? 63}%`}
                    outerRadius={`${formData?.outerRadius ?? 90}%`}
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
            ) : (
              <ChartEmptyState>No data available</ChartEmptyState>
            )}
          </DonutChartWrap>

          {formData?.showLegend !== false && (
            <DonutLegend $orientation={formData?.legendOrientation}>
              {hasData ? (
                chartData.map(
                  (item: {
                    name: string;
                    value: number;
                    color: string;
                    percentage: string;
                  }) => (
                    <DonutLegendRow
                      key={`legend-${item.name}`}
                      className="donut-mini-row"
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
                )
              ) : (
                <LegendEmptyState>No data available</LegendEmptyState>
              )}
            </DonutLegend>
          )}
        </DonutTemplate>
      )}
    </Container>
  );
}
