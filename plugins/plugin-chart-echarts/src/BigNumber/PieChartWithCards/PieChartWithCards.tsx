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
import { PieChartDataItem, PieChartWithCardsProps } from './types';

const FEMALE_COLOR = '#f68a00';
const MALE_COLOR = '#1174de';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.grayscale.light4};
`;

const Header = styled.div`
  padding: ${({ theme }) => `${theme.gridUnit * 2}px ${theme.gridUnit * 2}px`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.primary.dark1};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit * 2}px;
  padding: ${({ theme }) => `${theme.gridUnit * 2}px ${theme.gridUnit * 2}px`};
  flex: 1;
`;

const TotalWrap = styled.div`
  text-align: center;
`;

const TotalLabel = styled.div`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.typography.sizes.xs}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const TotalValue = styled.div`
  font-size: 52px;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const ChartWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 170px;
`;

const Pie = styled.div<{ $gradient: string }>`
  width: 148px;
  height: 148px;
  border-radius: 50%;
  background: ${({ $gradient }) => $gradient};
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: ${({ theme }) => theme.gridUnit * 1.5}px;
  margin-top: auto;
`;

const Card = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.gridUnit * 1.5}px;
  align-items: center;
  padding: ${({ theme }) =>
    `${theme.gridUnit * 1.5}px ${theme.gridUnit * 2}px`};
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  background: ${({ theme }) => theme.colors.grayscale.light5};
`;

const Dot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const CardText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;
`;

const CardLabel = styled.span`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.typography.sizes.xs}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.base};
  letter-spacing: 0.04em;
`;

const CardValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const CardPercent = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

function classifyGender(name: string): 'female' | 'male' | 'unknown' {
  const value = name.trim().toLowerCase();

  if (
    value === 'female' ||
    value === 'f' ||
    value.includes('female') ||
    value.includes('woman') ||
    value.includes('girl')
  ) {
    return 'female';
  }

  if (
    value === 'male' ||
    value === 'm' ||
    value.includes('male') ||
    value.includes('man') ||
    value.includes('boy')
  ) {
    return 'male';
  }

  return 'unknown';
}

function colorForName(name: string, index: number): string {
  const category = classifyGender(name);
  if (category === 'female') {
    return FEMALE_COLOR;
  }
  if (category === 'male') {
    return MALE_COLOR;
  }
  return index % 2 === 0 ? FEMALE_COLOR : MALE_COLOR;
}

function buildPieGradient(
  data: Array<{ value: number; color: string }>,
): string {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0 || data.length === 0) {
    return `conic-gradient(${FEMALE_COLOR} 0deg 360deg)`;
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

export default function PieChartWithCards({
  data = [],
  title,
  width,
  height,
}: PieChartWithCardsProps) {
  const chartData = (data || []).map(
    (item: PieChartDataItem, index: number) => ({
      name: item.name || '',
      value: Number(item.value) || 0,
      color: colorForName(item.name || '', index),
    }),
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const displayData = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
  }));

  return (
    <Container style={{ width, height }}>
      <Header>
        <Title>{title || 'Distribution'}</Title>
      </Header>

      <Body>
        <TotalWrap>
          <TotalLabel>Total</TotalLabel>
          <TotalValue>{total.toLocaleString()}</TotalValue>
        </TotalWrap>

        <ChartWrap>
          <Pie $gradient={buildPieGradient(displayData)} />
        </ChartWrap>

        <CardsGrid>
          {displayData.map(item => (
            <Card key={`${item.name}-${item.value}`}>
              <Dot $color={item.color} />
              <CardText>
                <CardLabel>{item.name}</CardLabel>
                <CardValue>{item.value.toLocaleString()}</CardValue>
                <CardPercent>{item.percentage}%</CardPercent>
              </CardText>
            </Card>
          ))}
        </CardsGrid>
      </Body>
    </Container>
  );
}
