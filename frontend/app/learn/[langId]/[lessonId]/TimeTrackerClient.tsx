// 'use client';

// import { useEffect, useRef } from 'react';
// import { useAuth } from '@/hooks/useAuth';

// type Props = { langId: string; lessonId: string };
// const API_BASE =
//   (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
//   'http://localhost:4000';

// export default function TimeTrackerClient({ langId, lessonId }: Props) {
//   const { token } = useAuth();
//   const intervalRef = useRef<number | null>(null);
//   const lastBeatAtRef = useRef<number>(0);

//   const report = (payload: any) => {
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('timebeat', { detail: payload }));
//     }
//   };

//   const beat = async (opts?: { keepalive?: boolean; reason?: string }) => {
//     if (!token) {
//       report({ kind: 'warn', msg: 'Không có token (chưa đăng nhập?)' });
//       return;
//     }
//     if (typeof document !== 'undefined' && document.hidden) {
//       report({ kind: 'info', msg: 'Tab ẩn → tạm dừng gửi' });
//       return;
//     }

//     const startedAt = Date.now();
//     try {
//       const res = await fetch(`${API_BASE}/api/progress/track-heartbeat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ langId, lessonId }),
//         keepalive: !!opts?.keepalive,
//       });

//       lastBeatAtRef.current = Date.now();
//       if (opts?.keepalive) return; // không đọc body khi unload

//       const text = await res.text();
//       let json: any = null;
//       try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

//       if (!res.ok) {
//         report({
//           kind: 'error',
//           msg: `HTTP ${res.status}`,
//           status: res.status,
//           body: text?.slice(0, 200),
//         });
//         return;
//       }

//       report({
//         kind: 'ok',
//         ts: Date.now(),
//         reason: opts?.reason || 'interval',
//         addedSeconds: Number(json?.addedSeconds ?? 0),
//         totalLessonSeconds: Number(json?.totalLessonSeconds ?? 0),
//         tookMs: Date.now() - startedAt,
//       });
//     } catch (e: any) {
//       report({ kind: 'error', msg: e?.message || 'Fetch lỗi (CORS?/Network?)' });
//     }
//   };

//   useEffect(() => {
//     if (!token) return;
//     // gửi nhịp đầu
//     beat({ reason: 'mount' });

//     // gửi mỗi 15s
//     intervalRef.current = window.setInterval(() => beat({ reason: 'interval' }), 15000);

//     const onVisibility = () => {
//       if (typeof document !== 'undefined' && !document.hidden) {
//         beat({ reason: 'visible' });
//       }
//     };
//     const onFocus = () => beat({ reason: 'focus' });
//     const onBeforeUnload = () => {
//       if (Date.now() - lastBeatAtRef.current < 2000) return;
//       beat({ keepalive: true, reason: 'beforeunload' });
//     };

//     document.addEventListener('visibilitychange', onVisibility);
//     window.addEventListener('focus', onFocus);
//     window.addEventListener('beforeunload', onBeforeUnload);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       document.removeEventListener('visibilitychange', onVisibility);
//       window.removeEventListener('focus', onFocus);
//       window.removeEventListener('beforeunload', onBeforeUnload);
//     };
//   }, [token, langId, lessonId]);

//   return null;
// }
