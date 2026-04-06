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
import { User, Users } from 'lucide-react';
import { styled } from '@superset-ui/core';
import { PieChartTransformedProps } from './types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.gridUnit * 3}px;
  background: hsl(var(--background));
  border-radius: ${({ theme }) => theme.gridUnit * 2.5}px;
  border: 1px solid hsl(var(--border-border));
`;

const PieTemplate = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TotalCounter = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
`;

const TotalLabel = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: hsl(var(--text-muted-foreground));
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.gridUnit / 2}px;
`;

const TotalValue = styled.div`
  font-size: 42px;
  line-height: 1;
  font-weight: 800;
  color: hsl(var(--text-card-foreground));
`;

const PieChartWrap = styled.div`
  height: 190px;
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
`;

const DetailCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.gridUnit * 2}px;
`;

const DetailCard = styled.div`
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  border: 1px solid hsl(var(--border-border));
  background: hsl(var(--secondary) / 0.28);
  padding: ${({ theme }) => theme.gridUnit * 1.5}px
    ${({ theme }) => theme.gridUnit * 2}px;
`;

const DetailTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit}px;
`;

const IconBox = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border-border));
  color: ${({ $color }) => $color};
`;

const CardLabel = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: hsl(var(--text-muted-foreground));
  font-weight: 700;
`;

const CardValue = styled.div`
  font-size: 30px;
  line-height: 1;
  font-weight: 800;
  color: hsl(var(--text-card-foreground));
  margin-top: ${({ theme }) => theme.gridUnit * 0.5}px;
`;

const CardPercentage = styled.div`
  font-size: 16px;
  line-height: 1.1;
  color: hsl(var(--text-muted-foreground));
  font-weight: 600;
  margin-top: ${({ theme }) => theme.gridUnit * 0.4}px;
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit}px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
`;

const PieLegendRow = styled.div`
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) minmax(96px, auto);
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit}px;
  padding: ${({ theme }) => theme.gridUnit * 0.7}px
    ${({ theme }) => theme.gridUnit * 1.2}px;
  border-radius: ${({ theme }) => theme.gridUnit * 1.5}px;
  background: hsl(var(--secondary) / 0.22);
`;

const PieLegendLabel = styled.span`
  font-size: 13px;
  color: hsl(var(--text-card-foreground));
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PieLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.gridUnit * 0.3}px;
`;

const PieLegendValue = styled.span`
  font-size: 13px;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
  color: hsl(var(--text-muted-foreground));
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

const PieLegendPercent = styled.span`
  font-size: 12px;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
  color: hsl(var(--text-muted-foreground));
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  opacity: 0.9;
`;

const DonutTemplate = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 220px) minmax(170px, 260px);
  gap: ${({ theme }) => theme.gridUnit * 3}px;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const DonutChartWrap = styled.div`
  height: 220px;
`;

const DonutLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit * 1.8}px;
  width: 100%;
  max-width: 260px;
  min-width: 0;
`;

const DonutLegendRow = styled.div`
  display: grid;
  grid-template-columns: 12px minmax(72px, 1fr) minmax(86px, auto);
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit * 1.2}px;
  min-width: 0;
  padding: ${({ theme }) => theme.gridUnit * 0.8}px
    ${({ theme }) => theme.gridUnit * 1.2}px;
  border-radius: ${({ theme }) => theme.gridUnit * 1.5}px;
  background: hsl(var(--secondary) / 0.24);
`;

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const DonutLegendLabel = styled.span`
  font-size: 15px;
  color: hsl(var(--text-card-foreground));
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DonutLegendValue = styled.span`
  font-size: 14px;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
  color: hsl(var(--text-muted-foreground));
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

const DonutLegendPercent = styled.span`
  font-size: 12px;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
  color: hsl(var(--text-muted-foreground));
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  opacity: 0.9;
`;

const DonutLegendValueStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.gridUnit * 0.3}px;
`;

const CenterLabel = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: hsl(var(--text-muted-foreground));
  font-weight: 700;
`;

const CenterValue = styled.div`
  font-size: 52px;
  line-height: 1;
  font-weight: 800;
  color: hsl(var(--text-card-foreground));
`;

const CHART_COLORS = [
  '#ff7a00',
  '#2d2de0',
  '#13c6b3',
  '#6f0fd2',
  '#1abd78',
  '#2f5fd0',
  '#f7b500',
  '#ee4d5a',
];

const ICONS = [User, Users];

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
                  index: number,
                ) => {
                  const IconComponent = ICONS[index % ICONS.length];
                  return (
                    <DetailCard key={item.name}>
                      <DetailTop>
                        <IconBox $color={item.color}>
                          <IconComponent
                            style={{
                              width: 12,
                              height: 12,
                            }}
                          />
                        </IconBox>
                        <CardLabel>{item.name}</CardLabel>
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
                  <PieLegendRow key={`pie-legend-${item.name}`}>
                    <Dot $color={item.color} />
                    <PieLegendLabel>{item.name}</PieLegendLabel>
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
                  x="30%"
                  y="36%"
                  width="40%"
                  height="30%"
                  style={{ pointerEvents: 'none' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
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
                <DonutLegendRow key={`legend-${item.name}`}>
                  <Dot $color={item.color} />
                  <DonutLegendLabel>{item.name}</DonutLegendLabel>
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
