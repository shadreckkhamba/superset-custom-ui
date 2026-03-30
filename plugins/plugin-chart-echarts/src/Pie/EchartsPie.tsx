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
import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';
import { styled } from '@superset-ui/core';
import { PieChartTransformedProps } from './types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  background: hsl(var(--bg-card));
  border-radius: ${({ theme }) => theme.gridUnit * 3}px;
  border: 1px solid hsl(var(--border-border));
  box-shadow: 0 1px 3px 0 hsl(var(--border-border) / 0.1);
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.gridUnit * 4}px;
  padding-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  border-bottom: 1px solid hsl(var(--border-border));
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: hsl(var(--text-card-foreground));
  line-height: 1.4;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.gridUnit * 4}px;
`;

const TotalCounter = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
`;

const TotalLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--text-muted-foreground));
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.gridUnit / 2}px;
`;

const TotalValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xxl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: hsl(var(--text-card-foreground));
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const DetailCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.gridUnit * 3}px;
`;

const DetailCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit * 2}px;
  padding: ${({ theme }) => theme.gridUnit * 2}px;
  background: hsl(var(--accent) / 0.4);
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  border: 1px solid hsl(var(--border-border));
`;

const IconBox = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}15`};
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--text-muted-foreground));
  font-weight: 600;
`;

const CardValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.l}px;
  font-weight: bold;
  color: hsl(var(--text-card-foreground));
`;

const CardPercentage = styled.span`
  font-size: 10px;
  color: hsl(var(--text-muted-foreground));
  font-weight: 600;
`;

const CHART_COLORS = [
  'hsl(28 85% 55%)', // Female - orange
  'hsl(210 80% 52%)', // Male - blue
];

const ICON_COLORS = [
  'hsl(28 85% 55%)', // Female - orange
  'hsl(210 80% 52%)', // Male - blue
];

const ICONS = [User, Users]; // User for Female, Users for Male

export default function EchartsPie(props: PieChartTransformedProps) {
  const { height, width, echartOptions } = props;
  
  // Extract data from echartOptions
  const series = echartOptions?.series?.[0];
  const data = series?.data || [];
  const title = echartOptions?.title?.text || 'Distribution';
  
  const total = data.reduce(
    (sum: number, item: { value: number }) => sum + (item.value || 0),
    0,
  );

  const chartData = data.map((item: { name: string; value: number }, index: number) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
  }));

  return (
    <Container style={{ width, height }}>
      <Header>
        <Title>{title}</Title>
      </Header>

      <Content>
        {/* Total Counter */}
        <TotalCounter>
          <TotalLabel>Total</TotalLabel>
          <TotalValue>{total.toLocaleString()}</TotalValue>
        </TotalCounter>

        {/* Pie Chart */}
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                strokeWidth={0}
                dataKey="value"
                animationBegin={300}
                animationDuration={800}
              >
                {chartData.map(
                  (entry: { name: string; value: number; color: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ),
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Detail Cards */}
        <DetailCardsGrid>
          {chartData.map(
            (
              item: { name: string; value: number; color: string; percentage: string },
              index: number,
            ) => {
              const IconComponent = ICONS[index % ICONS.length];
              return (
                <DetailCard
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.12, duration: 0.4, ease: 'easeOut' }}
                >
                  {/* Icon Box */}
                  <IconBox $color={ICON_COLORS[index % ICON_COLORS.length]}>
                    <IconComponent
                      style={{ width: 16, height: 16, color: ICON_COLORS[index % ICON_COLORS.length] }}
                    />
                  </IconBox>

                  {/* Text Stack */}
                  <CardContent>
                    <CardLabel>{item.name}</CardLabel>
                    <CardValue>{item.value.toLocaleString()}</CardValue>
                    <CardPercentage>{item.percentage}%</CardPercentage>
                  </CardContent>
                </DetailCard>
              );
            },
          )}
        </DetailCardsGrid>
      </Content>
    </Container>
  );
}
