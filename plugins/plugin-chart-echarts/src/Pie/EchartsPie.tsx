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
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Baby, ShieldPlus, User, UserCheck, Users, Venus } from 'lucide-react';
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
  padding: ${({ theme }) => theme.gridUnit * 3}px;
  background: var(--pie-bg);
  border-radius: ${({ theme }) => theme.gridUnit * 2.5}px;
  border: 1px solid var(--pie-border);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);

  body.dark-theme &,
  [data-theme='dark'] & {
    --pie-bg: radial-gradient(
        130% 120% at 0% 0%,
        rgba(0, 195, 255, 0.09) 0%,
        rgba(0, 195, 255, 0) 45%
      ),
      linear-gradient(180deg, #0b1820 0%, #0a141b 100%);
    --pie-border: #1f3744;
    --pie-muted: #bfd0d6;
    --pie-foreground: #ecf6f8;
    --pie-row-bg: linear-gradient(180deg, #17323d 0%, #112730 100%);
    --pie-row-bg-strong: linear-gradient(180deg, #1a3743 0%, #142c35 100%);
    --pie-donut-row-bg: linear-gradient(180deg, #193540 0%, #132a33 100%);
    --pie-row-border: #2f5667;
    --pie-row-shadow: 0 8px 18px rgba(0, 0, 0, 0.38);
    --pie-icon-bg: rgba(17, 39, 48, 0.95);
    --pie-icon-border: rgba(109, 189, 216, 0.45);
    --pie-swatch-ring: #dff8ff;
    --pie-swatch-outer-ring: rgba(190, 235, 248, 0.7);
    --pie-swatch-glow-multiplier: aa;
    box-shadow: inset 0 0 0 1px rgba(80, 140, 165, 0.22),
      0 10px 24px rgba(0, 0, 0, 0.32);
  }

  body.theme-transitioning & {
    position: relative;
    overflow: hidden;
  }

  body.theme-transitioning & > * {
    opacity: 0 !important;
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
    animation: pieThemeSkeletonShimmer 1.1s linear infinite;
    z-index: 2;
  }

  @keyframes pieThemeSkeletonShimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const PieTemplate = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const TotalCounter = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
  position: relative;
  z-index: 2;
  min-height: 78px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TotalLabel = styled.div`
  font-size: 25px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--pie-muted) !important;
  font-weight: 950;
  margin-bottom: ${({ theme }) => theme.gridUnit / 2}px;
  body.dark-theme &,
  [data-theme='dark'] & {
    color: #8fd8f2;
  }
`;

const TotalValue = styled.div`
  font-size: 64px;
  line-height: 1;
  font-weight: 900;
  color: var(--pie-foreground) !important;
`;

const PieChartWrap = styled.div`
  height: clamp(140px, 40%, 190px);
  min-height: 130px;
  flex-shrink: 0;
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
`;

const DetailCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.gridUnit * 2}px;
  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
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

const DetailTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.gridUnit}px;
`;

const CardLabel = styled.span`
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--pie-muted);
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  word-break: normal;
  text-align: center;
`;

const CardValue = styled.div`
  font-size: 56px;
  line-height: 1.05;
  font-weight: 900;
  color: var(--pie-foreground);
  margin-top: ${({ theme }) => theme.gridUnit * 0.5}px;
  text-align: center;
`;

const CardPercentage = styled.div`
  font-size: 30px;
  line-height: 1.2;
  color: var(--pie-muted);
  font-weight: 700;
  margin-top: ${({ theme }) => theme.gridUnit * 0.4}px;
  text-align: center;
`;

const PieLegend = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: ${({ theme }) => theme.gridUnit * 1.4}px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto
    ${({ theme }) => theme.gridUnit}px auto;
  align-items: stretch;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
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

const PieLegendValue = styled.span`
  font-size: 30px;
  line-height: 1.2;
  text-align: right;
  white-space: nowrap;
  color: var(--pie-muted);
  font-variant-numeric: tabular-nums;
  font-weight: 800;
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
`;

const DonutTemplate = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  gap: ${({ theme }) => theme.gridUnit * 3}px;
  align-items: center;
  justify-content: stretch;
  height: 100%;
  min-height: 0;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    justify-items: center;
    align-content: start;
    gap: ${({ theme }) => theme.gridUnit * 2}px;
  }
`;

const DonutChartWrap = styled.div`
  height: 220px;
`;

const DonutLegend = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.gridUnit * 1.4}px;
  width: 100%;
  max-width: 920px;
  min-width: 0;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;

const DonutLegendRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(172px, auto);
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit * 1.2}px;
  min-width: 0;
  padding: ${({ theme }) => theme.gridUnit * 0.8}px
    ${({ theme }) => theme.gridUnit * 1.6}px;
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

const DonutLegendLabelWrap = styled.div`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit * 0.8}px;
  min-width: 0;
  justify-items: start;
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
  body.dark-theme &,
  [data-theme='dark'] & {
    border-color: rgba(232, 248, 252, 0.95) !important;
    box-shadow: 0 0 0 1px rgba(23, 44, 54, 0.9) !important;
    filter: none !important;
  }
`;

const TinyIcon = styled.div<{ $color: string }>`
  width: 46px !important;
  height: 46px !important;
  min-width: 46px !important;
  min-height: 46px !important;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: ${({ $color }) => `${$color}1f`} !important;
  border: 1px solid ${({ $color }) => `${$color}66`} !important;
  color: ${({ $color }) => $color} !important;
  flex-shrink: 0 !important;
  svg {
    color: inherit !important;
    stroke: currentColor !important;
  }
  body.dark-theme &,
  [data-theme='dark'] & {
    background: ${({ $color }) => $color} !important;
    border: 1px solid rgba(235, 251, 255, 0.95) !important;
    color: #08202a !important;
    box-shadow: 0 0 0 1px rgba(22, 43, 52, 0.9) !important;
  }
`;

const DonutLegendLabel = styled.span`
  font-size: 26px;
  color: var(--pie-foreground);
  font-weight: 700;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.25;
  word-break: normal;
  text-align: left;
`;

const DonutLegendValue = styled.span`
  font-size: 26px;
  line-height: 1.2;
  text-align: right;
  white-space: nowrap;
  color: var(--pie-muted);
  font-variant-numeric: tabular-nums;
  font-weight: 800;
`;

const DonutLegendPercent = styled.span`
  font-size: 24px;
  line-height: 1.2;
  text-align: right;
  white-space: nowrap;
  color: var(--pie-muted);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  opacity: 0.9;
`;

const DonutLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.gridUnit * 0.3}px;
  justify-self: end;
  min-width: 0;
  width: 172px;
  margin-left: auto;
  padding-right: 0;
  transform: translateX(-14px);
`;

const CenterLabel = styled.div`
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--pie-muted);
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 2px;
`;

const CenterValue = styled.div`
  font-size: 68px;
  line-height: 1.05;
  font-weight: 900;
  color: var(--pie-foreground);
`;

const CHART_COLORS = [
  '#00E5FF',
  '#FF8A00',
  '#7C4DFF',
  '#00C853',
  '#FF1744',
  '#FFD600',
  '#2979FF',
  '#FF4081',
];

function getIconForCategory(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('male')) return User;
  if (normalized.includes('female')) return Venus;
  if (normalized.includes('adolescent')) return UserCheck;
  if (normalized.includes('under')) return Baby;
  if (normalized.includes('pregnant')) return ShieldPlus;
  return Users;
}

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

  const chartData = data.map(
    (item: { name: string; value: number }, index: number) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
    }),
  );

  const shouldShowCards = chartData.length > 0 && chartData.length <= 2;

  return (
    <Container style={{ width, height }}>
      {!isDonut ? (
        <PieTemplate>
          <TotalCounter>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>{total.toLocaleString()}</TotalValue>
          </TotalCounter>

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

          {shouldShowCards && (
            <DetailCardsGrid>
              {chartData.map(
                (
                  item: {
                    name: string;
                    value: number;
                    color: string;
                    percentage: string;
                  },
                ) => {
                  return (
                    <DetailCard
                      key={item.name}
                      className={`pie-mini-row ${
                        isPriorityGroupName(item.name) ? 'priority-mini-row' : ''
                      }`}
                    >
                      <DetailTop>
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
                          <TinyIcon
                            $color={item.color}
                            className="pie-color-iconchip"
                            style={
                              {
                                ['--dot-color' as string]: item.color,
                              } as CSSProperties
                            }
                          >
                            {(() => {
                              const IconComponent = getIconForCategory(
                                item.name,
                              );
                              return (
                                <IconComponent size={32} strokeWidth={2.6} />
                              );
                            })()}
                          </TinyIcon>
                          <CardLabel>{item.name}</CardLabel>
                        </LegendLabelWrap>
                      </DetailTop>
                      <CardValue>{item.value.toLocaleString()}</CardValue>
                      <CardPercentage>{item.percentage}%</CardPercentage>
                    </DetailCard>
                  );
                },
              )}
            </DetailCardsGrid>
          )}

          {!shouldShowCards && chartData.length > 0 && (
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
                      <TinyIcon
                        $color={item.color}
                        className="pie-color-iconchip"
                        style={
                          {
                            ['--dot-color' as string]: item.color,
                          } as CSSProperties
                        }
                      >
                        {(() => {
                          const IconComponent = getIconForCategory(item.name);
                          return <IconComponent size={32} strokeWidth={2.6} />;
                        })()}
                      </TinyIcon>
                      <PieLegendLabel>{item.name}</PieLegendLabel>
                    </LegendLabelWrap>
                    <PieLegendValueStack>
                      <PieLegendValue>
                        {item.value.toLocaleString()}
                      </PieLegendValue>
                      <PieLegendPercent>{item.percentage}%</PieLegendPercent>
                    </PieLegendValueStack>
                  </PieLegendRow>
                ),
              )}
            </PieLegend>
          )}
        </PieTemplate>
      ) : (
        <DonutTemplate>
          <div>
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
          </div>

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
                    <TinyIcon
                      $color={item.color}
                      className="pie-color-iconchip"
                      style={
                        {
                          ['--dot-color' as string]: item.color,
                        } as CSSProperties
                      }
                    >
                      {(() => {
                        const IconComponent = getIconForCategory(item.name);
                        return <IconComponent size={32} strokeWidth={2.6} />;
                      })()}
                    </TinyIcon>
                    <DonutLegendLabel>{item.name}</DonutLegendLabel>
                  </DonutLegendLabelWrap>
                  <DonutLegendValueStack>
                    <DonutLegendValue>
                      {item.value.toLocaleString()}
                    </DonutLegendValue>
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
