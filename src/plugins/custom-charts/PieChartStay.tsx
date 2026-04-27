import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FilterOutlined } from '@ant-design/icons';
import { Info, X } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Dayjs } from 'dayjs';
import { DatePicker } from 'src/components/DatePicker';
import { ShimmerLoader } from './ShimmerLoader';
import { ENDPOINTS } from '../../config/endpoints';
import { extendedDayjs } from 'src/utils/dates';
import './chart-fixes.css';

ChartJS.register(ArcElement, Tooltip);

// CSS for responsive dashboard view switch
const responsiveSwitchStyles = `
  /* Responsive dashboard view switch */
  [data-test="dashboard-view-switch"] {
    padding: clamp(10px, 2.5vw, 14px) clamp(14px, 3.5vw, 20px) !important;
    gap: clamp(8px, 2vw, 12px) !important;
    margin-left: clamp(20px, 4vw, 45px) !important;
    border-width: clamp(1px, 0.2vw, 2px) !important;
    box-shadow: rgba(15, 23, 42, 0.15) 0px clamp(6px, 1.5vw, 12px) clamp(20px, 5vw, 40px), 
                rgba(15, 23, 42, 0.1) 0px clamp(2px, 0.5vw, 4px) clamp(6px, 1.5vw, 12px) !important;
  }
  
  [data-test="dashboard-view-switch"] > div {
    gap: clamp(8px, 2vw, 12px) !important;
  }
  
  [data-test="dashboard-view-switch"] span {
    font-size: clamp(12px, 2.5vw, 14px) !important;
  }
  
  [data-test="dashboard-view-switch"] .antd5-switch {
    transform: scale(clamp(0.9, 0.2vw + 0.9, 1.15)) !important;
  }
  
  /* Responsive adjustments for very small screens */
  @media (max-width: 480px) {
    [data-test="dashboard-view-switch"] {
      top: clamp(24px, 6vw, 32px) !important;
      padding: 8px 12px !important;
      gap: 6px !important;
      margin-left: 20px !important;
    }
    
    [data-test="dashboard-view-switch"] span {
      font-size: 11px !important;
    }
    
    [data-test="dashboard-view-switch"] .antd5-switch {
      transform: scale(0.85) !important;
    }
  }
  
  /* Responsive adjustments for medium screens */
  @media (min-width: 481px) and (max-width: 768px) {
    [data-test="dashboard-view-switch"] {
      padding: 10px 16px !important;
      gap: 8px !important;
      margin-left: 30px !important;
    }
    
    [data-test="dashboard-view-switch"] span {
      font-size: 12px !important;
    }
    
    [data-test="dashboard-view-switch"] .antd5-switch {
      transform: scale(0.95) !important;
    }
  }
`;

// Inject the responsive switch styles
if (typeof document !== 'undefined') {
  const styleId = 'responsive-dashboard-switch-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = responsiveSwitchStyles;
    document.head.appendChild(style);
  }
}

interface Entry {
  difference: string;
}

interface PieChartStayProps {
  refreshKey?: number;
  resetKey?: number;
  isDarkMode?: boolean;
  isExpanded?: boolean;
  autoRefresh?: boolean;
}
export default function StayTimePie({
  refreshKey,
  resetKey,
  isDarkMode = false,
  isExpanded = false,
  autoRefresh = true,
}: PieChartStayProps): JSX.Element {
  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const [percentages, setPercentages] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostCommonRange, setMostCommonRange] = useState<string | null>(null);
  const [shortestStay, setShortestStay] = useState<number | null>(null);
  const [longestStay, setLongestStay] = useState<number | null>(null);
  const [totalPatientCount, setTotalPatientCount] = useState<number>(0);

  // Progress bar state
  const [actualPercent, setActualPercent] = useState<number | null>(null);
  const [targetPercent] = useState<number>(100); // 100% when average ≤ 2h

  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    toDateKey(new Date()),
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedSliceIndexes, setSelectedSliceIndexes] = useState<number[]>(
    [],
  );
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoPanelReady, setInfoPanelReady] = useState(false);
  const [legendRevealVersion, setLegendRevealVersion] = useState(0);
  const [componentWidth, setComponentWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const infoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);
  const selectedSliceIndexesRef = useRef<number[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const filterMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const datePickerShellRef = useRef<HTMLDivElement | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerPopupStyle, setDatePickerPopupStyle] =
    useState<React.CSSProperties>({});
  const [filterMenuPopupStyle, setFilterMenuPopupStyle] =
    useState<React.CSSProperties>({});
  const todayKey = toDateKey(new Date());
  const selectedDateLabel = extendedDayjs(selectedDate).format('MMM D, YYYY');
  const isSelectedDateToday = selectedDate === todayKey;
  const closeDatePicker = () => setIsDatePickerOpen(false);

  useEffect(() => {
    selectedSliceIndexesRef.current = selectedSliceIndexes;
  }, [selectedSliceIndexes]);

  useEffect(() => {
    const currentWrapper = wrapperRef.current;
    if (typeof window === 'undefined' || !currentWrapper) {
      return undefined;
    }

    const updateComponentWidth = () => {
      setComponentWidth(currentWrapper.getBoundingClientRect().width);
    };

    updateComponentWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateComponentWidth);
      return () => window.removeEventListener('resize', updateComponentWidth);
    }

    const resizeObserver = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect.width;
      if (typeof nextWidth === 'number') {
        setComponentWidth(nextWidth);
      }
    });

    resizeObserver.observe(currentWrapper);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  useEffect(() => {
    if (!showFilterMenu) {
      setIsDatePickerOpen(false);
    }
  }, [showFilterMenu]);

  const isSlideshowMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('slideshow') === '1';
  const isViewportCompact = viewportWidth > 0 && viewportWidth <= 1100;
  const isNarrowCardLayout =
    !isExpanded && componentWidth > 0 && componentWidth <= 760;
  const isCompactFilterLayout =
    !isExpanded && componentWidth > 0 && componentWidth <= 420;
  const shouldFloatFilterMenu =
    isViewportCompact || isNarrowCardLayout || isCompactFilterLayout;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !showFilterMenu || !isDatePickerOpen) {
      return undefined;
    }

    const updateDatePickerPosition = () => {
      const shell = datePickerShellRef.current;
      if (!shell) {
        return;
      }

      const rect = shell.getBoundingClientRect();
      const isCompactViewport = window.innerWidth < 1100;
      const gap = 12;
      const popupWidth = Math.min(
        isCompactViewport ? 300 : isExpanded ? 360 : 340,
        window.innerWidth - 24,
      );
      const maxLeft = window.innerWidth - popupWidth - 12;
      const preferredLeft = isCompactViewport ? rect.left : rect.right + gap;
      const left = Math.max(12, Math.min(preferredLeft, maxLeft));
      const popupHeight = isCompactViewport ? 380 : 420;
      const preferredTop = isCompactViewport ? rect.bottom + gap : rect.top;
      const maxTop = window.innerHeight - popupHeight - 12;
      const top = Math.max(12, Math.min(preferredTop, maxTop));

      setDatePickerPopupStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${popupWidth}px`,
        maxHeight: `calc(100vh - 24px)`,
        overflowY: 'auto',
        margin: 0,
        transform: 'none',
        zIndex: 2000,
      });
    };

    updateDatePickerPosition();
    window.addEventListener('resize', updateDatePickerPosition);
    window.addEventListener('scroll', updateDatePickerPosition, true);

    return () => {
      window.removeEventListener('resize', updateDatePickerPosition);
      window.removeEventListener('scroll', updateDatePickerPosition, true);
    };
  }, [showFilterMenu, isDatePickerOpen, isExpanded]);

  useLayoutEffect(() => {
    if (
      typeof window === 'undefined' ||
      !showFilterMenu ||
      !shouldFloatFilterMenu
    ) {
      setFilterMenuPopupStyle({});
      return undefined;
    }

    const updateFilterMenuPosition = () => {
      const button = filterMenuButtonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - 230));
      const top = Math.max(
        12,
        Math.min(rect.bottom + 10, window.innerHeight - 24),
      );

      setFilterMenuPopupStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        margin: 0,
        transform: 'none',
        zIndex: 1900,
      });
    };

    updateFilterMenuPosition();
    window.addEventListener('resize', updateFilterMenuPosition);
    window.addEventListener('scroll', updateFilterMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateFilterMenuPosition);
      window.removeEventListener('scroll', updateFilterMenuPosition, true);
    };
  }, [showFilterMenu, shouldFloatFilterMenu]);

  // Handle external refresh requests
  useEffect(() => {
    if (refreshKey !== undefined) {
      setActualPercent(0);
      loadData();
    }
  }, [refreshKey]);

  // Reset to current day on explicit parent trigger
  useEffect(() => {
    if ((resetKey ?? 0) > 0) {
      handleReload();
    }
  }, [resetKey]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        showFilterMenu &&
        !target.closest('.filter-menu-container') &&
        !target.closest('.antd5-picker-dropdown')
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  // Convert "HH:MM:SS" → decimal hours
  const differenceToHours = (diff: string) => {
    const parts = diff.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    return h + m / 60 + s / 3600;
  };

  // Convert decimal hours → "Xh Ym" string
  const formatHours = (hours: number | null) => {
    if (hours === null || isNaN(hours)) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const ranges = [
    '< 1 hr',
    '1-2 hrs',
    '2-3 hrs',
    '3-4 hrs',
    '4-5 hrs',
    '> 5 hrs',
  ];
  const colors = [
    '#13c2c2',
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
  ];

  // Main data loader
  const loadData = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const anchorDate = selectedDate || todayKey;
      const params = new URLSearchParams();

      if (selectedPeriod === 'Daily') {
        params.set('date', anchorDate);
      } else if (selectedPeriod === 'Weekly') {
        const selectedDay = new Date(`${anchorDate}T00:00:00`);
        const dayOfWeek = selectedDay.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(selectedDay);
        weekStart.setDate(selectedDay.getDate() + mondayOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        params.set('start_date', toDateKey(weekStart));
        params.set('end_date', toDateKey(weekEnd));
      } else if (selectedPeriod === 'Monthly') {
        const selectedDay = extendedDayjs(`${anchorDate}T00:00:00`);
        params.set(
          'start_date',
          selectedDay.startOf('month').format('YYYY-MM-DD'),
        );
        params.set('end_date', selectedDay.endOf('month').format('YYYY-MM-DD'));
      } else {
        params.set('date', anchorDate);
      }

      const resp = await fetch(
        `${ENDPOINTS.STAY_TIMES_DISTRIBUTION}?${params.toString()}`,
      );
      const data = await resp.json();
      const entries: Entry[] = data.entries || [];

      const counts = [0, 0, 0, 0, 0, 0]; // 6 buckets
      const hoursList: number[] = [];

      entries.forEach(e => {
        const hrs = differenceToHours(e.difference);
        hoursList.push(hrs);

        if (hrs < 1)
          counts[0]++; // < 1 hr
        else if (hrs >= 1 && hrs < 2)
          counts[1]++; // 1-2 hrs
        else if (hrs >= 2 && hrs < 3)
          counts[2]++; // 2-3 hrs
        else if (hrs >= 3 && hrs < 4)
          counts[3]++; // 3-4 hrs
        else if (hrs >= 4 && hrs < 5)
          counts[4]++; // 4-5 hrs
        else counts[5]++; // >= 5 hrs
      });

      // Log for debugging
      console.log(`=== ${selectedPeriod} Analysis ===`);
      console.log(`Reference date: ${anchorDate}`);
      console.log(`Total entries from API: ${entries.length}`);
      console.log(`Distribution:`, {
        '< 1 hr': counts[0],
        '1-2 hrs': counts[1],
        '2-3 hrs': counts[2],
        '3-4 hrs': counts[3],
        '4-5 hrs': counts[4],
        '>= 5 hrs': counts[5],
      });
      console.log(`Sum of counts: ${counts.reduce((a, b) => a + b, 0)}`);

      const total = counts.reduce((a, b) => a + b, 0);
      const percents = counts
        .map(c => (total ? (c / total) * 100 : 0))
        .map(v => Number(v.toFixed(2)));

      // Verify data integrity
      if (total !== entries.length) {
        console.warn(
          `DATA MISMATCH: Counted ${total} but API returned ${entries.length} entries!`,
        );
      }

      const mostCommon =
        total > 0 ? ranges[counts.indexOf(Math.max(...counts))] : null;

      const avgStay = hoursList.length
        ? hoursList.reduce((a, b) => a + b, 0) / hoursList.length
        : null;

      const progressPercent = avgStay
        ? Math.min((1 / avgStay) * targetPercent, targetPercent)
        : null;

      setPercentages(percents);
      setMostCommonRange(mostCommon);
      setShortestStay(data.shortest_stay || null);
      setLongestStay(data.longest_stay || null);
      setTotalPatientCount(entries.length);
      setActualPercent(progressPercent);
    } catch (err) {
      console.error('Error fetching stay time data', err);
    } finally {
      // Ensure shimmer shows for at least 800ms
      const elapsedTime = Date.now() - startTime;
      const minDisplayTime = 2000;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  // Auto refresh every 60s - consistent with other charts
  useEffect(() => {
    // Clear focused slice when period changes so new period always shows labels
    setSelectedSliceIndexes([]);
    // Reset progress bar immediately when period changes
    setActualPercent(null);
    setAnimatedPercent(0);
    loadData();

    if (!autoRefresh) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      loadData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, selectedPeriod, selectedDate]);

  // If the focused slice disappears in a new dataset, fall back to all slices
  useEffect(() => {
    setSelectedSliceIndexes(previousIndexes => {
      if (previousIndexes.length === 0) return previousIndexes;
      const validIndexes = previousIndexes.filter(
        index => (percentages[index] ?? 0) > 0,
      );
      return validIndexes.length === previousIndexes.length
        ? previousIndexes
        : validIndexes;
    });
  }, [percentages]);

  // Force chart animation on data update
  useEffect(() => {
    if (!loading && chartRef.current) {
      const chart = chartRef.current;
      // Reset and update to trigger animation
      chart.stop();
      chart.reset();
      chart.update('active');
      // Start legend stagger in sync with pie redraw.
      setLegendRevealVersion(currentVersion => currentVersion + 1);
    }
  }, [percentages, loading]);

  // Helper to convert the range into < or >
  const formatStayRange = (range: string) => {
    if (!range) return null;

    if (range.includes('< 1')) return 'less than 1 hour';
    if (range.includes('1-2')) return 'less than 2 hours';
    if (range.includes('2-3')) return 'less than 3 hours';
    if (range.includes('3-4')) return 'more than 3 hours';
    if (range.includes('4-5')) return 'more than 4 hours';
    if (range.includes('> 5')) return 'more than 5 hours';

    return range; // fallback
  };

  // Animate actualPercent whenever it updates
  useEffect(() => {
    if (actualPercent === null) {
      // If actualPercent is null (no data), animate down to 0
      const currentValue = animatedPercent;
      if (currentValue === 0) return; // Already at 0

      let start = currentValue;
      const duration = 600; // ms
      const stepTime = 20;
      const steps = duration / stepTime;
      const decrement = currentValue / steps;

      const timer = setInterval(() => {
        start -= decrement;
        if (start <= 0) {
          start = 0;
          clearInterval(timer);
        }
        setAnimatedPercent(start);
      }, stepTime);

      return () => clearInterval(timer);
    }

    // Animate from current value to new actualPercent
    const startValue = animatedPercent;
    const endValue = actualPercent;
    const duration = 1200; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (endValue - startValue) / steps;

    let current = startValue;
    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= endValue) ||
        (increment < 0 && current <= endValue)
      ) {
        current = endValue;
        clearInterval(timer);
      }
      setAnimatedPercent(current);
    }, stepTime);

    return () => clearInterval(timer);
  }, [actualPercent]);

  useEffect(() => {
    if (showInfoModal) {
      if (infoCloseTimeoutRef.current) {
        clearTimeout(infoCloseTimeoutRef.current);
        infoCloseTimeoutRef.current = null;
      }
      setInfoPanelReady(false);
      const rafId = requestAnimationFrame(() => setInfoPanelReady(true));
      return () => cancelAnimationFrame(rafId);
    }

    setInfoPanelReady(false);
    return undefined;
  }, [showInfoModal]);

  useEffect(
    () => () => {
      if (infoCloseTimeoutRef.current) {
        clearTimeout(infoCloseTimeoutRef.current);
      }
    },
    [],
  );

  const hasData = useMemo(() => percentages.some(p => p > 0), [percentages]);

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    const validPercentages =
      percentages.length === ranges.length
        ? percentages
        : Array(ranges.length).fill(0);
    const hasSelection = selectedSliceIndexes.length > 0;

    return {
      labels: ranges,
      datasets: [
        {
          data: validPercentages, // raw percentages
          backgroundColor: colors.map((color, idx) =>
            !hasSelection || selectedSliceIndexes.includes(idx)
              ? color
              : isDarkMode
                ? 'rgba(120, 128, 140, 0.20)'
                : 'rgba(160, 170, 185, 0.28)',
          ),
          borderWidth: 0,
          borderColor: 'transparent',
          hoverBorderWidth: 0,
          spacing: 0,
        },
      ],
    };
  }, [percentages, selectedSliceIndexes, isDarkMode]);

  // Memoize chart options
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 2,
      cutout: '50%',
      layout: {
        padding: isExpanded
          ? {
              top: 20,
              bottom: 20,
              left: 24,
              right: 24,
            }
          : {
              top: 60,
              bottom: 60,
              left: 80,
              right: 80,
            },
      },
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 3400,
      },
      onClick: (_event: unknown, elements: any[]) => {
        if (!Array.isArray(elements) || elements.length === 0) return;

        const clickedIndex = elements[0]?.index;
        if (typeof clickedIndex !== 'number') return;
        if ((percentages[clickedIndex] ?? 0) <= 0) return;

        setSelectedSliceIndexes(previousIndexes =>
          previousIndexes.includes(clickedIndex)
            ? previousIndexes.filter(index => index !== clickedIndex)
            : [...previousIndexes, clickedIndex],
        );
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDarkMode
            ? 'rgba(26, 26, 26, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDarkMode ? '#e0e0e0' : '#000',
          bodyColor: isDarkMode ? '#e0e0e0' : '#000',
          borderColor: isDarkMode ? '#404040' : '#ddd',
          borderWidth: 2,
          padding: 22,
          displayColors: false,
          cornerRadius: 12,
          titleFont: {
            size: isExpanded ? 16 : 24,
            weight: 'bold' as const,
            family: 'sans-serif',
          },
          bodyFont: {
            size: isExpanded ? 14 : 22,
            weight: 'bold' as const,
            family: 'sans-serif',
          },
          callbacks: {
            title: (context: any[]) => {
              const label = context?.[0]?.label ?? '';
              return `Stay Time Range: ${label}`;
            },
            label: (context: any) => {
              const actualValue = percentages[context.dataIndex] || 0;
              return `Percentage: ${actualValue.toFixed(1)}%`;
            },
          },
        } as const,
      },
    }),
    [percentages, isDarkMode, isExpanded],
  );

  // Custom plugin for callout labels
  const calloutLabelsPlugin = useMemo(
    () => ({
      id: 'calloutLabels',
      afterDraw: (chart: any) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const datasetValuesRaw = chart?.data?.datasets?.[0]?.data ?? [];
        const datasetValues = Array.isArray(datasetValuesRaw)
          ? datasetValuesRaw.map((v: unknown) => Number(v) || 0)
          : [];
        if (!datasetValues.length || datasetValues.every((v: number) => v <= 0))
          return;

        const { left, right, top, bottom } = chartArea;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const chartWidth = right - left;
        const chartHeight = bottom - top;
        const canvasWidth = chart.width;
        const canvasHeight = chart.height;

        ctx.save();

        try {
          const meta = chart.getDatasetMeta(0);
          if (!meta?.data) return;

          const chartRadius = Math.min(chartWidth, chartHeight) / 2;
          const selectedIndexes = selectedSliceIndexesRef.current;
          const hasSelectedSlices = selectedIndexes.length > 0;

          // Make responsive based on chart size with tighter bounds so connectors don't get too long.
          const outerOffset = Math.min(Math.max(10, chartRadius * 0.05), 15); // 10-15px range
          const bendDistance = Math.min(Math.max(18, chartRadius * 0.1), 28); // 18-28px range

          meta.data.forEach((arc: any, index: number) => {
            const value = datasetValues[index] || 0;
            if (value <= 0) return;
            if (hasSelectedSlices && !selectedIndexes.includes(index)) return;

            const angle = (arc.startAngle + arc.endAngle) / 2;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);

            // Anchor the connector line at the actual circumference of the arc (not inside the slice).
            const arcCenterX = Number(arc.x ?? centerX);
            const arcCenterY = Number(arc.y ?? centerY);
            const arcOuterRadius = Number(
              arc.outerRadius ?? chartRadius * 0.85,
            );

            const lineStartX = arcCenterX + cosAngle * arcOuterRadius;
            const lineStartY = arcCenterY + sinAngle * arcOuterRadius;

            const midX = arcCenterX + cosAngle * (arcOuterRadius + outerOffset);
            const midY = arcCenterY + sinAngle * (arcOuterRadius + outerOffset);

            // Reduce bend distance on left side to prevent cutoff
            const adjustedBendDistance =
              cosAngle < 0 ? bendDistance * 0.75 : bendDistance;
            const bendX =
              midX +
              (cosAngle >= 0 ? adjustedBendDistance : -adjustedBendDistance);
            const bendY = midY;
            const clampedBendX = Math.min(
              canvasWidth - 10,
              Math.max(10, bendX),
            );
            const clampedBendY = Math.min(
              canvasHeight - 10,
              Math.max(10, bendY),
            );

            const connectorColor = isDarkMode ? '#bfc7d2' : '#333';
            const labelColor = isDarkMode ? '#ffffff' : '#000';

            // Draw connector line
            ctx.beginPath();
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(midX, midY);
            ctx.lineTo(clampedBendX, clampedBendY);
            ctx.strokeStyle = connectorColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Label text - keep readable but avoid clipping on smaller/denser views
            const text = `${value.toFixed(1)}%`;
            const isLargeCanvas = canvasHeight >= 340;
            const fontSize = isLargeCanvas
              ? Math.min(Math.max(20, chartRadius * 0.11), 32)
              : Math.min(Math.max(16, chartRadius * 0.08), 26);
            ctx.font = `bold ${fontSize}px sans-serif`;

            ctx.fillStyle = labelColor;

            const textWidth = ctx.measureText(text).width;
            let textX = clampedBendX + (cosAngle >= 0 ? 8 : -8);
            if (cosAngle >= 0) {
              ctx.textAlign = 'left';
              textX = Math.min(
                canvasWidth - 10 - textWidth,
                Math.max(10, textX),
              );
            } else {
              ctx.textAlign = 'right';
              textX = Math.max(
                10 + textWidth,
                Math.min(canvasWidth - 10, textX),
              );
            }
            ctx.textBaseline = 'middle';
            const textY = Math.min(
              canvasHeight - 12,
              Math.max(12, clampedBendY),
            );

            // Draw label
            ctx.fillText(text, textX, textY);
          });
        } catch (error) {
          console.error('Error in calloutLabels plugin:', error);
        } finally {
          ctx.restore();
        }
      },
    }),
    [isDarkMode],
  );

  // Reload handler
  const handleReload = async () => {
    setActualPercent(0);
    if (selectedPeriod !== 'Daily' || selectedDate !== todayKey) {
      setSelectedDate(todayKey);
    }
    if (selectedPeriod !== 'Daily') {
      setSelectedPeriod('Daily');
      return;
    }
    if (selectedDate !== todayKey) {
      return;
    }
    await loadData();
  };

  const openInfoModal = () => {
    if (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('slideshow') === '1'
    ) {
      return;
    }
    if (infoCloseTimeoutRef.current) {
      clearTimeout(infoCloseTimeoutRef.current);
      infoCloseTimeoutRef.current = null;
    }
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setInfoPanelReady(false);
    infoCloseTimeoutRef.current = setTimeout(() => {
      setShowInfoModal(false);
      infoCloseTimeoutRef.current = null;
    }, 360);
  };

  const expandedContentMinHeight = 'clamp(200px, 26vh, 300px)';
  const wrapperPadding = isExpanded ? '8px 10px' : '40px 35px';
  const infoBoxPadding = isExpanded ? '8px' : '25px';
  const infoBoxMinWidth = isExpanded ? 'clamp(120px, 12vw, 180px)' : '200px';
  const infoBoxMaxWidth = isExpanded ? 'clamp(230px, 16vw, 280px)' : '100%';
  const topHeaderMarginBottom = isExpanded ? 'clamp(6px, 0.8vh, 10px)' : '20px';
  const headerLabelFontSize = isExpanded ? 'clamp(15px, 1.1vw, 20px)' : '24px';
  const headerTitleFontSize = isExpanded ? 'clamp(20px, 1.5vw, 28px)' : '28px';
  const totalPatientsMarginTop = isExpanded
    ? 'clamp(8px, 1.1vh, 16px)'
    : isNarrowCardLayout
      ? '14px'
      : '30px';
  const totalPatientsFontSize = isExpanded
    ? 'clamp(14px, 1.02vw, 19px)'
    : '22px';
  const totalPatientsValueFontSize = isExpanded
    ? 'clamp(18px, 1.35vw, 24px)'
    : '26px';
  const filterLabelFontSize = isExpanded
    ? 'clamp(11px, 0.8vw, 14px)'
    : isCompactFilterLayout
      ? '11px'
      : '18px';
  const filterIconFontSize = isExpanded
    ? 'clamp(16px, 1vw, 20px)'
    : isCompactFilterLayout
      ? '15px'
      : '28px';
  const filterMenuReserveSpace = isExpanded
    ? 'clamp(90px, 10vw, 150px)'
    : isCompactFilterLayout
      ? '110px'
      : '140px';
  const filterDotSize = isExpanded
    ? '10px'
    : isCompactFilterLayout
      ? '6px'
      : '12px';
  const filterTriggerGap = isExpanded
    ? '8px'
    : isCompactFilterLayout
      ? '4px'
      : '10px';
  const filterTriggerPadding = isExpanded
    ? '7px 10px'
    : isCompactFilterLayout
      ? '6px 8px'
      : '10px 14px';
  const filterTriggerIconSize = isExpanded
    ? '20px'
    : isCompactFilterLayout
      ? '16px'
      : '24px';
  const mostCommonFontSize = isExpanded ? 'clamp(14px, 1vw, 18px)' : '22px';
  const mostCommonPadding = isExpanded ? '5px 8px' : '6px 10px';
  const mostCommonMarginBottom = isExpanded
    ? 'clamp(6px, 0.9vh, 10px)'
    : '20px';
  const progressSectionMarginTop = isExpanded ? 'clamp(8px, 1vh, 14px)' : '0px';
  const progressSectionMarginBottom = isExpanded
    ? 'clamp(6px, 0.9vh, 10px)'
    : '20px';
  const progressLabelsFontSize = isExpanded
    ? 'clamp(13px, 0.96vw, 17px)'
    : '20px';
  const progressLabelsMarginBottom = isExpanded
    ? 'clamp(4px, 0.55vh, 7px)'
    : '8px';
  const progressBarHeight = isExpanded ? 'clamp(14px, 1.5vh, 18px)' : '24px';
  const statValueFontSize = isExpanded ? 'clamp(18px, 1.4vw, 24px)' : '26px';
  const statLabelFontSize = isExpanded ? 'clamp(12px, 0.92vw, 16px)' : '18px';
  const statsMarginTop = isExpanded ? '10px' : '16px';
  const filterMenuOptionFontSize = isExpanded
    ? 'clamp(14px, 1.02vw, 18px)'
    : '22px';
  const infoBoxContentGap = isExpanded ? 'clamp(6px, 0.9vh, 12px)' : '16px';
  const legendGap = isExpanded ? '6px' : '10px';
  const legendMinWidth = isExpanded ? '60px' : '100px';
  const legendMaxWidth = isExpanded ? '100px' : '150px';
  const legendMarginTop = isExpanded ? '8px' : '80px';
  const legendPadding = isExpanded ? '10px' : '20px';
  const legendTitleFontSize = isExpanded ? '15px' : '22px';
  const legendTitleMarginBottom = isExpanded ? '4px' : '8px';
  const legendTitlePaddingBottom = isExpanded ? '8px' : '12px';
  const legendItemPadding = isExpanded ? '7px 9px' : '10px 12px';
  const legendItemRadius = isExpanded ? '8px' : '10px';
  const legendItemLabelGap = isExpanded ? '8px' : '10px';
  const legendDotSize = isExpanded ? '10px' : '12px';
  const legendLabelFontSize = isExpanded ? '13px' : '20px';
  const legendWrapperPaddingTop = isExpanded ? '16px' : '50px';
  const infoButtonTop = isExpanded ? '-2px' : '0px';
  const infoButtonRight = isExpanded ? '-2px' : '0px';

  return (
    <div
      ref={wrapperRef}
      className="responsive-chart-wrapper pie-stay-wrapper"
      style={{
        width: '100%',
        height: isExpanded ? 'auto' : '100%',
        maxHeight: isExpanded ? 'none' : '800px',
        minHeight: isExpanded ? expandedContentMinHeight : '600px',
        maxWidth: '100%',
        margin: '0',
        padding: wrapperPadding,
        borderRadius: '16px',
        boxShadow: isDarkMode
          ? '0 4px 12px rgba(0,0,0,0.4)'
          : '0 4px 12px rgba(0,0,0,0.12)',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {!isSlideshowMode && (
        <button
          className="pie-stay-info-button"
          type="button"
          aria-label="What am I seeing?"
          onClick={openInfoModal}
          style={{
            position: 'absolute',
            top: infoButtonTop,
            right: infoButtonRight,
            width: '32px',
            height: '32px',
            borderRadius: '999px',
            border: 'none',
            background: 'transparent',
            color: isDarkMode ? '#d9d9d9' : '#595959',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 12,
            transition: 'transform 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.color = '#1890ff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.color = isDarkMode ? '#d9d9d9' : '#595959';
          }}
        >
          <Info size={20} strokeWidth={2.2} />
        </button>
      )}

      <style>{`
        @keyframes pie-stay-legend-slide-down {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pie-stay-wrapper .pie-stay-legend-row {
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .pie-stay-wrapper .pie-stay-legend-row {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }

        @media (max-width: 768px) {
          .responsive-chart-wrapper {
            flex-direction: column !important;
          }
          .responsive-chart-wrapper > div {
            flex-wrap: wrap !important;
          }
          .pie-stay-reference-date-picker.ant-picker,
          .pie-stay-reference-date-picker.antd5-picker {
            width: 100% !important;
            min-width: 0 !important;
          }
          .pie-stay-reference-date-picker-dropdown {
            width: min(92vw, 360px) !important;
            max-width: calc(100vw - 24px) !important;
            margin-left: 0 !important;
            margin-top: 0 !important;
          }
        }

        /* Expanded pie container:
           use available middle width for label room while keeping pie diameter stable via fixed height. */
        .pie-stay-wrapper .pie-stay-chart-container--expanded {
          flex: 1 1 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          height: 360px !important;
          min-height: 360px !important;
          max-height: 360px !important;
          aspect-ratio: auto !important;
          align-self: stretch !important;
          margin: 0 !important;
          padding: 4px !important;
        }

        .pie-stay-wrapper .pie-stay-chart-container--expanded canvas {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
        }

        /* Slightly shorter on smaller/medium screens (already working there). */
        @media (max-width: 1400px) {
          .pie-stay-wrapper .pie-stay-chart-container--expanded {
            height: 300px !important;
            min-height: 300px !important;
            max-height: 300px !important;
            margin: 0 8px !important;
          }

          /* Legend compaction for "smaller screens" that still keep 3-column layout. */
          .pie-stay-wrapper .pie-stay-legend-wrapper {
            padding-top: 12px !important;
          }
          .pie-stay-wrapper .pie-stay-legend-card {
            margin-top: 8px !important;
            padding: 8px 10px !important;
            gap: 4px !important;
          }
          .pie-stay-wrapper .pie-stay-legend-title {
            margin-bottom: 2px !important;
            padding-bottom: 6px !important;
          }
          .pie-stay-wrapper .pie-stay-legend-item {
            padding: 5px 9px !important;
          }
        }

        .pie-stay-reference-date-picker.ant-picker,
        .pie-stay-reference-date-picker.antd5-picker {
          width: 100% !important;
          min-width: 0 !important;
          height: 42px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(24, 144, 255, 0.16) !important;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 250, 255, 0.9) 100%) !important;
          box-shadow:
            0 8px 20px rgba(24, 144, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.96) !important;
          backdrop-filter: blur(14px) saturate(170%) !important;
          -webkit-backdrop-filter: blur(14px) saturate(170%) !important;
          transition:
            transform 180ms ease,
            box-shadow 220ms ease,
            border-color 220ms ease,
            background 220ms ease,
            filter 220ms ease !important;
        }

        [data-theme='dark'] .pie-stay-reference-date-picker.ant-picker,
        [data-theme='dark'] .pie-stay-reference-date-picker.antd5-picker {
          border-color: rgba(120, 144, 171, 0.42) !important;
          background: linear-gradient(135deg, rgba(20, 28, 38, 0.96) 0%, rgba(14, 20, 30, 0.90) 100%) !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.09) !important;
        }

        .pie-stay-reference-date-picker.ant-picker:hover,
        .pie-stay-reference-date-picker.antd5-picker:hover {
          transform: translateY(-1px);
          border-color: rgba(24, 144, 255, 0.3) !important;
          box-shadow:
            0 12px 26px rgba(24, 144, 255, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.96) !important;
          filter: saturate(1.04);
        }

        .pie-stay-reference-date-picker.ant-picker-focused,
        .pie-stay-reference-date-picker.antd5-picker-focused,
        .pie-stay-reference-date-picker.ant-picker.ant-picker-focused {
          border-color: rgba(24, 144, 255, 0.58) !important;
          box-shadow:
            0 0 0 4px rgba(24, 144, 255, 0.12),
            0 18px 34px rgba(24, 144, 255, 0.16) !important;
        }

        .pie-stay-reference-date-picker .ant-picker-input > input,
        .pie-stay-reference-date-picker .antd5-picker-input > input {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          letter-spacing: 0.01em !important;
          line-height: 1 !important;
          min-width: 0 !important;
          padding: 0 0 0 2px !important;
          color: #4d6078 !important;
          background: transparent !important;
        }

        [data-theme='dark'] .pie-stay-reference-date-picker .ant-picker-input > input,
        [data-theme='dark'] .pie-stay-reference-date-picker .antd5-picker-input > input {
          color: rgba(235, 242, 250, 0.92) !important;
        }

        .pie-stay-reference-date-picker .ant-picker-suffix,
        .pie-stay-reference-date-picker .antd5-picker-suffix {
          width: 24px !important;
          height: 24px !important;
          margin-left: 10px !important;
          border-radius: 999px !important;
          background: linear-gradient(180deg, rgba(24, 144, 255, 0.12) 0%, rgba(24, 144, 255, 0.08) 100%) !important;
          color: #1890ff !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
          opacity: 1 !important;
        }

        .pie-stay-reference-date-picker.ant-picker:hover .ant-picker-suffix,
        .pie-stay-reference-date-picker.antd5-picker:hover .antd5-picker-suffix,
        .pie-stay-reference-date-picker.ant-picker-focused .ant-picker-suffix,
        .pie-stay-reference-date-picker.antd5-picker-focused .antd5-picker-suffix {
          background: linear-gradient(180deg, rgba(24, 144, 255, 0.18) 0%, rgba(24, 144, 255, 0.12) 100%) !important;
        }

        .pie-stay-reference-date-picker-dropdown {
          border-radius: 22px !important;
          overflow: hidden !important;
          will-change: opacity, transform;
        }

        .pie-stay-reference-date-picker-dropdown.ant-slide-up-appear,
        .pie-stay-reference-date-picker-dropdown.ant-slide-up-enter {
          opacity: 0;
          transform: translateX(12px) scale(0.985);
        }

        .pie-stay-reference-date-picker-dropdown.ant-slide-up-appear.ant-slide-up-appear-active,
        .pie-stay-reference-date-picker-dropdown.ant-slide-up-enter.ant-slide-up-enter-active {
          opacity: 1;
          transform: translateX(0) scale(1);
          transition: opacity 160ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .pie-stay-reference-date-picker-dropdown.ant-slide-up-leave {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .pie-stay-reference-date-picker-dropdown.ant-slide-up-leave.ant-slide-up-leave-active {
          opacity: 0;
          transform: translateX(12px) scale(0.985);
          transition: opacity 140ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .pie-stay-reference-date-picker-popup-shell {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
        }

        .pie-stay-reference-date-picker-popup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 14px 11px 14px;
          border-bottom: 1px solid rgba(60, 60, 67, 0.08);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 248, 250, 0.78) 100%);
          color: rgba(60, 60, 67, 0.68);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: none;
        }

        [data-theme='dark'] .pie-stay-reference-date-picker-popup-header {
          border-bottom-color: rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(32, 32, 34, 0.98) 0%, rgba(24, 24, 26, 0.94) 100%);
          color: rgba(235, 235, 245, 0.7);
        }

        .pie-stay-reference-date-picker-popup-close {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: none;
          background: rgba(120, 120, 128, 0.14);
          color: rgba(60, 60, 67, 0.72);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease;
          box-shadow: none;
          flex: 0 0 auto;
        }

        .pie-stay-reference-date-picker-popup-close:hover {
          transform: scale(1.04);
          background: rgba(120, 120, 128, 0.18);
          color: rgba(60, 60, 67, 0.92);
        }

        .pie-stay-reference-date-picker-popup-close:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.14);
        }

        [data-theme='dark'] .pie-stay-reference-date-picker-popup-close {
          background: rgba(255, 255, 255, 0.10);
          color: rgba(235, 235, 245, 0.72);
        }

        [data-theme='dark'] .pie-stay-reference-date-picker-popup-close:hover {
          background: rgba(255, 255, 255, 0.16);
          color: rgba(255, 255, 255, 0.9);
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-panel-container,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-panel-container {
          border-radius: 20px !important;
          overflow: hidden !important;
          border: 1px solid rgba(60, 60, 67, 0.12) !important;
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 251, 0.94) 100%) !important;
          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.16), 0 8px 18px rgba(15, 23, 42, 0.08) !important;
          backdrop-filter: blur(16px) saturate(130%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(130%) !important;
        }

        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-panel-container,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-panel-container {
          border-color: rgba(255, 255, 255, 0.08) !important;
          background: linear-gradient(160deg, rgba(32, 32, 34, 0.98) 0%, rgba(24, 24, 26, 0.96) 100%) !important;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.38), 0 8px 18px rgba(0, 0, 0, 0.18) !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-header,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header {
          padding: 12px 14px 8px !important;
          border-bottom: 1px solid rgba(60, 60, 67, 0.08) !important;
          border-radius: 20px 20px 0 0 !important;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(247, 248, 250, 0.64) 100%) !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-prev-btn,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-prev-btn,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-next-btn,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-next-btn,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-prev-btn,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-prev-btn,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-next-btn,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-next-btn {
          width: 28px !important;
          height: 28px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(24, 144, 255, 0.14) !important;
          background: linear-gradient(180deg, rgba(24, 144, 255, 0.10) 0%, rgba(24, 144, 255, 0.04) 100%) !important;
          color: #1890ff !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-prev-btn:hover,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-prev-btn:hover,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-next-btn:hover,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-next-btn:hover,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-prev-btn:hover,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-prev-btn:hover,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-next-btn:hover,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-next-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(24, 144, 255, 0.28) !important;
          background: linear-gradient(180deg, rgba(24, 144, 255, 0.16) 0%, rgba(24, 144, 255, 0.10) 100%) !important;
          box-shadow: 0 8px 18px rgba(24, 144, 255, 0.14) !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-prev-btn:active,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-prev-btn:active,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-next-btn:active,
        .pie-stay-reference-date-picker-dropdown .ant-picker-header-next-btn:active,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-prev-btn:active,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-prev-btn:active,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-next-btn:active,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-header-next-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 10px rgba(24, 144, 255, 0.10) !important;
        }

        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-prev-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-prev-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-next-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-next-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-prev-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-prev-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-next-btn,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-next-btn {
          border-color: rgba(24, 144, 255, 0.24) !important;
          background: linear-gradient(180deg, rgba(24, 144, 255, 0.18) 0%, rgba(24, 144, 255, 0.10) 100%) !important;
          color: #46a6ff !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        }

        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-prev-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-prev-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-super-next-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .ant-picker-header-next-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-prev-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-prev-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-super-next-btn:hover,
        [data-theme='dark'] .pie-stay-reference-date-picker-dropdown .antd5-picker-header-next-btn:hover {
          border-color: rgba(70, 166, 255, 0.38) !important;
          background: linear-gradient(180deg, rgba(24, 144, 255, 0.24) 0%, rgba(24, 144, 255, 0.14) 100%) !important;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18) !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-body,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-body {
          padding: 12px 14px 14px !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-cell-inner,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-cell-inner {
          border-radius: 12px !important;
          transition: transform 140ms ease, background 140ms ease, box-shadow 140ms ease !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-cell:hover .ant-picker-cell-inner,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-cell:hover .antd5-picker-cell-inner {
          transform: translateY(-1px);
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-cell-selected .antd5-picker-cell-inner {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
          box-shadow: 0 8px 18px rgba(24, 144, 255, 0.28) !important;
          color: #fff !important;
        }

        .pie-stay-reference-date-picker-dropdown .ant-picker-today-btn,
        .pie-stay-reference-date-picker-dropdown .antd5-picker-today-btn {
          border-radius: 999px !important;
          padding: 0 12px !important;
        }

        /* Dark mode menu button fix */
        [data-theme="dark"] .antd5-btn.antd5-btn-default.antd5-btn-color-default.antd5-btn-variant-outlined,
        [data-theme="dark"] .superset-button.superset-button-tertiary,
        [data-theme="dark"] button[data-test="actions-trigger"] {
          background-color: rgba(45, 45, 45, 0.9) !important;
          border-color: rgba(64, 64, 64, 0.8) !important;
          color: #e0e0e0 !important;
        }
        
        [data-theme="dark"] .antd5-btn.antd5-btn-default.antd5-btn-color-default.antd5-btn-variant-outlined:hover,
        [data-theme="dark"] .superset-button.superset-button-tertiary:hover,
        [data-theme="dark"] button[data-test="actions-trigger"]:hover {
          background-color: rgba(64, 64, 64, 0.9) !important;
          border-color: rgba(96, 96, 96, 0.9) !important;
          color: #ffffff !important;
        }
        
        /* Scrollbar fixes */
        .dashboard-component-tabs-content,
        .dashboard-component-chart-holder {
          overflow: visible !important;
        }
        
        .dashboard-grid {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
      `}</style>

      <div
        className="pie-stay-body"
        style={{
          display: 'flex',
          alignItems: isExpanded || isNarrowCardLayout ? 'stretch' : 'center',
          gap: isExpanded ? '10px' : isNarrowCardLayout ? '16px' : '20px',
          width: '100%',
          height: isExpanded || isNarrowCardLayout ? 'auto' : '100%',
          flex: isExpanded ? '0 0 auto' : '1 1 0',
          justifyContent:
            isExpanded || isNarrowCardLayout ? 'flex-start' : 'space-between',
          flexWrap: isExpanded || isNarrowCardLayout ? 'wrap' : 'nowrap',
          minHeight: isExpanded || isNarrowCardLayout ? '0' : '520px',
          maxHeight: isExpanded || isNarrowCardLayout ? 'none' : '640px',
          position: 'relative',
          overflow:
            isNarrowCardLayout || isViewportCompact ? 'visible' : 'hidden',
        }}
      >
        {/* Left - Info Box */}
        <div
          style={{
            padding: infoBoxPadding,
            borderRadius: '12px',
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.4)'
              : '0 4px 12px rgba(0,0,0,0.12)',
            border: isDarkMode ? '1px solid #404040' : '1px solid #e0e0e0',
            flex: isNarrowCardLayout ? '1 1 100%' : '1 1 0',
            minWidth: isNarrowCardLayout ? '100%' : infoBoxMinWidth,
            maxWidth: isNarrowCardLayout ? '100%' : infoBoxMaxWidth,
            alignSelf:
              isExpanded || isNarrowCardLayout ? 'stretch' : 'flex-start',
            height: isExpanded ? '100%' : isNarrowCardLayout ? 'auto' : '60vh',
            minHeight: isExpanded ? '0' : 'auto',
            maxHeight: isExpanded || isNarrowCardLayout ? 'none' : '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: infoBoxContentGap,
            marginTop: '0',
            position: 'relative',
            overflow:
              isNarrowCardLayout || isViewportCompact ? 'visible' : 'hidden',
            transition:
              'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Top Header with Title + Menu */}
          <div
            style={{
              marginBottom: topHeaderMarginBottom,
              position: 'relative',
              paddingRight: isNarrowCardLayout ? '0' : filterMenuReserveSpace,
            }}
          >
            <div
              style={{
                fontSize: headerLabelFontSize,
                color: isDarkMode ? '#b0b0b0' : '#666',
                fontWeight: 600,
                transition: 'color 0.3s ease',
              }}
            >
              Performance
            </div>
            <div
              style={{
                marginBottom: isExpanded ? 'clamp(8px, 0.9vh, 14px)' : '15px',
                fontSize: headerTitleFontSize,
                color: isDarkMode ? '#e0e0e0' : '#333',
                fontWeight: 700,
                transition: 'color 0.3s ease',
              }}
            >
              Indicators
            </div>

            {/* Filter Selector */}
            <div
              className="filter-menu-container"
              style={{
                position: isNarrowCardLayout ? 'relative' : 'absolute',
                right: isNarrowCardLayout ? 'auto' : 0,
                top: isNarrowCardLayout ? 'auto' : 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: filterTriggerGap,
                width: isNarrowCardLayout ? '100%' : 'auto',
                marginTop: isNarrowCardLayout ? '2px' : 0,
              }}
            >
              <button
                type="button"
                ref={filterMenuButtonRef}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: filterTriggerGap,
                  padding: filterTriggerPadding,
                  borderRadius: '999px',
                  border: isDarkMode
                    ? '1px solid rgba(120, 144, 171, 0.42)'
                    : '1px solid rgba(24, 144, 255, 0.26)',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(23, 34, 46, 0.95) 0%, rgba(18, 24, 33, 0.95) 100%)'
                    : 'linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)',
                  boxShadow: isDarkMode
                    ? '0 6px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                    : '0 6px 14px rgba(24, 144, 255, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  color: isDarkMode ? '#d7e6f6' : '#2e5f89',
                  fontSize: filterLabelFontSize,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  lineHeight: 1,
                  transition:
                    'transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '0 8px 18px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                    : '0 8px 18px rgba(24, 144, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.92)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '0 6px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                    : '0 6px 14px rgba(24, 144, 255, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                }}
              >
                <span
                  style={{
                    width: filterDotSize,
                    height: filterDotSize,
                    borderRadius: '50%',
                    background: '#1890ff',
                    boxShadow: '0 0 0 3px rgba(24, 144, 255, 0.16)',
                    opacity: 0.95,
                  }}
                />
                <span>{selectedPeriod}</span>
                <span
                  style={{
                    width: filterTriggerIconSize,
                    height: filterTriggerIconSize,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDarkMode
                      ? 'rgba(24, 144, 255, 0.22)'
                      : 'rgba(24, 144, 255, 0.12)',
                    color: '#1890ff',
                    fontSize: filterIconFontSize,
                  }}
                >
                  <FilterOutlined />
                </span>
              </button>
              {/* Custom Filter Menu */}
              <div
                style={{
                  position: shouldFloatFilterMenu ? 'fixed' : 'absolute',
                  right: shouldFloatFilterMenu ? 'auto' : 0,
                  top: shouldFloatFilterMenu
                    ? 'auto'
                    : isExpanded
                      ? '44px'
                      : '52px',
                  background: isDarkMode
                    ? 'linear-gradient(160deg, rgba(20, 28, 38, 0.76) 0%, rgba(14, 20, 30, 0.62) 100%)'
                    : 'linear-gradient(160deg, rgba(255, 255, 255, 0.78) 0%, rgba(241, 248, 255, 0.64) 100%)',
                  borderRadius: isExpanded ? '14px' : '18px',
                  boxShadow: isDarkMode
                    ? '0 18px 42px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 rgba(255, 255, 255, 0.04)'
                    : '0 16px 38px rgba(44, 88, 148, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.94), inset 0 -1px 0 rgba(255, 255, 255, 0.42)',
                  zIndex: 1000,
                  minWidth: isExpanded ? '184px' : '218px',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.16)'
                    : '1px solid rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(22px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                  padding: isExpanded ? '8px' : '10px',
                  display: 'grid',
                  gap: isExpanded ? '6px' : '8px',
                  transformOrigin: 'top right',
                  ...(shouldFloatFilterMenu && filterMenuPopupStyle
                    ? filterMenuPopupStyle
                    : {}),
                  opacity: showFilterMenu ? 1 : 0,
                  transform: showFilterMenu
                    ? 'translateY(0) scale(1)'
                    : 'translateY(-8px) scale(0.97)',
                  pointerEvents: showFilterMenu ? 'auto' : 'none',
                  visibility: showFilterMenu ? 'visible' : 'hidden',
                  transition: showFilterMenu
                    ? 'opacity 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 0s'
                    : 'opacity 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 220ms',
                  willChange: 'opacity, transform',
                }}
              >
                {['Daily', 'Weekly', 'Monthly'].map(period => (
                  <button
                    type="button"
                    key={period}
                    onClick={() => {
                      setSelectedSliceIndexes([]);
                      setSelectedPeriod(period);
                      setIsDatePickerOpen(false);
                      setShowFilterMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: isExpanded ? '9px 12px' : '12px 16px',
                      fontSize: filterMenuOptionFontSize,
                      fontWeight: selectedPeriod === period ? 700 : 600,
                      color:
                        selectedPeriod === period
                          ? isDarkMode
                            ? '#8fc5ff'
                            : '#1668dc'
                          : isDarkMode
                            ? '#d7dfe8'
                            : '#3a4d63',
                      background:
                        selectedPeriod === period
                          ? isDarkMode
                            ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.24) 0%, rgba(24, 144, 255, 0.12) 100%)'
                            : 'linear-gradient(135deg, rgba(24, 144, 255, 0.16) 0%, rgba(24, 144, 255, 0.08) 100%)'
                          : 'transparent',
                      border:
                        selectedPeriod === period
                          ? isDarkMode
                            ? '1px solid rgba(110, 180, 255, 0.45)'
                            : '1px solid rgba(24, 144, 255, 0.28)'
                          : '1px solid transparent',
                      borderRadius: isExpanded ? '10px' : '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={e => {
                      if (selectedPeriod !== period) {
                        e.currentTarget.style.background = isDarkMode
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(24, 144, 255, 0.06)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedPeriod !== period) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{period}</span>
                    {selectedPeriod === period && (
                      <span
                        style={{
                          width: isExpanded ? '18px' : '20px',
                          height: isExpanded ? '18px' : '20px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isExpanded ? '12px' : '13px',
                          color: '#ffffff',
                          background: '#1890ff',
                          boxShadow: '0 4px 10px rgba(24, 144, 255, 0.35)',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                <div
                  ref={datePickerShellRef}
                  style={{
                    display: 'grid',
                    gap: '8px',
                    marginTop: isExpanded ? '4px' : '6px',
                    padding: isExpanded ? '12px 12px 11px' : '13px 13px 12px',
                    borderTop: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid rgba(24, 144, 255, 0.10)',
                    borderRadius: '22px',
                    background: isDarkMode
                      ? 'linear-gradient(160deg, rgba(15, 22, 31, 0.72) 0%, rgba(24, 31, 42, 0.44) 100%)'
                      : 'linear-gradient(160deg, rgba(255, 255, 255, 0.86) 0%, rgba(246, 249, 255, 0.66) 100%)',
                    boxShadow: isDarkMode
                      ? 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 12px 26px rgba(0, 0, 0, 0.18)'
                      : 'inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 12px 26px rgba(24, 144, 255, 0.08)',
                    backdropFilter: 'blur(16px) saturate(175%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(175%)',
                  }}
                >
                  <div
                    style={{
                      fontSize: isExpanded ? '10px' : '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isDarkMode ? '#9fb4c9' : '#6a7d93',
                    }}
                  >
                    Select date
                  </div>
                  <DatePicker
                    allowClear={false}
                    className="pie-stay-reference-date-picker"
                    popupClassName="pie-stay-reference-date-picker-dropdown"
                    open={showFilterMenu && isDatePickerOpen}
                    placement="bottomLeft"
                    popupStyle={datePickerPopupStyle}
                    inputReadOnly
                    value={extendedDayjs(selectedDate)}
                    format="MMM D, YYYY"
                    disabledDate={(current: Dayjs) =>
                      current ? current.isAfter(extendedDayjs(), 'day') : false
                    }
                    getPopupContainer={() => document.body}
                    onOpenChange={nextOpen => {
                      setIsDatePickerOpen(nextOpen);
                    }}
                    panelRender={originPanel => (
                      <div className="pie-stay-reference-date-picker-popup-shell">
                        <div className="pie-stay-reference-date-picker-popup-header">
                          <span>Select date</span>
                          <button
                            type="button"
                            aria-label="Close calendar"
                            className="pie-stay-reference-date-picker-popup-close"
                            onMouseDown={e => e.preventDefault()}
                            onClick={closeDatePicker}
                          >
                            <X size={12} strokeWidth={2.6} />
                          </button>
                        </div>
                        {originPanel}
                      </div>
                    )}
                    onChange={date => {
                      if (!date) {
                        return;
                      }
                      setSelectedSliceIndexes([]);
                      setSelectedPeriod('Daily');
                      setSelectedDate(date.format('YYYY-MM-DD'));
                      setIsDatePickerOpen(false);
                      setShowFilterMenu(false);
                    }}
                    placeholder="Pick a day"
                    style={{
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: totalPatientsMarginTop,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: totalPatientsFontSize,
                  color: isDarkMode ? '#a0a0a0' : '#888',
                  fontWeight: 500,
                  transition: 'color 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Total Patients Counted:
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: totalPatientsValueFontSize,
                    color: '#1890ff',
                  }}
                >
                  {totalPatientCount}
                </span>
              </div>
            </div>
          </div>

          {/* Most common range */}
          <div
            style={{
              fontSize: mostCommonFontSize,
              color: '#52c41a',
              fontWeight: 700,
              marginBottom: mostCommonMarginBottom,
              padding: mostCommonPadding,
              backgroundColor: isDarkMode
                ? 'rgba(82, 196, 26, 0.15)'
                : '#f6ffed',
              borderRadius: '6px',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'background-color 0.3s ease',
            }}
          >
            {mostCommonRange
              ? `Most patients ${
                  selectedPeriod === 'Daily'
                    ? isSelectedDateToday
                      ? 'today'
                      : `on ${selectedDateLabel}`
                    : selectedPeriod === 'Weekly'
                      ? `this week starting ${selectedDateLabel}`
                      : `this month anchored on ${selectedDateLabel}`
                } stayed ${formatStayRange(mostCommonRange)}`
              : 'No data yet'}
          </div>

          {/* Progress Bar with Target */}
          {animatedPercent !== null && targetPercent !== null && (
            <div
              style={{
                marginTop: progressSectionMarginTop,
                marginBottom: progressSectionMarginBottom,
                width: '100%',
              }}
            >
              {/* Labels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: progressLabelsMarginBottom,
                  fontSize: progressLabelsFontSize,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: '#1890ff' }}>
                  Actual: {animatedPercent.toFixed(1)}%
                </span>
                <span style={{ color: '#666' }}>
                  Target: {targetPercent.toFixed(1)}%
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  position: 'relative',
                  height: progressBarHeight,
                  borderRadius: '12px',
                  background: '#e0e0e0',
                  overflow: 'hidden',
                }}
              >
                {/* Gradient Fill */}
                <div
                  style={{
                    width: `${Math.min(animatedPercent, 100)}%`,
                    height: '100%',
                    background: `linear-gradient(to right, #f5222d, #faad14, #52c41a)`,
                    borderRadius:
                      animatedPercent >= 100 ? '12px' : '12px 0 0 12px',
                    transition: 'width 0.5s ease, background 0.5s ease',
                  }}
                />

                {/* Target marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(targetPercent, 99.5)}%`,
                    top: 0,
                    bottom: 0,
                    width: isExpanded ? '3px' : '5px',
                    background: '#f5222d',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Shortest & Longest */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: isExpanded ? 'auto' : statsMarginTop,
              paddingTop: isExpanded ? statsMarginTop : 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: statValueFontSize,
                  fontWeight: 700,
                  color: '#1890ff',
                }}
              >
                {formatHours(shortestStay)}
              </div>
              <div
                style={{
                  fontSize: statLabelFontSize,
                  color: isDarkMode ? '#a0a0a0' : '#666',
                  transition: 'color 0.3s ease',
                }}
              >
                Shortest Stay
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: statValueFontSize,
                  fontWeight: 600,
                  color: '#999',
                }}
              >
                {formatHours(longestStay)}
              </div>
              <div
                style={{
                  fontSize: statLabelFontSize,
                  color: isDarkMode ? '#a0a0a0' : '#666',
                  transition: 'color 0.3s ease',
                }}
              >
                Longest Stay
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div
          className={`chart-container pie-stay-chart-container${isExpanded ? ' pie-stay-chart-container--expanded' : ''}`}
          style={{
            flex: isExpanded ? '0 1 auto' : '1 1 0',
            width: isExpanded ? 'clamp(220px, 28vw, 360px)' : '100%',
            maxWidth: '100%',
            height: isExpanded ? 'auto' : '100%',
            minHeight: isExpanded ? '0' : '400px',
            maxHeight: isExpanded ? 'none' : '700px',
            aspectRatio: isExpanded ? '1 / 1' : 'auto',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: isExpanded ? 'center' : 'auto',
            margin: isExpanded ? '0 4px' : '0 10px',
            padding: isExpanded ? '4px' : '10px',
          }}
        >
          {hasData ? (
            <Doughnut
              ref={chartRef}
              key={`pie-${selectedPeriod}-${selectedDate}-${isDarkMode ? 'dark' : 'light'}-${refreshKey ?? 0}`}
              data={chartData}
              options={options}
              plugins={[calloutLabelsPlugin]}
            />
          ) : (
            <div
              aria-label="No data to display"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                textAlign: 'center',
                fontSize: 'clamp(0.95rem, 2.4vw, 1.25rem)',
                fontWeight: 700,
                color: isDarkMode ? '#b0b0b0' : '#999',
              }}
            >
              No patient data available
            </div>
          )}
        </div>

        {/* Right - Legend */}
        <div
          className="pie-stay-legend-wrapper"
          style={{
            flex: '0 0 auto',
            alignSelf: 'flex-start',
            paddingTop: legendWrapperPaddingTop,
          }}
        >
          <div
            className="pie-stay-legend-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: legendGap,
              minWidth: legendMinWidth,
              maxWidth: legendMaxWidth,
              marginTop: legendMarginTop,
              padding: legendPadding,
              backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
              borderRadius: isExpanded ? '12px' : '16px',
              boxShadow: isDarkMode
                ? '0 4px 16px rgba(0,0,0,0.4)'
                : '0 4px 16px rgba(0,0,0,0.08)',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div
              className="pie-stay-legend-title"
              style={{
                fontSize: legendTitleFontSize,
                fontWeight: 700,
                color: isDarkMode ? '#e0e0e0' : '#333',
                marginBottom: legendTitleMarginBottom,
                paddingBottom: legendTitlePaddingBottom,
                borderBottom: isDarkMode
                  ? '2px solid #404040'
                  : '2px solid #f0f0f0',
                textAlign: 'center',
                transition: 'color 0.3s ease, border-color 0.3s ease',
              }}
            >
              Ranges
            </div>

            {ranges.map((label, idx) => {
              const percentage = percentages[idx] ?? 0;
              const isVisible = hasData && percentage > 0;
              const isSelected = selectedSliceIndexes.includes(idx);
              const isHighlighted =
                selectedSliceIndexes.length === 0 || isSelected;
              const isEmptyRange = !isVisible;
              const displayLabel = hasData ? label : '--';
              const mutedBackground = isDarkMode
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(15, 23, 42, 0.03)';
              const mutedBorder = isDarkMode
                ? 'rgba(173, 184, 201, 0.55)'
                : 'rgba(148, 163, 184, 0.55)';
              const mutedText = isDarkMode
                ? 'rgba(201, 209, 220, 0.70)'
                : 'rgba(71, 85, 105, 0.60)';
              const mutedDot = mutedBorder;

              return (
                <div
                  className="pie-stay-legend-row"
                  key={`${legendRevealVersion}-${idx}`}
                  style={{
                    animation:
                      'pie-stay-legend-slide-down 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                    animationDelay: `${idx * 120}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div
                    className="pie-stay-legend-item"
                    onClick={() => {
                      if (isVisible) {
                        setSelectedSliceIndexes(previousIndexes =>
                          previousIndexes.includes(idx)
                            ? previousIndexes.filter(index => index !== idx)
                            : [...previousIndexes, idx],
                        );
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: legendItemPadding,
                      borderRadius: legendItemRadius,
                      backgroundColor: isSelected
                        ? `${colors[idx]}25`
                        : isVisible
                          ? isDarkMode
                            ? `${colors[idx]}15`
                            : `${colors[idx]}08`
                          : mutedBackground,
                      border: isSelected
                        ? `2px solid ${colors[idx]}`
                        : isVisible
                          ? `2px solid ${colors[idx]}30`
                          : `2px dashed ${mutedBorder}`,
                      opacity: isEmptyRange
                        ? 0.78
                        : isHighlighted
                          ? 1
                          : isDarkMode
                            ? 0.22
                            : 0.35,
                      transition: 'all 0.2s ease',
                      cursor: isVisible ? 'pointer' : 'default',
                      transform: isSelected
                        ? 'translateX(4px)'
                        : 'translateX(0)',
                    }}
                    onMouseEnter={e => {
                      if (isVisible) {
                        e.currentTarget.style.backgroundColor = isSelected
                          ? `${colors[idx]}30`
                          : `${colors[idx]}15`;
                        e.currentTarget.style.borderColor = `${colors[idx]}60`;
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }
                    }}
                    onMouseLeave={e => {
                      if (isVisible) {
                        e.currentTarget.style.backgroundColor = isSelected
                          ? `${colors[idx]}25`
                          : isDarkMode
                            ? `${colors[idx]}15`
                            : `${colors[idx]}08`;
                        e.currentTarget.style.borderColor = isSelected
                          ? colors[idx]
                          : `${colors[idx]}30`;
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }
                    }}
                  >
                    {/* Left side - color dot + label */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: legendItemLabelGap,
                        flex: 1,
                      }}
                    >
                      <div
                        className="pie-stay-legend-dot"
                        style={{
                          width: legendDotSize,
                          height: legendDotSize,
                          borderRadius: '50%',
                          backgroundColor: isVisible
                            ? colors[idx]
                            : 'transparent',
                          border: isVisible ? 'none' : `2px solid ${mutedDot}`,
                          boxShadow: isVisible
                            ? `0 0 0 3px ${colors[idx]}20`
                            : 'none',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="pie-stay-legend-label"
                        style={{
                          fontSize: legendLabelFontSize,
                          fontWeight: 600,
                          color: isVisible
                            ? isDarkMode
                              ? '#e0e0e0'
                              : '#333'
                            : mutedText,
                          transition: 'color 0.3s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {displayLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last updated */}
        {}
      </div>

      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
          }}
        >
          <ShimmerLoader type="pie" isDarkMode={isDarkMode} />
        </div>
      )}

      {showInfoModal && !isSlideshowMode && (
        <div
          role="presentation"
          onClick={closeInfoModal}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: infoPanelReady
              ? isDarkMode
                ? 'rgba(6, 10, 16, 0.62)'
                : 'rgba(15, 23, 42, 0.34)'
              : 'rgba(0, 0, 0, 0)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            padding: '8px 8px 14px',
            transition: 'background-color 280ms cubic-bezier(0.2, 0.9, 0.2, 1)',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chart explanation"
            onClick={e => e.stopPropagation()}
            style={{
              width: 'clamp(320px, 90vw, 500px)',
              maxWidth: 'calc(100% - 20px)',
              maxHeight: 'calc(100% - 24px)',
              borderRadius: '16px',
              background: isDarkMode
                ? 'rgba(30, 35, 42, 0.70)'
                : 'rgba(255, 255, 255, 0.70)',
              backdropFilter: 'blur(16px) saturate(170%)',
              WebkitBackdropFilter: 'blur(16px) saturate(170%)',
              border: isDarkMode
                ? '1px solid rgba(255,255,255,0.14)'
                : '1px solid rgba(24,144,255,0.14)',
              boxShadow: isDarkMode
                ? '0 28px 58px rgba(0, 0, 0, 0.56)'
                : '0 24px 52px rgba(24, 144, 255, 0.24)',
              color: isDarkMode ? '#f0f0f0' : '#1f2937',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transformOrigin: 'top right',
              transform: infoPanelReady
                ? 'translateY(0) scale(1)'
                : 'translateY(-10px) scale(0.38)',
              opacity: infoPanelReady ? 1 : 0,
              transition:
                'transform 360ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 280ms cubic-bezier(0.2, 0.9, 0.2, 1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding:
                  'clamp(12px, 3vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2.5vw, 14px)',
                borderBottom: isDarkMode
                  ? '1px solid rgba(255,255,255,0.09)'
                  : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 2vw, 10px)',
                }}
              >
                <div
                  style={{
                    width: 'clamp(28px, 6vw, 32px)',
                    height: 'clamp(28px, 6vw, 32px)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    color: '#fff',
                  }}
                >
                  <Info size={18} />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)',
                    letterSpacing: '0.01em',
                  }}
                >
                  How To Read This Chart
                </div>
              </div>
              <button
                type="button"
                onClick={closeInfoModal}
                aria-label="Close explanation"
                style={{
                  width: 'clamp(28px, 6vw, 32px)',
                  height: 'clamp(28px, 6vw, 32px)',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
                  color: isDarkMode ? '#d9d9d9' : '#595959',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: 'clamp(12px, 2.8vw, 16px)',
                display: 'grid',
                gap: 'clamp(10px, 2.5vw, 14px)',
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div style={{ display: 'grid', gap: '4px' }}>
                <div
                  style={{
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)',
                    fontWeight: 700,
                    color: '#1890ff',
                  }}
                >
                  Pie slices (distribution)
                </div>
                <div
                  style={{
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    lineHeight: 1.5,
                  }}
                >
                  Each slice shows what percentage of patients fall into a
                  stay-time range.
                </div>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div
                  style={{
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)',
                    fontWeight: 700,
                    color: '#1890ff',
                  }}
                >
                  Ranges list (right side)
                </div>
                <div
                  style={{
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    lineHeight: 1.5,
                  }}
                >
                  Click a range in the right panel to focus on that one range in
                  the pie chart.
                </div>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div
                  style={{
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)',
                    fontWeight: 700,
                    color: '#1890ff',
                  }}
                >
                  Time filter
                </div>
                <div
                  style={{
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    lineHeight: 1.5,
                  }}
                >
                  Use the filter menu to switch between daily, weekly, and
                  monthly views, and pick a date to anchor the data.
                </div>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div
                  style={{
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)',
                    fontWeight: 700,
                    color: '#1890ff',
                  }}
                >
                  Progress bar
                </div>
                <div
                  style={{
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    lineHeight: 1.5,
                  }}
                >
                  Shows how close current performance is to the target for
                  shorter stays.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
