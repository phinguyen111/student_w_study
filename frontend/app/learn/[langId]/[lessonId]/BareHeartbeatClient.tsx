'use client';
import { useEffect, useRef } from 'react';

const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  'http://localhost:4000';

export default function BareHeartbeatClient({ langId, lessonId }: { langId: string; lessonId: string }) {
  const intervalRef = useRef<number | null>(null);
  const lastBeatAtRef = useRef<number>(0);

  const getToken = () => {
    try { return localStorage.getItem('token') || ''; } catch { return ''; }
  };

  const beat = async (why = 'interval', opts?: { keepalive?: boolean }) => {
    const token = getToken();
    if (!token) { console.warn('[HB] skip — no token'); return; }
    if (typeof document !== 'undefined' && document.hidden) { console.log('[HB] skip — tab hidden'); return; }

    try {
      console.log(`[HB] → POST (${why})`, { langId, lessonId, API_BASE });
      const res = await fetch(`${API_BASE}/api/progress/track-heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ langId, lessonId }),
        keepalive: !!opts?.keepalive,
      });

      lastBeatAtRef.current = Date.now();
      if (opts?.keepalive) return;

      const text = await res.text();
      console.log('[HB] ←', res.status, text);
    } catch (e) {
      console.error('[HB] ERROR', e);
    }
  };

  useEffect(() => {
    // nhịp đầu
    const id = window.setTimeout(() => beat('mount'), 0);
    // 15s/nhịp
    intervalRef.current = window.setInterval(() => beat('interval'), 15000);

    const onVisibility = () => { if (!document.hidden) beat('visible'); };
    const onFocus = () => beat('focus');
    const onBeforeUnload = () => {
      if (Date.now() - lastBeatAtRef.current < 2000) return;
      beat('beforeunload', { keepalive: true });
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      clearTimeout(id);
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [langId, lessonId]);

  return null;
}
