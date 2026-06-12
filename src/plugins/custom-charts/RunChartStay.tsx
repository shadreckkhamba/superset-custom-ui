import React, { useEffect, useLayoutEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { Calendar, ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import type { Dayjs } from "dayjs";
import { DatePicker } from "src/components/DatePicker";
import { extendedDayjs } from "src/utils/dates";
import { ShimmerLoader } from './ShimmerLoader';
import { ENDPOINTS } from '../../config/endpoints';
import './chart-fixes.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const getMondayForDate = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
};

const getWeekOffsetForDate = (date: Date) => {
  const selectedMonday = getMondayForDate(date);
  const currentMonday = getMondayForDate(new Date());
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((selectedMonday.getTime() - currentMonday.getTime()) / (7 * dayMs));
};

const getWeekStartForOffset = (offset: number) => {
  const monday = getMondayForDate(new Date());
  monday.setDate(monday.getDate() + offset * 7);
  return monday;
};

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

const createDataLabelsPlugin = (isDarkMode: boolean, compact: boolean) => ({
  id: 'customDataLabels',
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;
    const lineDatasetIndex = chart.data.datasets.findIndex(
      (ds: any, idx: number) => ds.type === 'line' && !chart.getDatasetMeta(idx).hidden
    );
    const lineMeta = lineDatasetIndex >= 0 ? chart.getDatasetMeta(lineDatasetIndex) : null;
    const lineLabelBg = isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const lineLabelStroke = isDarkMode ? 'rgba(24, 144, 255, 0.48)' : 'rgba(24, 144, 255, 0.3)';
    const barLabelStroke = isDarkMode ? 'rgba(26, 26, 26, 0.92)' : 'rgba(255, 255, 255, 0.92)';
    const lineFontSize = compact ? 14 : 20;
    const barFontSize = compact ? 16 : 24;
    const linePadding = compact ? 4 : 6;
    const lineBgHeight = compact ? 18 : 24;
    const lineBgOffset = compact ? 26 : 34;
    const lineTextOffset = compact ? 9 : 14;

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.hidden) {
        meta.data.forEach((element: any, index: number) => {
          const renderedValue = dataset.data[index];
          const actualValue = dataset.actualData?.[index] ?? renderedValue;
          if (renderedValue === null || actualValue === null || actualValue === 0) return;

          ctx.save();

          const isLine = dataset.type === 'line';
          const isBar = dataset.type === 'bar';

          if (isLine) {
            const value = renderedValue;
            const h = Math.floor(value);
            const m = Math.round((value - h) * 60);
            const label = `${h}h ${m}m`;

            ctx.font = `bold ${lineFontSize}px sans-serif`;
            ctx.fillStyle = '#1890ff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            const textWidth = ctx.measureText(label).width;
            const bgX = element.x - textWidth / 2 - linePadding;
            const bgY = element.y - lineBgOffset;
            const bgWidth = textWidth + linePadding * 2;
            const bgHeight = lineBgHeight;

            ctx.fillStyle = lineLabelBg;
            ctx.strokeStyle = lineLabelStroke;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#1890ff';
            ctx.fillText(label, element.x, element.y - lineTextOffset);
          } else if (isBar) {
            const label = String(actualValue);
            const linePoint = lineMeta?.data?.[index];
            const defaultLabelY = element.y - 6;
            let labelY = defaultLabelY;

            if (linePoint && typeof linePoint.y === 'number' && Math.abs(defaultLabelY - linePoint.y) < 24) {
              labelY = linePoint.y - 18;
            }

            const minTopY = chart.chartArea.top + 20;
            if (labelY < minTopY) {
              labelY = Math.min(element.y + 24, chart.chartArea.bottom - 8);
            }

            ctx.font = `bold ${barFontSize}px sans-serif`;
            ctx.fillStyle = '#52c487';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.lineWidth = compact ? 3 : 4;
            ctx.strokeStyle = barLabelStroke;
            ctx.strokeText(label, element.x, labelY);
            ctx.fillText(label, element.x, labelY);
          }

          ctx.restore();
        });
      }
    });
  },
});

interface StayEntry {
  arrival_time: string;
  departure_time: string;
  difference_hours: number;
  total_patients?: number;
  percent_change?: string;
}

interface RunChartStayProps {
  refreshKey?: number;
  resetKey?: number;
  isDarkMode?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
}

const createNoDataPlugin = (isDarkMode: boolean) => ({
  id: "noDataPlugin",
  afterDraw: (chart: any) => {
    const { ctx, data } = chart;
    const hasData = data.datasets.some(
      (ds: any) => ds.data && ds.data.some((v: any) => v > 0)
    );
    if (hasData) return;

    const { width, height } = chart;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isDarkMode ? "#b0b0b0" : "#999";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("No patient data available", width / 2, height / 2);
    ctx.restore();
  },
});

export default function RunChartStay({
  refreshKey,
  resetKey,
  isDarkMode = false,
  compact = false,
  autoRefresh = true,
}: RunChartStayProps): JSX.Element {
  const [entries, setEntries] = useState<StayEntry[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekOffsetRef = useRef(0);
  const setWeekOffsetSynced = useCallback((val: number | ((prev: number) => number)) => {
    setWeekOffset(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      weekOffsetRef.current = next;
      return next;
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  const hasLoadedOnceRef = useRef(false);
  const [chartContainerWidth, setChartContainerWidth] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoPanelReady, setInfoPanelReady] = useState(false);
  const chartRef = useRef<ChartJS<"bar" | "line"> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const nextWeekBtnRef = useRef<HTMLButtonElement | null>(null);
  const infoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAnimatedOnViewRef = useRef(false);

  const [datePickerPopupStyle, setDatePickerPopupStyle] = useState<React.CSSProperties>({});
  const [isDatePickerSidecar, setIsDatePickerSidecar] = useState(false);
  const datePickerShellRef = useRef<HTMLDivElement | null>(null);
  const datePickerToggleMouseDownRef = useRef(false);

  useEffect(() => {
    if (isDatePickerOpen) {
      return undefined;
    }

    const sidecarResetTimer = window.setTimeout(() => {
      setIsDatePickerSidecar(false);
    }, 220);
    return () => window.clearTimeout(sidecarResetTimer);
  }, [isDatePickerOpen]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !isDatePickerOpen) return undefined;

    const updateDatePickerPosition = () => {
      const shell = datePickerShellRef.current;
      if (!shell) return;
      const rect = shell.getBoundingClientRect();
      const isCompactViewport = window.innerWidth < 1100;
      const isTinyViewport = window.innerWidth < 480;
      const gap = 12;
      const availableViewportWidth = window.innerWidth - 24;
      const sidecarWidth = Math.min(compact ? 280 : 300, availableViewportWidth);
      const canUseSidecar =
        !isTinyViewport &&
        rect.right + gap + sidecarWidth <= window.innerWidth - 12;
      const popupWidth = canUseSidecar
        ? sidecarWidth
        : Math.min(isCompactViewport ? 256 : 300, availableViewportWidth);
      const maxLeft = window.innerWidth - popupWidth - 12;
      const preferredLeft = canUseSidecar
        ? rect.right + gap
        : isCompactViewport
          ? rect.left
          : rect.right + gap;
      const left = Math.max(12, Math.min(preferredLeft, maxLeft));
      const popupHeight = canUseSidecar ? 386 : isCompactViewport ? 292 : 360;
      const preferredTop = canUseSidecar
        ? rect.top
        : isCompactViewport
          ? rect.bottom + gap
          : rect.top;
      const maxTop = window.innerHeight - popupHeight - 12;
      const top = Math.max(12, Math.min(preferredTop, maxTop));

      setIsDatePickerSidecar(canUseSidecar);
      setDatePickerPopupStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${popupWidth}px`,
        height: `${popupHeight}px`,
        zIndex: 2000,
      });
    };

    updateDatePickerPosition();
    window.addEventListener('resize', updateDatePickerPosition);
    return () => window.removeEventListener('resize', updateDatePickerPosition);
  }, [isDatePickerOpen, compact]);

  const noDataPlugin = useMemo(() => createNoDataPlugin(isDarkMode), [isDarkMode]);
  const dataLabelsPlugin = useMemo(() => createDataLabelsPlugin(isDarkMode, compact), [isDarkMode, compact]);
  const chartSurfaceBg = isDarkMode ? "#1a1a1a" : "#ffffff";
  const chartSurfaceBorder = isDarkMode ? "1px solid #404040" : "1px solid #e5e7eb";
  const chartSurfaceShadow = isDarkMode
    ? "0 8px 20px rgba(0,0,0,0.35)"
    : "0 8px 20px rgba(15, 23, 42, 0.08)";
  const controlButtonSize = compact ? "clamp(38px, 2.8vw, 44px)" : "clamp(56px, 10vw, 80px)";
  const controlIconSize = compact ? 20 : 32; // Slightly smaller icons for better proportion
  const weekBannerFontSize = compact ? "clamp(15px, 1.5vw, 18px)" : "clamp(20px, 5vw, 24px)";
  const weekBannerPadding = compact ? "8px 14px" : "14px 24px";
  const navHorizontalPadding = compact ? "6px" : "clamp(12px, 3vw, 20px) clamp(12px, 3vw, 20px)";
  const navBottomGap = compact ? "4px" : "8px";
  const chartPadding = "0";
  const wrapperMaxHeight = compact ? "none" : "680px";
  const chartAreaMaxHeight = compact ? "none" : "560px";
  const infoButtonSize = compact ? "34px" : "52px";
  const infoIconSize = compact ? 20 : 30;
  const animationTrigger = useMemo(
    () => `${weekOffset}-${refreshKey ?? 0}-${resetKey ?? 0}`,
    [weekOffset, refreshKey, resetKey],
  );
  const useCompactDesktopAxisSizing =
    compact &&
    (chartContainerWidth >= 520 ||
      (typeof window !== "undefined" && window.innerWidth >= 1100));
  const xAxisTitleFontSize = compact ? (useCompactDesktopAxisSizing ? 18 : 14) : 32;
  const xAxisTickFontSize = compact ? (useCompactDesktopAxisSizing ? 14 : 11) : 20;
  const yAxisTitleFontSize = compact ? (useCompactDesktopAxisSizing ? 22 : 16) : 38;
  const yAxisTickFontSize = compact ? (useCompactDesktopAxisSizing ? 13 : 10) : 20;
  const y1AxisTitleFontSize = compact ? (useCompactDesktopAxisSizing ? 22 : 16) : 42;
  const y1AxisTickFontSize = compact ? (useCompactDesktopAxisSizing ? 13 : 10) : 20;

  const animateBarsIn = useCallback(() => {
    const chart = chartRef.current;
    const container = chartContainerRef.current;
    
    // Ensure both chart and container exist and are connected to DOM
    if (!chart || !container || !chart.canvas || !chart.canvas.isConnected) return;
    
    // Check if the canvas parent is still in the DOM
    if (!chart.canvas.parentNode || !document.contains(chart.canvas)) return;
    try {
      chart.stop();
      chart.reset();
      chart.update();
    } catch (error) {
      console.warn('Animation failed, chart may be unmounted:', error);
    }
  }, []);

  const runChartResize = useCallback(() => {
    // Don't resize while shimmer is showing — causes canvas flash at high zoom levels
    if (loadingRef.current) return;

    const chart = chartRef.current;
    const container = chartContainerRef.current;
    
    if (!chart || !container || !chart.canvas || !chart.canvas.isConnected) return;
    if (!chart.canvas.parentNode || !document.contains(chart.canvas)) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 50 || height < 50) return;

    try {
      chart.resize();
    } catch (error) {
      console.warn('Chart resize failed, chart may be unmounted:', error);
    }
  }, []);

  const getWeekDateRange = useCallback((offset: number) => {
    const startDate = getWeekStartForOffset(offset);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      startDate: toDateKey(startDate),
      endDate: toDateKey(endDate),
    };
  }, []);

  const fetchData = useCallback(async (offset: number, showShimmer: boolean) => {
    if (showShimmer) {
      loadingRef.current = true;
      setLoading(true);
    }
    const startTime = Date.now();

    try {
      const { startDate, endDate } = getWeekDateRange(offset);
      console.log("📅 Requesting date range:", { startDate, endDate, weekOffset: offset });
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      const resp = await fetch(`${ENDPOINTS.STAY_TIMES_TREND}?${params.toString()}`);
      const data = await resp.json();
      const newEntries = (data.entries || []).map((e: any) => ({
        arrival_time: e.day,
        departure_time: e.day,
        difference_hours: parseFloat(e.avg_stay_hours) || 0,
        total_patients: e.total_patients || 0,
      }));
      setEntries(newEntries);
      console.log("📊 Fetched entries:", newEntries);
    } catch (err) {
      console.error("Error fetching stay data", err);
    } finally {
      if (showShimmer) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
          loadingRef.current = false;
          hasLoadedOnceRef.current = true;
          setLoading(false);
        }, remaining);
      } else {
        hasLoadedOnceRef.current = true;
      }
    }
  }, [getWeekDateRange]);

  // Handle external refresh requests
  useEffect(() => {
    if ((refreshKey ?? 0) > 0) {
      fetchData(weekOffsetRef.current, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Reset to current week on explicit parent trigger
  useEffect(() => {
    if ((resetKey ?? 0) > 0) {
      if (weekOffset === 0) {
        setSelectedDate(toDateKey(new Date()));
        fetchData(0, false);
      } else {
        setSelectedDate(toDateKey(new Date()));
        setWeekOffsetSynced(0); // week-change effect will fetch
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Fetch on week change (shows shimmer), silent auto-refresh every 60s
  useEffect(() => {
    hasLoadedOnceRef.current = false;
    loadingRef.current = true;
    setLoading(true);
    fetchData(weekOffset, true);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  // Re-measure chart after loading completes. Only resize on window resize events,
  // not immediately after load (that causes the canvas flash at high zoom levels).
  useEffect(() => {
    if (loading) return undefined;

    const resizeChart = () => { runChartResize(); };
    window.addEventListener("resize", resizeChart);
    return () => {
      window.removeEventListener("resize", resizeChart);
    };
  }, [loading, runChartResize]);

  // Fallback animation trigger - ensures animation happens even if visibility detection fails
  useEffect(() => {
    if (loading || hasAnimatedOnViewRef.current) return;
    
    const fallbackTimer = setTimeout(() => {
      // Check if component is still mounted and chart is valid
      const chart = chartRef.current;
      const container = chartContainerRef.current;
      
      if (!hasAnimatedOnViewRef.current && 
          chart && 
          container && 
          chart.canvas && 
          chart.canvas.isConnected &&
          document.contains(chart.canvas)) {
        console.log('🎬 Fallback animation trigger for RunChartStay');
        animateBarsIn();
        hasAnimatedOnViewRef.current = true;
      }
    }, 1500); // Trigger after 1.5s if no other animation has occurred
    
    return () => clearTimeout(fallbackTimer);
  }, [loading, animateBarsIn]);

  useEffect(() => {
    hasAnimatedOnViewRef.current = false;
  }, [loading, weekOffset]);

  useEffect(() => {
    if (loading) return;

    const el = chartContainerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementHeight = rect.height;
    
    // More flexible visibility check for smaller screens
    const isVisible = rect.top < viewportHeight && rect.bottom > 0;
    const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const visibilityRatio = visibleHeight / elementHeight;
    
    // Trigger animation if element is reasonably visible (at least 20% or 150px)
    const minVisiblePixels = 150;
    const minVisibilityRatio = 0.2;
    const shouldAnimate = isVisible && (
      visibilityRatio >= minVisibilityRatio || 
      visibleHeight >= minVisiblePixels
    );
    
    if (!shouldAnimate) return;

    animateBarsIn();
    hasAnimatedOnViewRef.current = true;
  }, [loading, animationTrigger, animateBarsIn]);

  useEffect(() => {
    if (loading) return undefined;

    const el = chartContainerRef.current;
    if (!el) return undefined;

    const rect = el.getBoundingClientRect();
    const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (isFullyVisible) {
      hasAnimatedOnViewRef.current = true;
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasAnimatedOnViewRef.current) return;
        
        // More flexible threshold for smaller screens
        const elementHeight = entry.boundingClientRect.height;
        const minThreshold = Math.min(0.4, Math.max(0.1, 200 / elementHeight));
        
        if ((entry.intersectionRatio ?? 0) < minThreshold) return;
        animateBarsIn();
        hasAnimatedOnViewRef.current = true;
        observer.disconnect();
      },
      { threshold: [0, 0.1, 0.25, 0.4, 0.75] },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [loading, animateBarsIn]);

  // Force immediate Chart.js repaint when theme toggles.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chart.canvas || !chart.canvas.isConnected) return;
    
    // Check if the canvas parent is still in the DOM
    if (!chart.canvas.parentNode || !document.contains(chart.canvas)) return;

    try {
      const parent = chart.canvas?.parentNode as HTMLElement | null;
      const tooltipEl = parent?.querySelector(".chartjs-tooltip");
      if (tooltipEl) {
        tooltipEl.remove();
      }

      chart.update("active");
      chart.resize();
    } catch (error) {
      console.warn('Theme update failed, chart may be unmounted:', error);
    }
  }, [isDarkMode]);

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

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return undefined;

    const syncChartContainerWidth = () => {
      setChartContainerWidth(el.clientWidth);
    };

    syncChartContainerWidth();

    const resizeObserver = new ResizeObserver(() => {
      syncChartContainerWidth();
      // Debounce resize calls to avoid subpixel flicker at non-100% zoom levels
      if ((resizeObserver as any)._debounceTimer) {
        clearTimeout((resizeObserver as any)._debounceTimer);
      }
      (resizeObserver as any)._debounceTimer = setTimeout(() => {
        runChartResize();
      }, 60);
    });

    resizeObserver.observe(el);

    const parentContainer = el.closest('.patient-stay-overlay');
    if (parentContainer) {
      resizeObserver.observe(parentContainer);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [runChartResize]);

  useEffect(() => {
    const handleMenuToggle = () => {
      const chart = chartRef.current;
      if (!chart || !chart.canvas || !chart.canvas.isConnected) return;
      
      // Check if the canvas parent is still in the DOM
      if (!chart.canvas.parentNode || !document.contains(chart.canvas)) return;
      
      const resize = () => {
        if (!chart.canvas || !chart.canvas.isConnected) return;
        try {
          chart.resize();
          chart.update("active");
        } catch (error) {
          console.warn('Menu toggle resize failed, chart may be unmounted:', error);
        }
      };
      requestAnimationFrame(resize);
      window.setTimeout(resize, 80);
      window.setTimeout(resize, 200);
    };

    window.addEventListener('dashboard-header-menu-toggle', handleMenuToggle);
    return () => {
      window.removeEventListener('dashboard-header-menu-toggle', handleMenuToggle);
    };
  }, []);

  // Cleanup effect to ensure proper chart destruction
  useEffect(() => {
    return () => {
      const chart = chartRef.current;
      if (chart) {
        try {
          chart.destroy();
        } catch (error) {
          console.warn('Chart cleanup failed:', error);
        }
        chartRef.current = null;
      }
    };
  }, []);

  // Compute weekly averages
  const dailyAverages = useMemo(() => {
    if (!entries.length) return [];

    const today = new Date();
    const curDay = today.getDay();
    const diff = curDay === 0 ? -6 : 1 - curDay; 
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setHours(0, 0, 0, 0);
    mondayOfWeek.setDate(today.getDate() + diff + weekOffset * 7);

    const toDateKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const entriesByDate = new Map<string, StayEntry[]>();
    entries.forEach((entry) => {
      const bucket = entriesByDate.get(entry.arrival_time) || [];
      bucket.push(entry);
      entriesByDate.set(entry.arrival_time, bucket);
    });

    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(mondayOfWeek);
      dayDate.setDate(mondayOfWeek.getDate() + i);

      const dateStr = toDateKey(dayDate); // "YYYY-MM-DD"

      // Pull entries by exact date string
      const dayEntries = entriesByDate.get(dateStr) || [];

      const avg =
        dayEntries.length > 0
          ? dayEntries.reduce((sum, e) => sum + e.difference_hours, 0) / dayEntries.length
          : 0;

      const totalPatients =
        dayEntries.length > 0
          ? dayEntries.reduce((sum, e) => sum + (e.total_patients || 0), 0)
          : 0;

      // Calculate percent_change based on the previous day in this displayed week
      let percentChange = 0;
      if (i > 0) {
        const prevDate = new Date(mondayOfWeek);
        prevDate.setDate(mondayOfWeek.getDate() + i - 1);
        const prevDateStr = toDateKey(prevDate);
        const prevDayEntries = entriesByDate.get(prevDateStr) || [];
        const prevAvg =
          prevDayEntries.length > 0
            ? prevDayEntries.reduce((sum, e) => sum + e.difference_hours, 0) / prevDayEntries.length
            : 0;
        if (prevAvg > 0) {
          percentChange = ((avg - prevAvg) / prevAvg) * 100;
        }
      }

      return {
        dayIndex: i,
        avg: parseFloat(avg.toFixed(2)),
        count: dayEntries.length,
        total_patients: totalPatients,
        dateStr,
        percent_change: parseFloat(percentChange.toFixed(2)),
      };
    });
  }, [entries, weekOffset]);

  // Week Range text
  const weekRange = useMemo(() => {
    const monday = getWeekStartForOffset(weekOffset);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    return `${formatDate(monday)} - ${formatDate(saturday)}`;
  }, [weekOffset]);

  // Prevent future week navigation
  const isNextWeekFuture = useMemo(() => {
    const mondayNext = getWeekStartForOffset(weekOffset + 1);
    return mondayNext > new Date();
  }, [weekOffset]);

  const maxDuration = 5;
  const lastVisibleDayIndex = useMemo(() => {
    if (weekOffset !== 0) {
      return 6;
    }

    const today = new Date();
    return today.getDay() === 0 ? 6 : today.getDay() - 1;
  }, [weekOffset]);

  const handleWeekDateChange = useCallback((date: Dayjs | null) => {
    if (!date) {
      return;
    }

    const nextDateKey = date.format("YYYY-MM-DD");
    const pickedDate = new Date(`${nextDateKey}T00:00:00`);

    setSelectedDate(nextDateKey);
    setWeekOffsetSynced(getWeekOffsetForDate(pickedDate));
    setIsDatePickerOpen(false);
  }, [setWeekOffsetSynced]);

  const goToPreviousWeek = useCallback(() => {
    setWeekOffsetSynced(w => {
      const nextOffset = w - 1;
      setSelectedDate(toDateKey(getWeekStartForOffset(nextOffset)));
      return nextOffset;
    });
  }, [setWeekOffsetSynced]);

  const goToNextWeek = useCallback(() => {
    if (isNextWeekFuture) {
      return;
    }

    setWeekOffsetSynced(w => {
      const nextOffset = w + 1;
      setSelectedDate(toDateKey(getWeekStartForOffset(nextOffset)));
      return nextOffset;
    });
  }, [isNextWeekFuture]);

  const observedMaxDuration = useMemo(() => {
    const visibleDurations = dailyAverages
      .filter(day => day.dayIndex <= lastVisibleDayIndex)
      .map(day => Math.min(day.avg ?? 0, maxDuration));

    return Math.max(...visibleDurations, 0);
  }, [dailyAverages, lastVisibleDayIndex, maxDuration]);

  const { maxPatients, patientTickStep, observedMaxPatients } = useMemo(() => {
    const visiblePatientCounts = dailyAverages
      .filter(day => day.dayIndex <= lastVisibleDayIndex)
      .map(day => day.total_patients ?? 0);
    const observedMaxPatients = Math.max(...visiblePatientCounts, 0);

    // Keep the right axis aligned to the left axis (0..5 => 6 grid lines):
    // Choose a tick step so that maxPatients = step * 5, with a minimum of 150.
    const targetMax = Math.max(150, observedMaxPatients);
    const stepCandidates = [30, 40, 50, 60, 75, 80, 100, 125, 150, 200, 250, 300, 400, 500, 750, 1000];
    const step =
      stepCandidates.find(s => s * 5 >= targetMax) ??
      Math.ceil(Math.ceil(targetMax / 5) / 50) * 50;

    return { maxPatients: step * 5, patientTickStep: step, observedMaxPatients };
  }, [dailyAverages, lastVisibleDayIndex]);

  // ---- Chart Data ----
  const data = useMemo(() => {
    // Compute Monday of the displayed week (to match API fetch range + week header)
    const today = new Date();
    const curDay = today.getDay();
    const diff = curDay === 0 ? -6 : 1 - curDay;
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setDate(today.getDate() + diff + weekOffset * 7);

    // Build labels Monday -> Sunday
    const weekLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mondayOfWeek);
      d.setDate(mondayOfWeek.getDate() + i);
      const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
      const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "long" });
      return [weekday, dateStr];
    });

    // Build values
    const avgStayValues = dailyAverages.map((d) => {
      if (d.dayIndex > lastVisibleDayIndex) return null;
      const raw = d.avg ?? 0;
      return Math.min(raw, maxDuration);
    });
    const actualPatientCounts = dailyAverages.map((d) =>
      d.dayIndex <= lastVisibleDayIndex ? d.total_patients ?? 0 : null,
    );
    // Keep the right axis aligned with the left-side grid while still showing actual counts in labels/tooltips.
    const patientCounts = actualPatientCounts.map((value) =>
      value === null ? null : Math.min(value, maxPatients),
    );
    
    // Create gradient for area chart
    const createGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, 'rgba(24, 144, 255, 0.05)');
      gradient.addColorStop(0.5, 'rgba(24, 144, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(24, 144, 255, 0.3)');
      return gradient;
    };

    return {
      labels: weekLabels,
      datasets: [
        // Bar chart for patient count (background layer)
        {
          type: 'bar' as const,
          label: "Total Patients",
          font: { size: 28, weight: 700 },
          data: patientCounts,
          actualData: actualPatientCounts,
          backgroundColor: 'rgba(82, 196, 135, 0.25)',
          borderColor: 'rgba(82, 196, 135, 0.8)',
          borderWidth: 2,
          borderRadius: 8,
          yAxisID: 'y1',
          order: 2,
        },
        // Area chart for average stay
        {
          type: 'line' as const,
          label: "Average Stay Duration (hrs)",
          font: { size: 28, weight: 700 },
          data: avgStayValues,
          borderColor: '#1890ff',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(24, 144, 255, 0.1)';
            return createGradient(ctx, chartArea);
          },
          pointRadius: compact ? 8 : 12,
          pointHoverRadius: compact ? 10 : 14,
          pointBackgroundColor: '#1890ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: compact ? 3 : 4,
          pointHoverBorderWidth: compact ? 4 : 5,
          fill: true,
          tension: 0.4,
          borderWidth: compact ? 3 : 4,
          yAxisID: 'y',
          order: 1,
        },
      ],
    };
  }, [dailyAverages, lastVisibleDayIndex, weekOffset, maxDuration, maxPatients]);
  
  // Helper function to convert time format
  function formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }

  // Background color plugin - must run first to draw background
  const backgroundPlugin = useMemo(() => ({
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart: any) => {
      const { ctx } = chart;
      if (!ctx) return;
      
      ctx.save();
      ctx.fillStyle = chartSurfaceBg;
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  }), [chartSurfaceBg]);

  const axisNeutralTickColor = isDarkMode ? "#e0e0e0" : "#262626";

  const options: ChartOptions<"bar" | "line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 0,
      devicePixelRatio: 1,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      layout: {
        padding: compact
          ? { top: 16, bottom: 0, left: 8, right: 8 }
          : { top: 60, bottom: 4, left: 20, right: 20 },
      },
      animation: {
        duration: 1200,
        easing: "easeInOutQuart",
      },
      elements: {
        point: {
          radius: compact ? 6 : 10,
          hoverRadius: compact ? 8 : 14,
          pointStyle: "circle",
        },
        line: { 
          borderWidth: compact ? 3 : 4, 
          tension: 0.4,
        },
      },
      scales: {
        x: {
          type: "category",
          title: {
            display: true,
            text: "Week Days",
            font: { size: xAxisTitleFontSize, weight: 700 },
            color: "#297acb",
            padding: { top: 8, bottom: 2 },
          },
          ticks: { 
            color: isDarkMode ? "#e0e0e0" : "#262626", 
            font: { size: xAxisTickFontSize, weight: 700 },
            padding: compact ? 8 : 10,
            autoSkip: compact,
          },
          grid: {
            display: false,
            drawBorder: true,
            color: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            lineWidth: 2,
          },
        },
        y: {
          type: "linear",
          position: 'left',
          min: 0,
          max: maxDuration,
          title: {
            display: true,
            text: "Average Stay (hours)",
            font: { size: yAxisTitleFontSize, weight: 700 },
            color: "#1890ff",
            padding: { top: 0, bottom: compact ? 8 : 10 },
          },
          ticks: {
            color: (context: any) =>
              Number(context.tick?.value ?? 0) <= observedMaxDuration
                ? "#1890ff"
                : axisNeutralTickColor,
            font: { size: yAxisTickFontSize, weight: 600 },
            stepSize: 1,
            precision: 0,
            autoSkip: false,
            padding: compact ? 10 : 15,
          },
          grid: {
            color: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
            lineWidth: 1,
            drawTicks: false,
          },
          border: { display: false },
        },
        y1: {
          type: "linear",
          position: 'right',
          min: 0,
          max: maxPatients,
          title: {
            display: true,
            text: "Total Patients",
            font: { size: y1AxisTitleFontSize, weight: 700 },
            color: "#52c487",
            padding: { top: 0, bottom: compact ? 8 : 10 },
          },
          ticks: {
            color: (context: any) =>
              Number(context.tick?.value ?? 0) <= observedMaxPatients
                ? "#52c487"
                : axisNeutralTickColor,
            font: { size: y1AxisTickFontSize, weight: 600 },
            stepSize: patientTickStep,
            autoSkip: false,
            padding: compact ? 10 : 15,
          },
          grid: {
            display: false,
          },
          border: { display: false },
        },
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          align: 'center',
          onClick: (e: any, legendItem: any, legend: any) => {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            if (ci.isDatasetVisible(index)) {
              ci.hide(index);
              legendItem.hidden = true;
            } else {
              ci.show(index);
              legendItem.hidden = false;
            }
          },
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: compact ? 10 : 20,
            font: { size: compact ? 12 : 24, weight: 700 },
            color: isDarkMode ? '#e0e0e0' : '#262626',
            boxHeight: compact ? 12 : 12,
            boxWidth: compact ? 12 : 12,
          },
        },
        tooltip: {
          enabled: false, // fully disable Chart.js native rendering
          external: (context) => {
            const { tooltip, chart } = context;
            const parent = chart.canvas.parentNode as HTMLElement | null;
            if (!tooltip || !parent) return;

            if (getComputedStyle(parent).position === "static") {
              parent.style.position = "relative";
            }

            let tooltipEl = parent.querySelector(".chartjs-tooltip") as HTMLElement | null;
            if (!tooltipEl) {
              tooltipEl = document.createElement("div");
              tooltipEl.classList.add("chartjs-tooltip");
              tooltipEl.style.position = "absolute";
              tooltipEl.style.pointerEvents = "none";
              tooltipEl.style.zIndex = "9999";
              tooltipEl.style.transition = "opacity 0.2s ease, left 0.15s ease-out, top 0.15s ease-out";
              tooltipEl.style.willChange = "transform, opacity";
              tooltipEl.style.opacity = "0";
              tooltipEl.style.transform = "translateY(12px) scale(0.9)";
              tooltipEl.style.borderRadius = "12px";
              tooltipEl.style.setProperty("overflow", "visible", "important");
              tooltipEl.dataset.visible = "false";
              tooltipEl.dataset.dayIndex = "-1";
              parent.appendChild(tooltipEl);
            }

            // Hide if not active
            if (tooltip.opacity === 0) {
              tooltipEl.style.opacity = "0";
              tooltipEl.style.transform = "translateY(10px) scale(0.94)";
              tooltipEl.classList.remove("tooltip-pop-bounce");
              tooltipEl.dataset.visible = "false";
              return;
            }

            const dayIndex = tooltip.dataPoints?.[0].dataIndex ?? 0;
            const avgStay = dailyAverages[dayIndex]?.avg ?? 0;
            const patientsCount = dailyAverages[dayIndex]?.total_patients ?? 0;
            let percentChange = dailyAverages[dayIndex]?.percent_change ?? 0;

            let isIncrease = percentChange > 0;
            let isDecrease = percentChange < 0;
            let changeColor = isIncrease ? "#ff4d4f" : isDecrease ? "#52c41a" : "#8c8c8c";
            let changeSymbol = isIncrease ? "▲" : isDecrease ? "▼" : "—";
            let changeText = isIncrease
              ? "Increase vs previous day"
              : isDecrease
              ? "Decrease vs previous day"
              : "No change";

            // Future day with no data
            if (patientsCount === 0 && avgStay === 0) {
              percentChange = 0;
              changeColor = "#8c8c8c";
              changeSymbol = "—";
              changeText = "No data yet";
            }

            const tooltipBackground = isDarkMode
              ? "linear-gradient(135deg, #2b2f36 0%, #1f242b 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
            const tooltipBorder = isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.06)";
            const tooltipTitleColor = isDarkMode ? "#e0e0e0" : "#262626";
            const tooltipSecondaryColor = isDarkMode ? "#b0b0b0" : "#8c8c8c";
            const tooltipDividerColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
            const tooltipPointerColor = isDarkMode ? "#2b2f36" : "#ffffff";
            const tooltipShadow = isDarkMode
              ? "0 8px 24px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.35)"
              : "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)";
            const tooltipPadding = compact ? "10px 12px" : "16px 20px";
            const tooltipMinWidth = compact ? 180 : 220;
            const tooltipGap = compact ? 6 : 10;
            const tooltipDotSize = compact ? 6 : 8;
            const tooltipLabelFontSize = compact ? 13 : 20;
            const tooltipValueFontSize = compact ? 13 : 20;
            const tooltipMetaFontSize = compact ? 12 : 20;
            const tooltipDividerTop = compact ? 4 : 6;
            const tooltipDividerPadding = compact ? 6 : 10;
            const tooltipPointerSize = compact ? 8 : 10;

            tooltipEl.innerHTML = `
              <div style="
                background: ${tooltipBackground};
                border-radius: 12px;
                overflow: hidden;
                padding: ${tooltipPadding};
                box-shadow: ${tooltipShadow};
                border: ${tooltipBorder};
                min-width: ${tooltipMinWidth}px;
                background-clip: padding-box;
              ">
                <div style="display: flex; flex-direction: column; gap: ${tooltipGap}px;">
                  <div style="display: flex; align-items: center; gap: ${tooltipGap}px;">
                    <div style="width: ${tooltipDotSize}px; height: ${tooltipDotSize}px; border-radius: 50%; background: #52c487;"></div>
                    <span style="font-weight: 600; font-size: ${tooltipLabelFontSize}px; color: ${tooltipTitleColor};">Total Patients:</span>
                    <span style="font-weight: 700; font-size: ${tooltipValueFontSize}px; color: #52c487; margin-left: auto;">${patientsCount}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: ${tooltipGap}px;">
                    <div style="width: ${tooltipDotSize}px; height: ${tooltipDotSize}px; border-radius: 50%; background: #1890ff;"></div>
                    <span style="font-weight: 600; font-size: ${tooltipLabelFontSize}px; color: ${tooltipTitleColor};">Average Stay:</span>
                    <span style="font-weight: 700; font-size: ${tooltipValueFontSize}px; color: #1890ff; margin-left: auto;">${formatHours(avgStay)}</span>
                  </div>
                  <div style="
                    margin-top: ${tooltipDividerTop}px;
                    padding-top: ${tooltipDividerPadding}px;
                    border-top: 1px solid ${tooltipDividerColor};
                    display: flex;
                    align-items: center;
                    gap: ${tooltipGap}px;
                  ">
                    <span style="
                      font-size: ${tooltipMetaFontSize}px;
                      font-weight: 700;
                      color: ${changeColor};
                    ">${changeSymbol} ${Math.abs(percentChange).toFixed(1)}%</span>
                    <span style="
                      font-size: ${tooltipMetaFontSize}px;
                      color: ${tooltipSecondaryColor};
                      font-weight: 500;
                    ">${changeText}</span>
                  </div>
                </div>
              </div>

              <!-- Triangle pointer -->
              <div class="tooltip-pointer" style="
                position: absolute;
                width: 0;
                height: 0;
                border-left: ${tooltipPointerSize}px solid transparent;
                border-right: ${tooltipPointerSize}px solid transparent;
                border-top: ${tooltipPointerSize}px solid ${tooltipPointerColor};
                left: 50%;
                transform: translateX(-50%);
                top: 100%;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
              "></div>
            `;

            // --- Position tooltip properly ---
            const padding = 12;
            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;

            let left = tooltip.caretX - tooltipWidth / 2;
            left = Math.max(padding, Math.min(left, parent.clientWidth - tooltipWidth - padding));

            let top = tooltip.caretY - tooltipHeight - 16;
            top = Math.max(padding, top);

            tooltipEl.style.left = `${left}px`;
            tooltipEl.style.top = `${top}px`;
            tooltipEl.style.opacity = "1";

            const pointer = tooltipEl.querySelector<HTMLDivElement>(".tooltip-pointer");
            let pointerX = tooltip.caretX - left;
            if (pointer) {
              pointerX = tooltip.caretX - left;
              pointer.style.left = `${pointerX}px`;
            }

            // Make the pop animation originate from the hovered bar/point.
            tooltipEl.style.transformOrigin = `${pointerX}px calc(100% + 10px)`;

            const activeIndex = String(dayIndex);
            const shouldAnimate =
              tooltipEl.dataset.visible !== "true" || tooltipEl.dataset.dayIndex !== activeIndex;

            if (shouldAnimate) {
              tooltipEl.style.transform = "";
              tooltipEl.classList.remove("tooltip-pop-bounce");
              // Force reflow so animation can restart cleanly when moving to another bar.
              void tooltipEl.offsetWidth;
              tooltipEl.classList.add("tooltip-pop-bounce");
            } else {
              tooltipEl.style.transform = "translateY(0) scale(1)";
            }

            tooltipEl.dataset.visible = "true";
            tooltipEl.dataset.dayIndex = activeIndex;
          },
        }

      },
    }),
    [
      axisNeutralTickColor,
      compact,
      maxDuration,
      maxPatients,
      observedMaxDuration,
      observedMaxPatients,
      patientTickStep,
      dailyAverages,
      isDarkMode,
      xAxisTitleFontSize,
      xAxisTickFontSize,
      yAxisTitleFontSize,
      yAxisTickFontSize,
      y1AxisTitleFontSize,
      y1AxisTickFontSize,
    ]
  );

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

  const isSlideshowMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('slideshow') === '1';

  return (
    <div
      className="responsive-chart-wrapper run-stay-responsive-wrapper"
      style={{
        width: "100%",
        height: "100%",
        maxHeight: wrapperMaxHeight,
        minHeight: 0,
        margin: "0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        backgroundColor: isDarkMode ? "#2d2d2d" : "#f3f5f8",
        borderRadius: "16px",
        transition: 'background-color 0.3s ease',
        padding: compact ? "10px 10px 0" : "16px 16px 0",
      }}
    >
      {/* Shimmer overlay — sits on top, fades out, never unmounts the chart beneath */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: isDarkMode ? "#2d2d2d" : "#f3f5f8",
          }}
        >
          <ShimmerLoader type="line" isDarkMode={isDarkMode} />
        </div>
      )}
      {/* Navigation buttons and week range */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: navHorizontalPadding,
          marginBottom: navBottomGap,
        }}
      >
        {/* Left Button */}
        <button
          onClick={goToPreviousWeek}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: controlButtonSize,
            height: controlButtonSize,
            borderRadius: "50%",
            backgroundColor: isDarkMode ? "#404040" : "#f0f2f5",
            border: isDarkMode ? "1px solid #555555" : "1px solid #d9d9d9",
            cursor: "pointer",
            boxShadow: isDarkMode 
              ? "0 4px 10px rgba(0,0,0,0.4)" 
              : "0 4px 10px rgba(0,0,0,0.15)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? "#4a5568" : "#e6f4ff";
            e.currentTarget.style.transform = compact ? "scale(1.08)" : "scale(1.12)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(24,144,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f0f2f5";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = isDarkMode 
              ? "0 4px 10px rgba(0,0,0,0.4)" 
              : "0 4px 10px rgba(0,0,0,0.15)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
            e.currentTarget.style.backgroundColor = isDarkMode ? "#2d3748" : "#cce6ff";
            e.currentTarget.style.boxShadow = "0 3px 8px rgba(24,144,255,0.3)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = compact ? "scale(1.08)" : "scale(1.12)";
            e.currentTarget.style.backgroundColor = isDarkMode ? "#4a5568" : "#e6f4ff";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(24,144,255,0.4)";
          }}
        >
          <ChevronLeft size={controlIconSize} color="#1890ff" strokeWidth={3} />
        </button>

        {/* Week range display with smooth gradient transition */}
        {(() => {
          const today = new Date();
          const day = today.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          const monday = new Date(today);
          monday.setDate(today.getDate() + diff + weekOffset * 7);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          const isCurrentWeek = today >= monday && today <= sunday;

          // Determine how much of the week should be “filled” (0-100%)
          const fillPercent = isCurrentWeek
            ? ((today.getDay() === 0 ? 6 : today.getDay() - 1) + 1) / 7 * 100
            : 100;

          return (
            <div
              style={{
                flex: 1,
                position: "relative",
                textAlign: "center",
                fontSize: weekBannerFontSize,
                fontWeight: 700,
                color: "#1890ff",
                letterSpacing: "1px",
                borderRadius: "16px",
                padding: weekBannerPadding,
                boxShadow: isDarkMode 
                  ? "0 4px 12px rgba(0,0,0,0.4)" 
                  : "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
                background: isDarkMode 
                  ? "rgba(52, 63, 74, 0.8)" 
                  : "linear-gradient(to right,rgba(196, 237, 255, 0.8))",
                transition: "background 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {/* Animated gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${fillPercent}%`,
                  background: isDarkMode 
                    ? "rgba(52, 63, 74, 0.8)" 
                    : "linear-gradient(to right,rgba(196, 237, 255, 0.8))",
                  transition: "width 0.8s ease-in-out, background 0.3s ease",
                  zIndex: 0,
                }}
              />

              {/* Week text */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: compact ? "8px" : "12px",
                  flexWrap: "wrap",
                }}
              >
                <span>{weekRange}</span>
                <div
                  style={{
                    width: compact ? "34px" : "38px",
                    height: compact ? "34px" : "38px",
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                ref={datePickerShellRef}
                >
                <DatePicker
                    allowClear={false}
                    className="run-stay-week-date-picker"
                    popupClassName={[
                      "run-stay-week-date-picker-dropdown",
                      isDatePickerSidecar &&
                        "run-stay-week-date-picker-dropdown--sidecar",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    open={isDatePickerOpen}
                    placement="bottomLeft"
                    inputReadOnly
                    value={extendedDayjs(selectedDate)}
                    format="MMM D, YYYY"
                    popupStyle={{
                      ...datePickerPopupStyle,
                      zIndex: 2000,
                    }}
                    disabledDate={(current: Dayjs) =>
                      current ? current.isAfter(extendedDayjs(), "day") : false
                    }
                    getPopupContainer={() => document.body}
                    onOpenChange={setIsDatePickerOpen}
                    onChange={handleWeekDateChange}
                    suffixIcon={null}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Pick week by date"
                    title="Pick week by date"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      datePickerToggleMouseDownRef.current = true;
                      setIsDatePickerOpen(open => !open);
                    }}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (datePickerToggleMouseDownRef.current) {
                        datePickerToggleMouseDownRef.current = false;
                        return;
                      }
                      setIsDatePickerOpen(open => !open);
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      zIndex: 1,
                      borderRadius: "999px",
                      border: isDarkMode ? "1px solid rgba(148, 163, 184, 0.34)" : "1px solid rgba(24, 144, 255, 0.24)",
                      background: isDarkMode ? "rgba(15, 23, 42, 0.35)" : "rgba(255, 255, 255, 0.62)",
                      color: "#1890ff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: isDarkMode ? "0 3px 8px rgba(0,0,0,0.24)" : "0 3px 8px rgba(24,144,255,0.12)",
                    }}
                  >
                    <Calendar size={compact ? 17 : 19} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Right Button with hover tooltip and click effect */}
        <div style={{ position: "relative" }}>
          <button
            ref={nextWeekBtnRef}
            onClick={goToNextWeek}
            onMouseEnter={() => {
              if (isNextWeekFuture && nextWeekBtnRef.current) {
                const rect = nextWeekBtnRef.current.getBoundingClientRect();
                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                setShowTooltip(true);
              }
            }}
            onMouseLeave={() => { setShowTooltip(false); setTooltipPos(null); }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: controlButtonSize,
              height: controlButtonSize,
              borderRadius: "50%",
              backgroundColor: isDarkMode ? "#404040" : "#f0f2f5",
              border: isDarkMode ? "1px solid #555555" : "1px solid #d9d9d9",
              cursor: isNextWeekFuture ? "not-allowed" : "pointer",
              opacity: isNextWeekFuture ? 0.8 : 1,
              boxShadow: isDarkMode 
                ? "0 4px 10px rgba(0,0,0,0.4)" 
                : "0 4px 10px rgba(0,0,0,0.15)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              if (!isNextWeekFuture) {
                e.currentTarget.style.backgroundColor = isDarkMode ? "#4a5568" : "#e6f4ff";
                e.currentTarget.style.transform = compact ? "scale(1.08)" : "scale(1.12)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(24,144,255,0.4)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f0f2f5";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = isDarkMode 
                ? "0 4px 10px rgba(0,0,0,0.4)" 
                : "0 4px 10px rgba(0,0,0,0.15)";
            }}
            onMouseDown={(e) => {
              if (!isNextWeekFuture) {
                e.currentTarget.style.transform = "scale(0.95)";
                e.currentTarget.style.backgroundColor = isDarkMode ? "#2d3748" : "#cce6ff";
                e.currentTarget.style.boxShadow = "0 3px 8px rgba(24,144,255,0.3)";
              }
            }}
            onMouseUp={(e) => {
              if (!isNextWeekFuture) {
                e.currentTarget.style.transform = compact ? "scale(1.08)" : "scale(1.12)";
                e.currentTarget.style.backgroundColor = isDarkMode ? "#4a5568" : "#e6f4ff";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(24,144,255,0.4)";
              }
            }}
          >
            <ChevronRight size={controlIconSize} color="#1890ff" strokeWidth={3} />
          </button>

          {/* Tooltip */}
          {showTooltip && isNextWeekFuture && tooltipPos && typeof document !== 'undefined' && createPortal(
            <div
              style={{
                position: "fixed",
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y - 10}px`,
                transform: "translate(-70%, -100%)",
                backgroundColor: isDarkMode ? "rgba(30, 35, 42, 0.95)" : "rgba(15, 23, 42, 0.88)",
                color: "#fff",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: compact ? "12px" : "13px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                zIndex: 99999,
                pointerEvents: "none",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Can't go beyond current week
              <div style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${isDarkMode ? "rgba(30, 35, 42, 0.95)" : "rgba(15, 23, 42, 0.88)"}`,
              }} />
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Chart container */}
      <div
        className={`chart-container run-stay-chart-container ${
          compact ? "run-stay-chart-container--compact" : ""
        }`}
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          minHeight: 0,
          maxHeight: chartAreaMaxHeight,
          height: "100%",
          overflow: "hidden",
          padding: chartPadding,
          position: "relative",
          boxSizing: "border-box",
          backgroundColor: chartSurfaceBg,
          borderRadius: "16px",
          border: chartSurfaceBorder,
          boxShadow: chartSurfaceShadow,
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {!isSlideshowMode && (
        <button
          type="button"
          aria-label="What am I seeing?"
          onClick={openInfoModal}
          style={{
            position: "absolute",
            top: compact ? "6px" : "8px",
            right: compact ? "6px" : "8px",
            width: infoButtonSize,
            height: infoButtonSize,
            borderRadius: "999px",
            border: "none",
            background: "transparent",
            color: isDarkMode ? "#d9d9d9" : "#595959",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 12,
            transition: "transform 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.color = "#1890ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.color = isDarkMode ? "#d9d9d9" : "#595959";
          }}
        >
          <Info size={infoIconSize} strokeWidth={2.2} />
        </button>
        )}
        <style>{`
          .run-stay-chart-container {
            overflow: hidden !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .run-stay-chart-container canvas {
            background-color: ${chartSurfaceBg} !important;
            border-radius: 16px !important;
            transition: background-color 0.3s ease;
            max-width: 100% !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 100% !important;
          }
          .run-stay-chart-container--compact canvas {
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            max-width: 100% !important;
          }
          .run-stay-chart-container div:not(.chartjs-tooltip) {
            overflow: hidden !important;
            max-width: 100% !important;
          }
          .run-stay-chart-container .chartjs-tooltip {
            overflow: visible !important;
            border-radius: 12px !important;
          }
          .run-stay-chart-container div canvas {
            max-width: 100% !important;
            width: 100% !important;
          }
          .run-stay-responsive-wrapper {
            max-width: 100% !important;
            overflow: hidden !important;
          }

          .run-stay-week-date-picker.ant-picker,
          .run-stay-week-date-picker.antd5-picker {
            border-radius: 999px !important;
          }

          .run-stay-week-date-picker-dropdown {
            border-radius: 22px !important;
            overflow: hidden !important;
            will-change: opacity, transform;
            max-width: calc(100vw - 24px) !important;
          }

          .run-stay-week-date-picker-dropdown.ant-slide-up-appear,
          .run-stay-week-date-picker-dropdown.ant-slide-up-enter,
          .run-stay-week-date-picker-dropdown.antd5-slide-up-appear,
          .run-stay-week-date-picker-dropdown.antd5-slide-up-enter {
            opacity: 0;
            transform: translateX(-18px) translateY(0px) scale(0.98) !important;
            transform-origin: left center;
          }

          .run-stay-week-date-picker-dropdown.ant-slide-up-appear.ant-slide-up-appear-active,
          .run-stay-week-date-picker-dropdown.ant-slide-up-enter.ant-slide-up-enter-active,
          .run-stay-week-date-picker-dropdown.antd5-slide-up-appear.antd5-slide-up-appear-active,
          .run-stay-week-date-picker-dropdown.antd5-slide-up-enter.antd5-slide-up-enter-active {
            opacity: 1;
            transform: translateX(0px) translateY(0px) scale(1) !important;
            transition: opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .run-stay-week-date-picker-dropdown.ant-slide-up-leave,
          .run-stay-week-date-picker-dropdown.antd5-slide-up-leave {
            opacity: 1;
            transform: translateX(0px) translateY(0px) scale(1) !important;
          }

          .run-stay-week-date-picker-dropdown.ant-slide-up-leave.ant-slide-up-leave-active,
          .run-stay-week-date-picker-dropdown.antd5-slide-up-leave.antd5-slide-up-leave-active {
            opacity: 0;
            transform: translateX(-18px) translateY(0px) scale(0.98) !important;
            transition: opacity 160ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          @keyframes runStayCalendarSlideOut {
            from {
              opacity: 0;
              transform: translateX(-32px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          .run-stay-week-date-picker-dropdown--sidecar.ant-slide-up-appear,
          .run-stay-week-date-picker-dropdown--sidecar.ant-slide-up-enter,
          .run-stay-week-date-picker-dropdown--sidecar.antd5-slide-up-appear,
          .run-stay-week-date-picker-dropdown--sidecar.antd5-slide-up-enter {
            opacity: 0;
            transform: translateX(-16px) scale(0.985) !important;
            transform-origin: left center;
          }

          .run-stay-week-date-picker-dropdown--sidecar.ant-slide-up-appear.ant-slide-up-appear-active,
          .run-stay-week-date-picker-dropdown--sidecar.ant-slide-up-enter.ant-slide-up-enter-active,
          .run-stay-week-date-picker-dropdown--sidecar.antd5-slide-up-appear.antd5-slide-up-appear-active,
          .run-stay-week-date-picker-dropdown--sidecar.antd5-slide-up-enter.antd5-slide-up-enter-active {
            opacity: 1;
            transform: translateX(0) scale(1) !important;
            transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .run-stay-week-date-picker-dropdown--sidecar.ant-slide-up-leave.ant-slide-up-leave-active,
          .run-stay-week-date-picker-dropdown--sidecar.antd5-slide-up-leave.antd5-slide-up-leave-active {
            opacity: 0;
            transform: translateX(0) scale(0.985) !important;
            transition: opacity 140ms ease, transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .run-stay-week-date-picker-dropdown--sidecar {
            background: #f7f8fa !important;
            border-radius: 8px !important;
            overflow: hidden !important;
          }

          [data-theme='dark'] .run-stay-week-date-picker-dropdown--sidecar,
          .dark-theme .run-stay-week-date-picker-dropdown--sidecar {
            background: #1a1a1a !important;
          }

          .run-stay-week-date-picker-popup-shell {
            display: flex;
            flex-direction: column;
            width: 100%;
            min-width: 0;
          }

          .run-stay-week-date-picker-popup-header {
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
          }

          [data-theme='dark'] .run-stay-week-date-picker-popup-header,
          .dark-theme .run-stay-week-date-picker-popup-header {
            border-bottom-color: rgba(255, 255, 255, 0.08);
            background: linear-gradient(180deg, rgba(32, 32, 34, 0.98) 0%, rgba(24, 24, 26, 0.94) 100%);
            color: rgba(235, 235, 245, 0.7);
          }

          .run-stay-week-date-picker-popup-close {
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

          .run-stay-week-date-picker-popup-close:hover {
            transform: scale(1.04);
            background: rgba(120, 120, 128, 0.18);
            color: rgba(60, 60, 67, 0.92);
          }

          .run-stay-week-date-picker-popup-close:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.14);
          }

          [data-theme='dark'] .run-stay-week-date-picker-popup-close,
          .dark-theme .run-stay-week-date-picker-popup-close {
            background: rgba(255, 255, 255, 0.10);
            color: rgba(235, 235, 245, 0.72);
          }

          [data-theme='dark'] .run-stay-week-date-picker-popup-close:hover,
          .dark-theme .run-stay-week-date-picker-popup-close:hover {
            background: rgba(255, 255, 255, 0.16);
            color: rgba(255, 255, 255, 0.9);
          }

          .run-stay-week-date-picker-dropdown .ant-picker-panel-container,
          .run-stay-week-date-picker-dropdown .antd5-picker-panel-container {
            width: 100% !important;
            max-width: 280px !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            border: 1px solid rgba(60, 60, 67, 0.12) !important;
            background: #fff !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          }

          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-panel-container,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-panel-container,
          .dark-theme .run-stay-week-date-picker-dropdown .ant-picker-panel-container,
          .dark-theme .run-stay-week-date-picker-dropdown .antd5-picker-panel-container {
            border-color: rgba(255, 255, 255, 0.08) !important;
            background: #1a1a1a !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-panel-container,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-panel-container {
            max-width: none !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            background: #f7f8fa !important;
            transform-origin: left center !important;
            animation: runStayCalendarSlideOut 440ms cubic-bezier(0.22, 1, 0.36, 1) both !important;
          }

          [data-theme='dark'] .run-stay-week-date-picker-dropdown--sidecar .ant-picker-panel-container,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-panel-container,
          .dark-theme .run-stay-week-date-picker-dropdown--sidecar .ant-picker-panel-container,
          .dark-theme .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-panel-container {
            background: #1a1a1a !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .run-stay-week-date-picker-popup-shell,
          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-panel,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-panel {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-date-panel,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-date-panel {
            height: 100% !important;
            width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-body,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-body {
            flex: 1 1 auto !important;
            display: flex !important;
            align-items: stretch !important;
            padding: 4px 8px 5px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-content,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-content {
            height: 100% !important;
            table-layout: fixed !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header {
            min-height: 30px !important;
            padding: 4px 7px 3px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header-view,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header-view {
            line-height: 22px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header-view button,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header-view button {
            font-size: 12px !important;
            line-height: 22px !important;
            padding: 0 2px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header-super-prev-btn,
          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header-prev-btn,
          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header-super-next-btn,
          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-header-next-btn,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header-super-prev-btn,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header-prev-btn,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header-super-next-btn,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-header-next-btn {
            width: 20px !important;
            height: 20px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-content th,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-content th {
            height: 20px !important;
            font-size: 10px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-cell-inner,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-cell-inner {
            min-width: 24px !important;
            height: 24px !important;
            line-height: 24px !important;
            font-size: 11px !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-footer,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-footer {
            flex: 0 0 auto !important;
            min-height: 34px !important;
            padding: 4px 8px 6px !important;
            line-height: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .run-stay-week-date-picker-dropdown--sidecar .ant-picker-today-btn,
          .run-stay-week-date-picker-dropdown--sidecar .antd5-picker-today-btn {
            font-size: 12px !important;
            line-height: 24px !important;
            min-height: 24px !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-header,
          .run-stay-week-date-picker-dropdown .antd5-picker-header {
            padding: 8px 10px 6px !important;
            border-bottom: 1px solid rgba(60, 60, 67, 0.08) !important;
            border-radius: 8px 8px 0 0 !important;
            background: transparent !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-header-super-prev-btn,
          .run-stay-week-date-picker-dropdown .ant-picker-header-prev-btn,
          .run-stay-week-date-picker-dropdown .ant-picker-header-super-next-btn,
          .run-stay-week-date-picker-dropdown .ant-picker-header-next-btn,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-super-prev-btn,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-prev-btn,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-super-next-btn,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-next-btn {
            width: 24px !important;
            height: 24px !important;
            border-radius: 4px !important;
            border: none !important;
            background: transparent !important;
            color: #666 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 150ms ease !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-header-super-prev-btn:hover,
          .run-stay-week-date-picker-dropdown .ant-picker-header-prev-btn:hover,
          .run-stay-week-date-picker-dropdown .ant-picker-header-super-next-btn:hover,
          .run-stay-week-date-picker-dropdown .ant-picker-header-next-btn:hover,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-super-prev-btn:hover,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-prev-btn:hover,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-super-next-btn:hover,
          .run-stay-week-date-picker-dropdown .antd5-picker-header-next-btn:hover {
            background: rgba(0, 0, 0, 0.04) !important;
          }

          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-super-prev-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-prev-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-super-next-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-next-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-super-prev-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-prev-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-super-next-btn,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-next-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .ant-picker-header-super-prev-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .ant-picker-header-prev-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .ant-picker-header-super-next-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .ant-picker-header-next-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .antd5-picker-header-super-prev-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .antd5-picker-header-prev-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .antd5-picker-header-super-next-btn,
          .dark-theme .run-stay-week-date-picker-dropdown .antd5-picker-header-next-btn {
            color: #999 !important;
          }
          
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-super-prev-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-prev-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-super-next-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .ant-picker-header-next-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-super-prev-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-prev-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-super-next-btn:hover,
          [data-theme='dark'] .run-stay-week-date-picker-dropdown .antd5-picker-header-next-btn:hover {
            background: rgba(255, 255, 255, 0.08) !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-body,
          .run-stay-week-date-picker-dropdown .antd5-picker-body {
            padding: 8px 10px 10px !important;
          }
          
          .run-stay-week-date-picker-dropdown .ant-picker-content th,
          .run-stay-week-date-picker-dropdown .antd5-picker-content th {
            font-size: 12px !important;
            font-weight: 500 !important;
            height: 28px !important;
            color: #666 !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-cell-inner,
          .run-stay-week-date-picker-dropdown .antd5-picker-cell-inner {
            min-width: 28px !important;
            height: 28px !important;
            line-height: 28px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            transition: background 150ms ease !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-cell:hover .ant-picker-cell-inner,
          .run-stay-week-date-picker-dropdown .antd5-picker-cell:hover .antd5-picker-cell-inner {
            background: rgba(24, 144, 255, 0.1) !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner,
          .run-stay-week-date-picker-dropdown .antd5-picker-cell-selected .antd5-picker-cell-inner {
            background: #1890ff !important;
            color: #fff !important;
          }
          
          .run-stay-week-date-picker-dropdown .ant-picker-cell-today .ant-picker-cell-inner,
          .run-stay-week-date-picker-dropdown .antd5-picker-cell-today .antd5-picker-cell-inner {
            border: 1px solid #1890ff !important;
          }

          .run-stay-week-date-picker-dropdown .ant-picker-today-btn,
          .run-stay-week-date-picker-dropdown .antd5-picker-today-btn {
            color: #1890ff !important;
            font-size: 13px !important;
          }
          
          .run-stay-week-date-picker-dropdown .ant-picker-footer,
          .run-stay-week-date-picker-dropdown .antd5-picker-footer {
            padding: 8px 10px !important;
            border-top: 1px solid rgba(60, 60, 67, 0.08) !important;
          }

          @media (max-width: 768px) {
            .run-stay-week-date-picker-dropdown {
              width: min(90vw, 280px) !important;
            }

            .run-stay-week-date-picker-popup-header {
              padding: 8px 10px !important;
              font-size: 11px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-header,
            .run-stay-week-date-picker-dropdown .antd5-picker-header {
              padding: 6px 8px 4px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-body,
            .run-stay-week-date-picker-dropdown .antd5-picker-body {
              padding: 6px 8px 8px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-content,
            .run-stay-week-date-picker-dropdown .antd5-picker-content {
              width: 100% !important;
            }
            
            .run-stay-week-date-picker-dropdown .ant-picker-panel,
            .run-stay-week-date-picker-dropdown .antd5-picker-panel,
            .run-stay-week-date-picker-dropdown .ant-picker-date-panel,
            .run-stay-week-date-picker-dropdown .antd5-picker-date-panel {
              width: 100% !important;
            }
            
            .run-stay-week-date-picker-dropdown .ant-picker-content th,
            .run-stay-week-date-picker-dropdown .antd5-picker-content th {
              font-size: 11px !important;
              height: 24px !important;
            }
            
            .run-stay-week-date-picker-dropdown .ant-picker-cell-inner,
            .run-stay-week-date-picker-dropdown .antd5-picker-cell-inner {
              min-width: 26px !important;
              height: 26px !important;
              line-height: 26px !important;
              font-size: 12px !important;
            }
          }

          @media (max-width: 480px) {
            .run-stay-week-date-picker-dropdown {
              width: min(90vw, 260px) !important;
            }

            .run-stay-week-date-picker-popup-header {
              padding: 7px 9px !important;
              font-size: 10px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-header,
            .run-stay-week-date-picker-dropdown .antd5-picker-header {
              padding: 5px 7px 3px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-body,
            .run-stay-week-date-picker-dropdown .antd5-picker-body {
              padding: 5px 7px 7px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-cell,
            .run-stay-week-date-picker-dropdown .antd5-picker-cell {
              padding: 0 !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-cell-inner,
            .run-stay-week-date-picker-dropdown .antd5-picker-cell-inner {
              min-width: 24px !important;
              height: 24px !important;
              line-height: 24px !important;
              border-radius: 5px !important;
              font-size: 11px !important;
            }

            .run-stay-week-date-picker-dropdown .ant-picker-header-super-prev-btn,
            .run-stay-week-date-picker-dropdown .ant-picker-header-prev-btn,
            .run-stay-week-date-picker-dropdown .ant-picker-header-super-next-btn,
            .run-stay-week-date-picker-dropdown .ant-picker-header-next-btn,
            .run-stay-week-date-picker-dropdown .antd5-picker-header-super-prev-btn,
            .run-stay-week-date-picker-dropdown .antd5-picker-header-prev-btn,
            .run-stay-week-date-picker-dropdown .antd5-picker-header-super-next-btn,
            .run-stay-week-date-picker-dropdown .antd5-picker-header-next-btn {
              width: 24px !important;
              height: 24px !important;
            }
            
            .run-stay-week-date-picker-dropdown .ant-picker-content th,
            .run-stay-week-date-picker-dropdown .antd5-picker-content th {
              font-size: 10px !important;
              height: 20px !important;
            }
            
            .run-stay-week-date-picker-dropdown .ant-picker-header-view button,
            .run-stay-week-date-picker-dropdown .antd5-picker-header-view button {
              font-size: 12px !important;
            }
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
        `}</style>
        <div 
          ref={chartContainerRef}
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            position: "relative",
            maxWidth: "100%",
            boxSizing: "border-box"
          }}
        >
          <Chart
            ref={chartRef}
            type="line"
            key={`${refreshKey ?? "stay-chart"}-${isDarkMode ? "dark" : "light"}`}
            data={data}
            options={options}
            plugins={[backgroundPlugin, noDataPlugin, dataLabelsPlugin]}
            style={{ 
              width: "100%", 
              height: "100%", 
              maxWidth: "100%", 
              maxHeight: "100%",
              minWidth: 0,
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      {showInfoModal && !isSlideshowMode && (
        <div
          role="presentation"
          onClick={closeInfoModal}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            background: infoPanelReady
              ? isDarkMode
                ? "rgba(6, 10, 16, 0.62)"
                : "rgba(15, 23, 42, 0.34)"
              : "rgba(0, 0, 0, 0)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: "8px 8px 14px",
            transition: "background-color 280ms cubic-bezier(0.2, 0.9, 0.2, 1)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chart explanation"
            onClick={(e) => e.stopPropagation()}
	            style={{
	              background: isDarkMode
	                ? 'rgba(30, 35, 42, 0.70)'
	                : 'rgba(255, 255, 255, 0.70)',
	              backdropFilter: 'blur(16px) saturate(170%)',
	              WebkitBackdropFilter: 'blur(16px) saturate(170%)',
	              border: isDarkMode ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(24,144,255,0.14)',
	              boxShadow: isDarkMode
	                ? '0 28px 58px rgba(0, 0, 0, 0.56)'
	                : '0 24px 52px rgba(24, 144, 255, 0.24)',
              color: isDarkMode ? '#f0f0f0' : '#1f2937',
              overflow: 'hidden',
              transformOrigin: 'top right',
              transform: infoPanelReady ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.38)',
              opacity: infoPanelReady ? 1 : 0,
              transition:
                'transform 360ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 280ms cubic-bezier(0.2, 0.9, 0.2, 1)',
              width: 'clamp(320px, 90vw, 500px)',
              maxWidth: 'calc(100% - 20px)',
              borderRadius: '16px',
              maxHeight: 'calc(100% - 24px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'clamp(12px, 3vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2.5vw, 14px)',
                borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 10px)' }}>
                <div
                  style={{
                    width: 'clamp(28px, 6vw, 32px)',
                    height: 'clamp(28px, 6vw, 32px)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    color: '#fff',
                  }}
                >
                  <Info size={18} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', letterSpacing: '0.01em' }}>How To Read This Chart</div>
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
                  background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
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
                <div style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', fontWeight: 700, color: '#1890ff' }}>Weekly trend line</div>
                <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', lineHeight: 1.5 }}>
                  The blue line shows average stay time per day across the selected week.
                </div>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', fontWeight: 700, color: '#1890ff' }}>Patient count bars</div>
                <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', lineHeight: 1.5 }}>
                  The green bars show how many patients were included for each day.
                </div>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', fontWeight: 700, color: '#1890ff' }}>Week navigation</div>
                <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', lineHeight: 1.5 }}>
                  Use the left and right arrows to move between weeks and compare trends.
                </div>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', fontWeight: 700, color: '#1890ff' }}>Hover details</div>
                <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', lineHeight: 1.5 }}>
                  Hover a day to see patients counted, average stay, and daily change from the previous day.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
