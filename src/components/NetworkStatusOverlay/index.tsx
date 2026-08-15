import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const RECONNECT_DELAY_MS = 2000;
const POLL_INTERVAL_MS = 3000;

async function checkConnectivity(): Promise<boolean> {
  try {
    // Derive probe path from current location to support path-prefixed deployments
    // e.g. /superset1/health instead of /health
    const appRoot = window.location.pathname.replace(/^(\/[^/]+)\/.*$/, '$1');
    const resp = await fetch(`${appRoot}/health`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
    });
    // Consider reachable if we get any HTTP response (even 4xx means server is up)
    return resp.ok || resp.status === 401 || resp.status === 403 || resp.status === 405;
  } catch {
    return false;
  }
}

const NetworkStatusOverlay: React.FC = () => {
  const [offline, setOffline] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stopPoll = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const goOnline = () => {
      setOffline(false);
      stopPoll();
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(
        () => window.location.reload(),
        RECONNECT_DELAY_MS,
      );
    };

    const goOffline = () => {
      setOffline(true);
      if (!pollRef.current) {
        pollRef.current = setInterval(async () => {
          const alive = await checkConnectivity();
          if (alive) goOnline();
        }, POLL_INTERVAL_MS);
      }
    };

    const handleOffline = () => goOffline();
    const handleOnline = async () => {
      const alive = await checkConnectivity();
      if (alive) goOnline();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check immediately on mount — small delay so the page settles first
    const initialCheck = setTimeout(() => {
      if (!navigator.onLine) {
        goOffline();
      } else {
        checkConnectivity().then(alive => {
          if (!alive) goOffline();
        });
      }
    }, 1500);

    return () => {
      clearTimeout(initialCheck);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      stopPoll();
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, []);

  if (!offline) return null;

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
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                .message {
                  text-align: center;
                  color: white;
                  padding: 2rem;
                }
                .message h1 {
                  font-size: 3rem;
                  margin: 0 0 1rem 0;
                }
                .message p {
                  font-size: 1.2rem;
                  opacity: 0.9;
                }
              </style>
            </head>
            <body>
              <div class="message">
                <h1>Connection Lost</h1>
                <p>Attempting to reconnect...</p>
              </div>
            </body>
          </html>
        `}
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
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(24, 144, 255, 0.92)',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: '999px',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'sans-serif',
          boxShadow: '0 4px 20px rgba(24,144,255,0.4)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ff4d4f',
            flexShrink: 0,
            animation: 'offlinePulse 1.4s ease-in-out infinite',
          }}
        />
        No internet connection — waiting to reconnect…
      </div>
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

export default NetworkStatusOverlay;
