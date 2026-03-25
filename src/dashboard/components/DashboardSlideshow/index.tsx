import { ReactElement, useEffect, useState, useCallback, useRef } from 'react';
import { styled } from '@superset-ui/core';

interface DashboardSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
  isDarkMode?: boolean;
  actionsMenu?: ReactElement;
  isActionsMenuOpen?: boolean;
  onActionsMenuOpenChange?: (open: boolean) => void;
}

const SLIDESHOW_HEADER_HEIGHT = 60;
const TIMER_BAR_HEIGHT = 4;
const MIN_TIMER_ANCHOR_HEIGHT = 40;

const SlideshowContainer = styled.div<{ isDarkMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: ${({ isDarkMode }) => (isDarkMode ? '#000000' : '#ffffff')};
  display: flex;
  flex-direction: column;
  transition: opacity 0.3s ease;
`;

const SlideshowHeader = styled.div<{ isDarkMode: boolean; isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${SLIDESHOW_HEADER_HEIGHT}px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
`;


const OverlayContainer = styled.div<{ isDarkMode: boolean; isVisible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: none;
  transition: opacity 0.4s ease;
`;

const OverlayContent = styled.div<{ isDarkMode: boolean }>`
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(30, 30, 30, 0.85)'
      : 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.6)'
      : '0 8px 32px rgba(0, 0, 0, 0.15)'};
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  min-width: 400px;
  max-width: 600px;
`;

const OverlayTitle = styled.div<{ isDarkMode: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? '#ffffff' : '#000000')};
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
`;

const KeyboardShortcuts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ShortcutRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const ShortcutLabel = styled.span<{ isDarkMode: boolean }>`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
`;

const ShortcutKeys = styled.div`
  display: flex;
  gap: 6px;
`;

const KeyBadge = styled.kbd<{ isDarkMode: boolean }>`
  background: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
  color: ${({ isDarkMode }) => (isDarkMode ? '#ffffff' : '#000000')};
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode
      ? '0 1px 2px rgba(0, 0, 0, 0.3)'
      : '0 1px 2px rgba(0, 0, 0, 0.1)'};
  min-width: 24px;
  text-align: center;
`;

const IframeContainer = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
  pointer-events: ${({ isActive }) => (isActive ? 'auto' : 'none')};
  transition: opacity 0.6s ease;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const SLIDES = [
  { key: 'clinical', label: 'Clinical Service Monitoring', view: 'main' },
  { key: 'stay', label: 'Patient Stay Times', view: 'stay' },
];

const ROTATION_INTERVAL = 20000; // 20 seconds per slide

const TimerBar = styled.div<{
  progress: number;
  isDarkMode: boolean;
  topOffset: number;
}>`
  position: absolute;
  top: ${({ topOffset }) => topOffset}px;
  left: 0;
  height: ${TIMER_BAR_HEIGHT}px;
  width: ${({ progress }) => progress}%;
  background: ${({ isDarkMode }) => (isDarkMode ? '#64a0d0 ' : '#64a0d0')};
  transition: width 0.1s linear;
  z-index: 10001;
  pointer-events: none;
`;

export default function DashboardSlideshow({
  isOpen,
  onClose,
  dashboardId,
  isDarkMode = false,
}: DashboardSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [timerProgress, setTimerProgress] = useState(0);
  const [timerSyncKey, setTimerSyncKey] = useState(0);
  const [timerAlignment, setTimerAlignment] = useState<{
    slideIndex: number;
    topOffset: number;
  } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Build iframe URLs
  const postCountdownToActiveSlide = useCallback(
    (remainingSeconds: number, progressRatio: number) => {
      const activeIframe = iframeRefs.current[currentSlide];
      activeIframe?.contentWindow?.postMessage(
        {
          type: 'superset-dashboard-slideshow-countdown',
          remainingSeconds,
          progressRatio,
        },
        window.location.origin,
      );
    },
    [currentSlide],
  );
  const getSlideUrl = useCallback(
    (slideIndex: number) => {
      const slide = SLIDES[slideIndex];
      const darkModeParam = isDarkMode ? '&dark=1' : '';
      const baseUrl = `/superset/dashboard/${dashboardId}/?standalone=1&slideshow=1${darkModeParam}`;

      // For Patient Stay Times view, add a parameter to trigger that view
      if (slide.view === 'stay') {
        const url = `${baseUrl}&view=stay`;
        return url;
      }

      return baseUrl;
    },
    [dashboardId, isDarkMode],
  );

  // Debug: Log URLs when component mounts
  useEffect(() => {
    if (isOpen) {
      console.log('Slideshow: Dashboard ID:', dashboardId);
      console.log('Slideshow: All slide URLs:');
      SLIDES.forEach((slide, index) => {
        console.log(`  ${index}: ${slide.label} → ${getSlideUrl(index)}`);
      });
    }
  }, [isOpen, dashboardId, getSlideUrl]);

  // Debug: Log slide changes
  useEffect(() => {
    if (isOpen) {
      console.log(
        `Slideshow: Current slide changed to ${currentSlide} - ${SLIDES[currentSlide].label}`,
      );
    }
  }, [currentSlide, isOpen]);

  const getTimerAnchorElement = useCallback(
    (slideIndex = currentSlide) => {
      const iframe = iframeRefs.current[slideIndex];
      const doc = iframe?.contentDocument;
      if (!doc) {
        return null;
      }

      return (
        (doc.querySelector(
          '[data-test="dashboard-header-container"]',
        ) as HTMLElement | null) ||
        (doc.querySelector('.dashboard-header') as HTMLElement | null)
      );
    },
    [currentSlide],
  );

  const syncTimerOffset = useCallback(
    (slideIndex = currentSlide) => {
      try {
        const headerEl = getTimerAnchorElement(slideIndex);
        if (!headerEl) {
          return false;
        }

        const rect = headerEl.getBoundingClientRect();
        if (rect.height < MIN_TIMER_ANCHOR_HEIGHT) {
          return false;
        }

        const topOffset = Math.round(rect.bottom);
        setTimerAlignment(previousAlignment => {
          if (
            previousAlignment &&
            previousAlignment.slideIndex === slideIndex &&
            previousAlignment.topOffset === topOffset
          ) {
            return previousAlignment;
          }

          return { slideIndex, topOffset };
        });
        return true;
      } catch (error) {
        console.warn('Timer bar alignment failed:', error);
        return false;
      }
    },
    [currentSlide, getTimerAnchorElement],
  );

  // Auto-advance slides with progress bar
  useEffect(() => {
    if (!isOpen || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return () => undefined;
    }
    // Reset timer
    startTimeRef.current = Date.now();
    setTimerProgress(0);
    postCountdownToActiveSlide(Math.ceil(ROTATION_INTERVAL / 1000), 1);

    // Update progress bar every 100ms
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingMs = Math.max(0, ROTATION_INTERVAL - elapsed);
      const progress = Math.min((elapsed / ROTATION_INTERVAL) * 100, 100);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const progressRatio = remainingMs / ROTATION_INTERVAL;

      setTimerProgress(progress);
      postCountdownToActiveSlide(remainingSeconds, progressRatio);
    }, 100);

    // Advance to next slide
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
      startTimeRef.current = Date.now();
      setTimerProgress(0);
    }, ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, isPaused, currentSlide, postCountdownToActiveSlide, timerSyncKey]);

  useEffect(() => {
    if (!isOpen) {
      setTimerAlignment(null);
      return () => undefined;
    }

    let animationFrameId = 0;
    let retryIntervalId = 0;

    const sync = () => {
      syncTimerOffset(currentSlide);
    };

    const scheduleSync = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = 0;
        sync();
      });
    };

    scheduleSync();
    const timeoutIds = [120, 320, 700, 1200, 2000].map(delay =>
      window.setTimeout(scheduleSync, delay),
    );
    retryIntervalId = window.setInterval(scheduleSync, 120);
    const stopRetryTimerId = window.setTimeout(() => {
      if (retryIntervalId) {
        window.clearInterval(retryIntervalId);
        retryIntervalId = 0;
      }
    }, 5000);

    window.addEventListener('resize', scheduleSync);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (retryIntervalId) {
        window.clearInterval(retryIntervalId);
      }
      timeoutIds.forEach(id => window.clearTimeout(id));
      window.clearTimeout(stopRetryTimerId);
      window.removeEventListener('resize', scheduleSync);
    };
  }, [currentSlide, isOpen, syncTimerOffset, timerSyncKey]);

  // Show overlay when slide changes
  const showOverlay = useCallback(() => {
    setOverlayVisible(true);

    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }

    overlayTimeoutRef.current = setTimeout(() => {
      setOverlayVisible(false);
    }, 2000); // Hide after 2 seconds
  }, []);

  // Show overlay on slide change
  useEffect(() => {
    if (isOpen) {
      showOverlay();
    }
  }, [currentSlide, isOpen, showOverlay]);

  useEffect(() => {
    if (!isOpen) return () => undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      showOverlay();

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => (prev + 1) % SLIDES.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, [isOpen, onClose, showOverlay]);

  // Handle iframe load
  const handleIframeLoad = useCallback(
    (slideIndex: number) => {
      const slide = SLIDES[slideIndex];
      console.log(
        `Slideshow: Slide ${slideIndex} (${slide.label}) iframe loaded successfully`,
      );

      if (slideIndex === currentSlide) {
        startTimeRef.current = Date.now();
        setTimerProgress(0);
        setTimerSyncKey(previousKey => previousKey + 1);
        syncTimerOffset(slideIndex);
        postCountdownToActiveSlide(Math.ceil(ROTATION_INTERVAL / 1000), 1);
      }
    },
    [currentSlide, postCountdownToActiveSlide, syncTimerOffset],
  );
  // Navigate to specific slide
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    startTimeRef.current = Date.now();
    setTimerProgress(0);
  }, []);

  // Previous/Next handlers
  const handlePrevious = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
    startTimeRef.current = Date.now();
    setTimerProgress(0);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    startTimeRef.current = Date.now();
    setTimerProgress(0);
  }, []);

  if (!isOpen) return null;

  return (
    <SlideshowContainer isDarkMode={isDarkMode}>
      <SlideshowHeader isDarkMode={isDarkMode} isVisible={overlayVisible}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: isDarkMode ? '#ffffff' : '#000000',
            }}
          >
            {SLIDES[currentSlide].label}
          </span>
        </div>
      </SlideshowHeader>

      {!isPaused && timerAlignment?.slideIndex === currentSlide && (
        <TimerBar
          progress={timerProgress}
          isDarkMode={isDarkMode}
          topOffset={timerAlignment.topOffset}
        />
      )}

      {/* Render all iframes but only show the active one */}
      {SLIDES.map((slide, index) => {
        const url = getSlideUrl(index);
        return (
          <IframeContainer key={slide.key} isActive={index === currentSlide}>
            <StyledIframe
              ref={node => {
                iframeRefs.current[index] = node;
              }}
              key={`${slide.key}-${url}`}
              src={url}
              title={slide.label}
              onLoad={() => handleIframeLoad(index)}
              allow="fullscreen"
            />
          </IframeContainer>
        );
      })}
    </SlideshowContainer>
  );
}
