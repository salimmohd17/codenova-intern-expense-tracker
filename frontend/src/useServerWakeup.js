import { useEffect, useState } from 'react';

const HEALTH_URL = (import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.replace(/\/$/, '').replace(/\/api$/, '') + '/api')
  : 'http://localhost:5002/api') + '/health';

/**
 * Pings the Render backend health endpoint immediately on mount.
 * Render free-tier instances spin down after 15 min of inactivity.
 * The first request can take 30-60 s. This hook retries every 3 s
 * (up to 20 times = 60 s max) so the app shows a friendly banner
 * instead of a broken page while the server wakes up.
 *
 * Returns: 'waking' | 'ready' | 'error'
 */
export function useServerWakeup() {
  const [status, setStatus] = useState('waking');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    async function ping() {
      if (cancelled) return;
      try {
        const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          if (!cancelled) setStatus('ready');
          return;
        }
      } catch {
        // network error or timeout - keep retrying
      }
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        if (!cancelled) setStatus('error');
        return;
      }
      setTimeout(ping, 3000);
    }

    ping(); // fires immediately on page open
    return () => { cancelled = true; };
  }, []);

  return status;
}
