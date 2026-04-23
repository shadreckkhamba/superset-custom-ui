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
import React, { useMemo, useState, useEffect, SVGProps } from 'react';
import { styled, css } from '@superset-ui/core';
import { DataRecord } from '@superset-ui/core';
import {
  Hash,
  MapPin,
  Database,
  TrendingUp,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

function FluentPeopleCommunity20Filled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" {...props}>
      <path fill="currentColor" d="M10 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6M5.053 9.996q-.051.244-.051.504V14a4.99 4.99 0 0 0 1.767 3.814l-.171.05a4 4 0 0 1-4.9-2.828l-.647-2.415a1.5 1.5 0 0 1 1.061-1.837zm8.182 7.818A4.99 4.99 0 0 0 15.002 14v-3.5q-.001-.26-.05-.504l2.94.788a1.5 1.5 0 0 1 1.06 1.837l-.647 2.415a4 4 0 0 1-5.07 2.778M16.5 4a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m-13 0a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m4 5A1.5 1.5 0 0 0 6 10.5V14a4 4 0 0 0 8 0v-3.5A1.5 1.5 0 0 0 12.5 9z" />
    </svg>
  );
}

function MaterialSymbolsPinDropRounded(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M11.4 18.425q-.3-.1-.55-.3q-2.95-2.35-4.4-4.587T5 9.15q0-3.125 1.95-5.137T12 2t5.05 2.013T19 9.15q0 2.15-1.45 4.388t-4.4 4.587q-.25.2-.55.3t-.6.1t-.6-.1M12 11q.825 0 1.413-.587T14 9t-.587-1.412T12 7t-1.412.588T10 9t.588 1.413T12 11M6 22q-.425 0-.712-.288T5 21t.288-.712T6 20h12q.425 0 .713.288T19 21t-.288.713T18 22z" />
    </svg>
  );
}

// CSS Variables for teal medical/clinical palette
const themeVars = css`
  --color-primary: #0d9488;
  --color-primary-light: #14b8a6;
  --color-primary-dark: #0f766e;
  --color-secondary: #06b6d4;
  --color-accent: #0891b2;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  --color-bg-card: #ffffff;
  --color-bg-muted: #f8fafc;
  --color-bg-hover: #f1f5f9;
  
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #8796aa;
  
  --color-border: #e2e8f0;s
  --color-border-light: #f1f5f9;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
`;

// Styled components
const Container = styled.div<{ $dynamicHeight?: number }>`
  ${themeVars}
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  height: ${props => props.$dynamicHeight ? `${props.$dynamicHeight}px` : 'auto'};
  min-height: 300px;
  max-height: 80vh;
  transition: height 0.3s ease-in-out;

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
    animation: tableThemeSkeletonShimmer 1.1s linear infinite;
    z-index: 2;
  }

  body.dark-theme &,
  [data-theme='dark'] & {
    --color-primary: #0d9488;
    --color-primary-light: #14b8a6;
    --color-primary-dark: #0f766e;
    --color-secondary: #06b6d4;
    --color-accent: #0891b2;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;
    
    --color-bg-card: #0a0a0a;
    --color-bg-muted: #111111;
    --color-bg-hover: #1a1a1a;
    
    --color-text-primary: #eef8fa;
    --color-text-secondary: #94a3b8;
    --color-text-muted: #64748b;
    
    --color-border: #1f3744;
    --color-border-light: #1a1a1a;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.35);
    
    background: #0a0a0a;
    box-shadow: var(--shadow-lg), inset 0 0 0 1px rgba(80, 140, 165, 0.15);
    border: 1px solid #1f3744;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes tableThemeSkeletonShimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const KPIBanner = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 0.82fr) minmax(0, 1.36fr);
  gap: 16px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, var(--color-bg-muted) 0%, var(--color-bg-card) 100%);
  height: auto;
  width: 100%;
  box-sizing: border-box;

  body.dark-theme &,
  [data-theme='dark'] & {
    background: linear-gradient(135deg, #111111 0%, #0a0a0a 100%);
    border-bottom-color: #1f3744;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const KPITile = styled.div<{ bgColor?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-right: none;
  background: ${props => props.bgColor || 'transparent'};
  transition: all var(--transition-normal);
  animation: slideIn 0.4s ease-out backwards;
  min-height: 88px;
  height: auto;
  box-sizing: border-box;
  overflow: visible;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  
  &:hover {
    background: var(--color-bg-hover);
    transform: translateY(-2px);
  }

  body.dark-theme &,
  [data-theme='dark'] & {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const CompactKPITile = styled(KPITile)`
  padding: 12px 14px;
  min-height: 72px;
`;

const TopLocationTile = styled(KPITile)`
  padding: 10px 16px;
  min-height: 72px;

  @media (max-width: 1024px) {
    grid-column: 1 / -1;
  }
`;

const KPIIcon = styled.div<{ color?: string; $size?: number; $iconSize?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => `${props.$size ?? 60}px`};
  height: ${props => `${props.$size ?? 60}px`};
  border-radius: var(--radius-md);
  background: #e3e8f0;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
  color: #111827;
  font-size: 30px;
  flex-shrink: 0;
  min-width: ${props => `${props.$size ?? 60}px`};
  min-height: ${props => `${props.$size ?? 60}px`};
  
  & > svg {
    width: ${props => `${props.$iconSize ?? 26}px`};
    height: ${props => `${props.$iconSize ?? 26}px`};
    font-size: ${props => `${props.$iconSize ?? 26}px`};
    flex-shrink: 0;
  }

  body.dark-theme &,
  [data-theme='dark'] & {light version of this;#d9e1eb
    background: ${props => props.color || 'var(--color-primary)'};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    color: #ffffff;
  }

  @media (max-width: 768px) {
    width: ${props => `${props.$size ? Math.max(40, Math.round(props.$size * 0.67)) : 40}px`};
    height: ${props => `${props.$size ? Math.max(40, Math.round(props.$size * 0.67)) : 40}px`};
    min-width: ${props => `${props.$size ? Math.max(40, Math.round(props.$size * 0.67)) : 40}px`};
    min-height: ${props => `${props.$size ? Math.max(40, Math.round(props.$size * 0.67)) : 40}px`};
    font-size: 20px;

    & > svg {
      width: ${props =>
        `${props.$iconSize ? Math.max(18, Math.round(props.$iconSize * 0.8)) : 20}px`};
      height: ${props =>
        `${props.$iconSize ? Math.max(18, Math.round(props.$iconSize * 0.8)) : 20}px`};
      font-size: ${props =>
        `${props.$iconSize ? Math.max(18, Math.round(props.$iconSize * 0.8)) : 20}px`};
    }
  }
`;

const KPIContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: auto;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const KPIContentLeft = styled(KPIContent)`
  justify-content: flex-start;
`;

const KPIValue = styled.div`
  font-size: 42px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
  height: auto;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  max-width: 100%;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
    white-space: normal;
    word-break: break-word;
  }
`;

const KPIValueLeft = styled(KPIValue)`
  text-align: left;
`;

const TopLocationsValue = styled(KPIValue)`
  font-size: 25px;
  text-align: left;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.25;
  max-width: 100%;
  flex: 1 1 100%;
  flex-shrink: 1;
`;

const KPILabel = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.3px;
  height: auto;
  text-align: left;
  text-transform: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;

  body.dark-theme &,
[data-theme='dark'] & {
    color: #ffffff;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    white-space: normal;
    word-break: break-word;
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const TableSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-card);
  min-height: 44px;

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #0a0a0a;
    border-bottom-color: #1f3744;
  }
`;


const HeaderControls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`;

const PageMeta = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

const NavButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--color-bg-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const DataTable = styled.div`
  flex: 1;
  overflow: hidden;
  max-height: 100%;
  transition: max-height 0.3s ease-in-out;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 21px;
  height: 100%;
  table-layout: fixed;
`;

const TableHead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg-card);
  height: auto;

  & th {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #0a0a0a;
  }
`;

const TableHeader = styled.th<{ colIndex?: number }>`
  padding: 8px 12px;
  text-align: ${props => props.colIndex === 2 ? 'center' : 'left'};
  font-weight: 900;
  font-size: 27px;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  border-bottom: 2px solid var(--color-border);
  background: var(--color-bg-card);
  min-height: 40px;
  width: ${props => props.colIndex === 0 ? '25%' : props.colIndex === 1 ? '50%' : '25%'};
  box-sizing: border-box;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
    border-bottom-color: #1f3744;
    background: #0a0a0a;
  }
`;

const TableBody = styled.tbody`
  height: 100%;
`;

const TableRow = styled.tr`
  transition: all var(--transition-fast);
  animation: fadeInRow 0.3s ease-out backwards;
  min-height: 36px;

  & > td {
    padding-top: 4px;
    padding-bottom: 4px;
  }
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.15s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.25s; }
  &:nth-child(5) { animation-delay: 0.3s; }
  
  &:hover {
    background: var(--color-bg-hover);
  }
  
  @keyframes fadeInRow {
    from {
      opacity: 0;
      transform: translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const TableCell = styled.td<{ colIndex?: number }>`
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  vertical-align: middle;
  font-size: 30px;
  min-height: 36px;
  width: ${props => props.colIndex === 0 ? '25%' : props.colIndex === 1 ? '50%' : '25%'};
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: ${props => props.colIndex === 2 ? 'center' : 'left'};
`;

const LocationCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 600;

  body.dark-theme &,
  [data-theme='dark'] & {
    color: #ffffff;
  }
`;

const LocationDot = styled.span<{ color?: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => props.color || 'var(--color-primary)'};
  flex-shrink: 0;
`;

const BarCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 10px;
  background: var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;

  body.dark-theme &,
  [data-theme='dark'] & {
    background: #1f3744;
  }
`;

const BarFill = styled.div<{ width: number; color?: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color || 'var(--color-primary)'};
  border-radius: var(--radius-sm);
  transition: width var(--transition-slow);
  animation: barGrow 0.6s ease-out;
  
  @keyframes barGrow {
    from {
      width: 0;
    }
    to {
      width: ${props => props.width}%;
    }
  }
`;

const TrendCell = styled.div<{ trend: 'up' | 'down' | 'stable' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${props => {
    switch (props.trend) {
      case 'up': return 'var(--color-success)';
      case 'down': return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  }};
`;

const TrendIcon = styled.span`
  font-size: 14px;
`;


// Types
interface TableChartProps {
  data?: DataRecord[];
  height?: number;
  width?: number;
}

// Color palette for locations
const locationColors = [
  '#0d9488', '#06b6d4', '#0891b2', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
];

const ROWS_PER_PAGE = 5;
const AUTO_PAGE_DELAY_MS = 7000;

export default function TableChart({
  data,
  height,
  width = 900,
}: TableChartProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoRotatePaused, setIsAutoRotatePaused] = useState(false);

  const totalPages = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.ceil(data.length / ROWS_PER_PAGE);
  }, [data]);

  useEffect(() => {
    if (totalPages <= 1 || isAutoRotatePaused) return;
    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, AUTO_PAGE_DELAY_MS);
    return () => clearInterval(interval);
  }, [totalPages, isAutoRotatePaused]);

  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const start = currentPage * ROWS_PER_PAGE;
    return data.slice(start, start + ROWS_PER_PAGE);
  }, [data, currentPage]);

  // Calculate dynamic height based on data
  const dynamicHeight = useMemo(() => {
    if (!data || data.length === 0) return 400;
    const baseHeight = 200; // KPI banner + header
    const rowHeight = 60; // Approximate height per row
    const maxRows = 50; // Max rows before scrolling
    const rowCount = Math.min(data.length, maxRows);
    const calculatedHeight = baseHeight + (rowCount * rowHeight);
    // Ensure minimum height and respect max-height
    return Math.max(300, Math.min(calculatedHeight, window.innerHeight * 0.8));
  }, [data]);

  // Use provided height if available, otherwise use dynamic height
  const containerHeight = height || dynamicHeight;
  // Get column names from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Get numeric columns for KPIs
  const numericColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return columns.filter(col => {
      const value = data[0][col];
      return typeof value === 'number' || !isNaN(Number(value));
    });
  }, [data, columns]);

  // Get first string column for labels
  const labelColumn = useMemo(() => {
    if (!data || data.length === 0) return '';
    return columns.find(col => {
      const value = data[0][col];
      return typeof value === 'string';
    }) || columns[0];
  }, [data, columns]);

  // Get first numeric column for values
  const valueColumn = useMemo(() => {
    if (numericColumns.length === 0) return '';
    return numericColumns[0];
  }, [numericColumns]);

  // Get second numeric column for percentages (if exists)
  const percentColumn = useMemo(() => {
    if (numericColumns.length < 2) return '';
    return numericColumns[1];
  }, [numericColumns]);

  // Calculate KPI values
  const kpiValues = useMemo(() => {
    if (!data || data.length === 0) {
      return { total: 0, count: 0, average: 0, topItems: 'N/A' };
    }
    
    const total = data.reduce((sum, row) => {
      const value = Number(row[valueColumn]) || 0;
      return sum + value;
    }, 0);
    
    const count = data.length;
    const average = count > 0 ? Math.round(total / count) : 0;

    const maxValue = data.reduce((max, row) => {
      const currentValue = Number(row[valueColumn]) || 0;
      return Math.max(max, currentValue);
    }, Number.NEGATIVE_INFINITY);

    const tiedTopItems = Array.from(
      new Set(
        data
          .filter(row => (Number(row[valueColumn]) || 0) === maxValue)
          .map(row => String(row[labelColumn] || 'N/A')),
      ),
    );

    const topItems = tiedTopItems.length > 0 ? tiedTopItems.join(', ') : 'N/A';
    
    return { total, count, average, topItems };
  }, [data, valueColumn, labelColumn]);

  // Calculate max value for bar chart
  const maxBarValue = useMemo(() => {
    if (!data || data.length === 0 || !valueColumn) return 0;
    return Math.max(...data.map(row => Number(row[valueColumn]) || 0));
  }, [data, valueColumn]);

  return (
    <Container $dynamicHeight={containerHeight} style={{ width: '100%' }}>
      {/* KPI Banner */}
      <KPIBanner>
        <CompactKPITile bgColor="rgba(13, 148, 136, 0.05)">
          <KPIIcon color="rgba(13, 148, 136, 0.05)" $size={74} $iconSize={34}>
            <FluentPeopleCommunity20Filled />
          </KPIIcon>
          <KPIContent>
            <KPILabel>Total Patients:</KPILabel>
            <KPIValue style={{ marginRight: 12 }}>{kpiValues.total.toLocaleString()}</KPIValue>
          </KPIContent>
        </CompactKPITile>
        
        <CompactKPITile bgColor="rgba(6, 182, 212, 0.05)">
          <KPIIcon color="rgba(6, 182, 212, 0.05)" $size={74} $iconSize={34}>
            <MaterialSymbolsPinDropRounded />
          </KPIIcon>
          <KPIContentLeft>
            <KPILabel>Location(s):</KPILabel>
            <KPIValueLeft>{kpiValues.count}</KPIValueLeft>
          </KPIContentLeft>
        </CompactKPITile>
                
        <TopLocationTile bgColor="rgba(16, 185, 129, 0.05)">
          <KPIIcon color="rgba(16, 185, 129, 0.05)" $size={74} $iconSize={34}>
            <MaterialSymbolsPinDropRounded />
          </KPIIcon>
          <KPIContentLeft>
            <KPILabel>Top Location(s):</KPILabel>
            <TopLocationsValue>{kpiValues.topItems}</TopLocationsValue>
          </KPIContentLeft>
        </TopLocationTile>
      </KPIBanner>

      {/* Content Area */}
      <ContentArea>
        {/* Table Section */}
        <TableSection>
          <SectionHeader>
            {totalPages > 1 && (
              <HeaderControls>
                <PageMeta>
                  Page {currentPage + 1} / {totalPages}
                </PageMeta>
                <NavButton
                  type="button"
                  aria-label="Previous page"
                  onClick={() =>
                    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages)
                  }
                >
                  <ChevronLeft size={18} />
                </NavButton>
                <NavButton
                  type="button"
                  aria-label={
                    isAutoRotatePaused
                      ? 'Resume auto pagination'
                      : 'Pause auto pagination'
                  }
                  title={
                    isAutoRotatePaused
                      ? 'Resume auto pagination'
                      : 'Pause auto pagination'
                  }
                  onClick={() =>
                    setIsAutoRotatePaused(prevPaused => !prevPaused)
                  }
                >
                  {isAutoRotatePaused ? (
                    <Play size={18} />
                  ) : (
                    <Pause size={18} />
                  )}
                </NavButton>
                <NavButton
                  type="button"
                  aria-label="Next page"
                  onClick={() => setCurrentPage(prev => (prev + 1) % totalPages)}
                >
                  <ChevronRight size={18} />
                </NavButton>
              </HeaderControls>
            )}
          </SectionHeader>
          <DataTable>
            <Table>
              <TableHead>
                <tr>
                  {columns.map((col, index) => (
                    <TableHeader key={index} colIndex={index}>{col}</TableHeader>
                  ))}
                </tr>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, rowIndex) => {
                  const globalIndex = currentPage * ROWS_PER_PAGE + rowIndex;
                  const barWidth = maxBarValue > 0 && valueColumn
                    ? (Number(row[valueColumn]) / maxBarValue) * 100
                    : 0;
                  const color = locationColors[globalIndex % locationColors.length];
                  
                  return (
                    <TableRow key={rowIndex}>
                      {columns.map((col, colIndex) => {
                        const value = row[col];
                        const isNumeric = numericColumns.includes(col);
                        const isLabel = col === labelColumn;
                        const isPercent = col === percentColumn;
                        
                        return (
                          <TableCell key={colIndex} colIndex={colIndex}>
                            {isLabel ? (
                              <LocationCell>
                                <LocationDot color={color} />
                                {String(value)}
                              </LocationCell>
                            ) : isNumeric && col === valueColumn ? (
                              <BarCell>
                                <BarContainer>
                                  <BarFill width={barWidth} color={color} />
                                </BarContainer>
                                <span style={{ fontWeight: 700, fontSize: 22, minWidth: 70, textAlign: 'right' }}>
                                  {Number(value).toLocaleString()}
                                </span>
                              </BarCell>
                            ) : isPercent ? (
                              <span style={{ fontWeight: 700, fontSize: 22, color: '#0d9488' }}>
                                {value}%
                              </span>
                            ) : (
                              String(value)
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DataTable>
        </TableSection>
      </ContentArea>
    </Container>
  );
}
