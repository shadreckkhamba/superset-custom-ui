import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

declare const process: { env: { LAUNCHER_HTML: string } };
const launcherHtml: string = process.env.LAUNCHER_HTML;

const STANDALONE_PARAM = 'standalone';
const SLIDESHOW_PARAM = 'slideshow';
const RECONNECT_DELAY_MS = 2000;
const POLL_INTERVAL_MS = 3000;

function isPresentationMode(): boolean {
  if (typeof window === 'undefined') return false;
  const query = new URLSearchParams(window.location.search);
  const isStandalone = query.get(STANDALONE_PARAM) === '1';
  const isSlideshow = query.get(SLIDESHOW_PARAM) === '1';
  const isFullscreen = Boolean(document.fullscreenElement);
  return isStandalone || isSlideshow || isFullscreen;
}
// Use lightweight probes so we do not rely only on navigator.onLine.
async function checkConnectivity(): Promise<boolean> {
  const probePaths = ['/health', '/health/', '/favicon.ico'];
  for (const path of probePaths) {
    try {
      const response = await fetch(path, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (
        response.ok ||
        response.status === 401 ||
        response.status === 403 ||
        response.status === 405
      ) {
        return true;
      }
    } catch {
      // Keep probing alternate endpoints.
    }
  }
  return false;
}

const OfflineOverlay: React.FC = () => {
  const [offline, setOffline] = useState(false);
  const [active, setActive] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const offlineRef = useRef(false);
  const checkingRef = useRef(false);
  const reloadingRef = useRef(false);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    offlineRef.current = offline;
  }, [offline]);

  // Track standalone/slideshow/fullscreen state.
  useEffect(() => {
    const update = () => setActive(isPresentationMode());
    update();
    document.addEventListener('fullscreenchange', update);
    window.addEventListener('popstate', update);
    const id = setInterval(update, 1000);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      window.removeEventListener('popstate', update);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!offline) {
      setIframeLoaded(false);
    }
  }, [offline]);

  useEffect(() => {
    if (!active) {
      checkingRef.current = false;
      reloadingRef.current = false;
      offlineRef.current = false;
      setOffline(false);
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
      return undefined;
    }

    const goOnline = () => {
      if (!offlineRef.current) return;

      offlineRef.current = false;
      setOffline(false);

      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
      }
      if (!reloadingRef.current) {
        reloadingRef.current = true;
        reloadTimerRef.current = setTimeout(() => {
          window.location.reload();
        }, RECONNECT_DELAY_MS);
      }
    };

    const goOffline = () => {
      if (reloadingRef.current && reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
        reloadingRef.current = false;
      }

      if (offlineRef.current) return;

      offlineRef.current = true;
      setOffline(true);
    };

    const verifyConnectivity = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        if (!navigator.onLine) {
          goOffline();
          return;
        }

        const reachable = await checkConnectivity();
        if (reachable) {
          goOnline();
        } else {
          goOffline();
        }
      } finally {
        checkingRef.current = false;
      }
    };

    const handleOffline = () => goOffline();
    const handleOnline = () => {
      void verifyConnectivity();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    const pollInterval = setInterval(() => {
      void verifyConnectivity();
    }, POLL_INTERVAL_MS);
    void verifyConnectivity();

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      checkingRef.current = false;
      reloadingRef.current = false;
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
    };
  }, [active]);

  if (!active || !offline) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      <iframe
        srcDoc={launcherHtml}
        title="Offline"
        onLoad={() => setIframeLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          opacity: iframeLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
      <style>{`
        @keyframes offlinePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </div>,
    document.body,
  );
};

export default OfflineOverlay;
