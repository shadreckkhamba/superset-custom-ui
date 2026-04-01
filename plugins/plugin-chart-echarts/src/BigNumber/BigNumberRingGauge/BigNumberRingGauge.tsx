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
import Echart from '../../components/Echart';
import { Refs } from '../../types';
import { BigNumberRingGaugeProps } from './types';

const RING_SIZE = 136;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    165deg,
    ${({ theme }) => theme.colors.grayscale.light5} 0%,
    ${({ theme }) => theme.colors.grayscale.light4} 100%
  );
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.gridUnit * 4.5}px;
  overflow: hidden;
  box-sizing: border-box;
`;

const CanvasViewport = styled.div<{ $width: number; $height: number }>`
  width: ${({ $width }) => `${$width}px`};
  height: ${({ $height }) => `${$height}px`};
  overflow: hidden;
  position: relative;
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
  overflow: hidden;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.gridUnit * 3}px;
  padding: ${({ theme }) =>
    `${theme.gridUnit * 2.75}px ${theme.gridUnit * 2.75}px ${theme.gridUnit * 2.5}px`};
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const RingWrap = styled.div`
  width: ${RING_SIZE}px;
  height: ${RING_SIZE}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto;
`;

const RingChart = styled.div`
  width: ${RING_SIZE}px;
  height: ${RING_SIZE}px;
`;

const Center = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.gridUnit * 0.5}px;
`;

const RefreshIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const MainValue = styled.div`
  font-size: 72px;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  letter-spacing: -0.02em;
`;

const FooterCard = styled.div`
  width: 88%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) =>
    `${theme.gridUnit * 1.5}px ${theme.gridUnit * 0.75}px`};
  margin: 0 auto;
  min-height: 0;
  overflow: hidden;
`;

const FooterLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.base};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const FooterValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xxl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary.base};
`;

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function BigNumberRingGauge({
  bigNumber,
  headerFormatter,
  subtitle,
  percentage,
  width,
  height,
}: BigNumberRingGaugeProps) {
  const refs: Refs = {};
  const designWidth = 300;
  const designHeight = 380;
  const scale = Math.min(width / designWidth, height / designHeight, 1);
  const numericValue = toNumber(bigNumber);
  const progress =
    percentage !== undefined && percentage !== null
      ? Math.max(0, Math.min(100, percentage))
      : numericValue > 100
        ? 100
        : Math.max(0, numericValue);

  const footerLabel = (subtitle || 'Refund Rate').toUpperCase();
  const footerValue = `${progress.toFixed(1)}%`;
  const ringOptions: EChartsCoreOption = {
    animation: true,
    tooltip: { show: false },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['80%', '94%'],
        center: ['50%', '50%'],
        startAngle: 90,
        clockwise: true,
        avoidLabelOverlap: true,
        silent: true,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: progress,
            itemStyle: { color: 'var(--ant-text-color)', borderRadius: 99 },
          },
          {
            value: Math.max(0, 100 - progress),
            itemStyle: {
              color: 'var(--ant-border-color-split)',
              borderRadius: 99,
            },
          },
        ],
      },
    ],
  };

  return (
    <Container style={{ width, height }}>
      <CanvasViewport
        $width={designWidth}
        $height={designHeight}
        style={{ width: designWidth * scale, height: designHeight * scale }}
      >
        <ScaledCanvas $scale={scale}>
          <Content>
            <RingWrap>
              <RingChart>
                <Echart
                  refs={refs}
                  width={RING_SIZE}
                  height={RING_SIZE}
                  echartOptions={ringOptions}
                />
              </RingChart>

              <Center>
                <RefreshIcon aria-hidden="true">↻</RefreshIcon>
                <MainValue>{headerFormatter(numericValue)}</MainValue>
              </Center>
            </RingWrap>

            <FooterCard>
              <FooterLabel>{footerLabel}</FooterLabel>
              <FooterValue>{footerValue}</FooterValue>
            </FooterCard>
          </Content>
        </ScaledCanvas>
      </CanvasViewport>
    </Container>
  );
}
