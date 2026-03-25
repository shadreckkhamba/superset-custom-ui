import { ReactElement, useEffect, useState, useCallback, useRef } from 'react';
import { styled } from '@superset-ui/core';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';

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
  min-height: ${SLIDESHOW_HEADER_HEIGHT}px;
  z-index: 10000;
  padding: 10px 16px;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) =>
    isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, -20px, 0)'};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition:
    opacity 220ms ease,
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(9, 12, 16, 0.26)'
      : 'rgba(252, 252, 252, 0.24)'};
  border-bottom: 1px solid
    ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.12)'};
`;

const SlideshowHeaderContent = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
`;

const HeaderSide = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 124px;
`;

const HeaderSideRight = styled(HeaderSide)`
  justify-content: flex-end;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderButton = styled.button<{ isDarkMode: boolean }>`
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  border: 1px solid
    ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(203, 213, 225, 0.28)' : 'rgba(148, 163, 184, 0.24)'};
  background: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(148, 163, 184, 0.22)' : 'rgba(148, 163, 184, 0.24)'};
  color: ${({ isDarkMode }) => (isDarkMode ? '#e2e8f0' : '#374151')};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(148, 163, 184, 0.32)' : 'rgba(148, 163, 184, 0.34)'};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.2;
  }
`;

const HeaderTitle = styled.h1<{ isDarkMode: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  max-width: min(70vw, 1200px);
  padding: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  font-size: clamp(26px, 2.4vw, 48px);
  line-height: 1.06;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ isDarkMode }) => (isDarkMode ? '#f8fafc' : '#1f2937')};

  @media (max-width: 1024px) {
    font-size: clamp(22px, 2.8vw, 34px);
    max-width: min(62vw, 760px);
  }

  @media (max-width: 768px) {
    font-size: clamp(18px, 3.6vw, 24px);
    max-width: min(56vw, 560px);
  }
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

const ROTATION_INTERVAL = 60000; // 60 seconds per slide

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
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingMsRef = useRef<number>(ROTATION_INTERVAL);
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
    if (!isOpen) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      remainingMsRef.current = ROTATION_INTERVAL;
      setTimerProgress(0);
      return () => undefined;
    }

    if (isPaused) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return () => undefined;
    }

    const startRemainingMs =
      remainingMsRef.current > 0
        ? Math.min(ROTATION_INTERVAL, remainingMsRef.current)
        : ROTATION_INTERVAL;
    startTimeRef.current = Date.now();

    const publishCountdown = (remainingMs: number) => {
      const progress = Math.min(
        ((ROTATION_INTERVAL - remainingMs) / ROTATION_INTERVAL) * 100,
        100,
      );
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const progressRatio = remainingMs / ROTATION_INTERVAL;

      setTimerProgress(progress);
      postCountdownToActiveSlide(remainingSeconds, progressRatio);
    };

    publishCountdown(startRemainingMs);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingMs = Math.max(0, startRemainingMs - elapsed);
      remainingMsRef.current = remainingMs;
      publishCountdown(remainingMs);

      if (remainingMs <= 0) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        remainingMsRef.current = ROTATION_INTERVAL;
        setCurrentSlide(prev => (prev + 1) % SLIDES.length);
      }
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
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
    }, 5000); // Hide after 5 seconds
  }, []);

  // Show overlay on slide change
  useEffect(() => {
    if (isOpen) {
      showOverlay();
    }
  }, [currentSlide, isOpen, showOverlay]);

  useEffect(() => {
    if (!isOpen) return () => undefined;

    const handlePointerActivity = () => {
      showOverlay();
    };

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

    document.addEventListener('mousemove', handlePointerActivity);
    document.addEventListener('touchstart', handlePointerActivity, {
      passive: true,
    });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handlePointerActivity);
      document.removeEventListener('touchstart', handlePointerActivity);
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
        remainingMsRef.current = ROTATION_INTERVAL;
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
    remainingMsRef.current = ROTATION_INTERVAL;
    setCurrentSlide(index);
    startTimeRef.current = Date.now();
    setTimerProgress(0);
  }, []);

  // Previous/Next handlers
  const handlePrevious = useCallback(() => {
    remainingMsRef.current = ROTATION_INTERVAL;
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
    startTimeRef.current = Date.now();
    setTimerProgress(0);
  }, []);

  const handleNext = useCallback(() => {
    remainingMsRef.current = ROTATION_INTERVAL;
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    startTimeRef.current = Date.now();
    setTimerProgress(0);
  }, []);

  if (!isOpen) return null;

  return (
    <SlideshowContainer isDarkMode={isDarkMode}>
      <SlideshowHeader isDarkMode={isDarkMode} isVisible={overlayVisible}>
        <SlideshowHeaderContent>
          <HeaderSide>
            <HeaderControls>
              <HeaderButton
                type="button"
                isDarkMode={isDarkMode}
                onClick={() => {
                  showOverlay();
                  handlePrevious();
                }}
                aria-label="Previous slide"
                title="Previous slide"
              >
                <ChevronLeft />
              </HeaderButton>
              <HeaderButton
                type="button"
                isDarkMode={isDarkMode}
                onClick={() => {
                  showOverlay();
                  setIsPaused(prev => !prev);
                }}
                aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
                title={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
              >
                {isPaused ? <Play /> : <Pause />}
              </HeaderButton>
              <HeaderButton
                type="button"
                isDarkMode={isDarkMode}
                onClick={() => {
                  showOverlay();
                  handleNext();
                }}
                aria-label="Next slide"
                title="Next slide"
              >
                <ChevronRight />
              </HeaderButton>
            </HeaderControls>
          </HeaderSide>

          <HeaderTitle isDarkMode={isDarkMode}>
            {SLIDES[currentSlide].label}
          </HeaderTitle>

          <HeaderSideRight>
            <HeaderButton
              type="button"
              isDarkMode={isDarkMode}
              onClick={onClose}
              aria-label="Exit slideshow"
              title="Exit slideshow"
            >
              <X />
            </HeaderButton>
          </HeaderSideRight>
        </SlideshowHeaderContent>
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
