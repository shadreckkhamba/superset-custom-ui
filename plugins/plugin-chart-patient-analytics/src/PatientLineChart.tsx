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
import React, { useEffect, useRef } from 'react';
import { use, init, EChartsType } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { PatientLineChartTransformedProps } from './types';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
]);

const LINE_COLOR = '#4A90D9';
const AREA_GRADIENT = ['rgba(74, 144, 217, 0.3)', 'rgba(74, 144, 217, 0.05)'];

export default function PatientLineChart({
  data,
  showMarkers = true,
  smooth = true,
  height,
  width,
}: PatientLineChartTransformedProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  // Extract categories and values from data
  const categories = data.map(d => d.time);
  const values = data.map(d => d.value);
  const growthValues = data.map(d => d.growth);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = init(chartRef.current);

    // Create ECharts option
    const option = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category' as const,
        data: categories,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 12,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed' as const,
          },
        },
      },
      series: [
        {
          name: 'Average Visits',
          type: 'line',
          smooth: smooth,
          symbol: showMarkers ? 'circle' : 'none',
          symbolSize: 10,
          lineStyle: {
            color: LINE_COLOR,
            width: 3,
          },
          itemStyle: {
            color: LINE_COLOR,
            borderColor: '#fff',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: AREA_GRADIENT[0] },
                { offset: 1, color: AREA_GRADIENT[1] },
              ],
            },
          },
          data: values,
        },
      ],
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'line' as const,
          lineStyle: {
            color: '#ccc',
            type: 'dashed',
          },
        },
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        formatter: (params: Array<{ name: string; value: number; dataIndex: number }>) => {
          if (!params || !params.length) return '';
          const { name, value, dataIndex } = params[0];
          const growth = growthValues[dataIndex];
          let tooltipHtml = `<div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
                  <div>Value: <span style="font-weight: 600; color: ${LINE_COLOR};">${value}</span></div>`;
          
          if (growth !== undefined) {
            const growthColor = growth >= 0 ? '#22c55e' : '#ef4444';
            const growthIcon = growth >= 0 ? '↑' : '↓';
            tooltipHtml += `<div>Growth: <span style="font-weight: 600; color: ${growthColor};">${growthIcon} ${Math.abs(growth)}%</span></div>`;
          }
          
          return tooltipHtml;
        },
      },
    };

    chartInstance.current.setOption(option, true);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data, showMarkers, smooth, height, width]);

  return (
    <div
      ref={chartRef}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}
