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
import { styled } from '@superset-ui/core';
import { DoughnutChartDataItem, DoughnutChartProps } from './types';

const PALETTE = ['#14b8a6', '#4f16c9', '#0ea678', '#22c55e', '#06b6d4'];

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.grayscale.light4};
  overflow: hidden;
`;

const CanvasViewport = styled.div<{ $width: number; $height: number }>`
  width: ${({ $width }) => `${$width}px`};
  height: ${({ $height }) => `${$height}px`};
  position: relative;
  overflow: hidden;
`;

const ScaledCanvas = styled.div<{ $scale: number }>`
  width: 300px;
  height: 380px;
  transform: ${({ $scale }) => `scale(${$scale})`};
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.gridUnit * 3}px;
  background: ${({ theme }) => theme.colors.grayscale.light4};
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${({ theme }) =>
    `${theme.gridUnit * 2}px ${theme.gridUnit * 2.5}px`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary.base};
`;

const Body = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 164px 1fr;
  gap: ${({ theme }) => theme.gridUnit * 2}px;
  align-items: center;
  padding: ${({ theme }) =>
    `${theme.gridUnit * 2.5}px ${theme.gridUnit * 1.5}px`};
  min-height: 0;
  overflow: hidden;
`;

const DonutWrap = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Donut = styled.div<{ $gradient: string }>`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: ${({ $gradient }) => $gradient};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${({ theme }) => theme.colors.grayscale.light4};
  }
`;

const CenterText = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const CenterLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const CenterValue = styled.span`
  font-size: 40px;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit * 1.5}px;
  min-width: 0;
`;

const LegendItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.gridUnit * 1.5}px;
  align-items: center;
  min-width: 0;
`;

const Dot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

const LegendText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit}px;
  min-width: 0;
`;

const LegendName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => `${Math.max(0, Math.min(100, $width))}%`};
  background: ${({ $color }) => $color};
  border-radius: 999px;
`;

function colorForName(name: string, index: number): string {
  const value = name.toLowerCase();
  if (value.includes('female') || value === 'f') {
    return '#f68a00';
  }
  if (value.includes('male') || value === 'm') {
    return '#1174de';
  }
  return PALETTE[index % PALETTE.length];
}

function buildGradient(data: Array<{ value: number; color: string }>): string {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0 || data.length === 0) {
    return `conic-gradient(${PALETTE[0]} 0deg 360deg)`;
  }

  let current = 0;
  const stops: string[] = [];

  data.forEach((item, index) => {
    const angle =
      index === data.length - 1 ? 360 : current + (item.value / total) * 360;
    stops.push(`${item.color} ${current}deg ${angle}deg`);
    current = angle;
  });

  return `conic-gradient(${stops.join(', ')})`;
}

export default function DoughnutChart({
  data,
  title,
  width,
  height,
}: DoughnutChartProps) {
  const designWidth = 300;
  const designHeight = 380;
  const scale = Math.min(width / designWidth, height / designHeight, 1);

  const normalized = (data || []).map(
    (item: DoughnutChartDataItem, index: number) => ({
      name: item.name || '',
      value: Number(item.value) || 0,
      color: colorForName(item.name || '', index),
    }),
  );

  const total = normalized.reduce((sum, item) => sum + item.value, 0);

  const displayData = normalized.map(item => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <Container style={{ width, height }}>
      <CanvasViewport
        $width={designWidth}
        $height={designHeight}
        style={{ width: designWidth * scale, height: designHeight * scale }}
      >
        <ScaledCanvas $scale={scale}>
          <Header>
            <Title>{title || 'Priority Patient Groups'}</Title>
          </Header>

          <Body>
            <DonutWrap>
              <Donut $gradient={buildGradient(displayData)} />
              <CenterText>
                <CenterLabel>Total</CenterLabel>
                <CenterValue>{total.toLocaleString()}</CenterValue>
              </CenterText>
            </DonutWrap>

            <Legend>
              {displayData.map(item => (
                <LegendItem key={`${item.name}-${item.value}`}>
                  <Dot $color={item.color} />
                  <LegendText>
                    <LegendName>{item.name}</LegendName>
                    <ProgressTrack>
                      <ProgressFill $width={item.percent} $color={item.color} />
                    </ProgressTrack>
                  </LegendText>
                </LegendItem>
              ))}
            </Legend>
          </Body>
        </ScaledCanvas>
      </CanvasViewport>
    </Container>
  );
}
