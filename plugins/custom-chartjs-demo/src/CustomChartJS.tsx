import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ChartProps {
  data: { labels: string[]; values: number[] };
  height: number;
  width: number;
  options: {
    chartType: string;
    colors: string[];
    showLegend: boolean;
    stacked: boolean;
  };
}

export default function CustomChartJS({ data, height, width, options }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const chartTypes: Record<string, string> = {
      'bar': 'bar',
      'line': 'line', 
      'pie': 'pie',
      'doughnut': 'doughnut',
      'BigNumber': 'BigNumber'
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: chartTypes[options.chartType] || 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Values',
          data: data.values,
          backgroundColor: options.colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: options.showLegend }
        }
      }
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, options]);

  return (
    <div style={{ height, width, padding: '10px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
