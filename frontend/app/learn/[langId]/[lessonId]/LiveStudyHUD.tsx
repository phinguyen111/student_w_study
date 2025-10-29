// 'use client';

// import { useEffect, useMemo, useState } from 'react';

// const API_BASE =
//   (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
//   'http://localhost:4000';

// export default function LiveStudyHUD({ lessonId }: { lessonId: string }) {
//   const [visible, setVisible] = useState(true);
//   const [lastPingAt, setLastPingAt] = useState<number | null>(null);
//   const [added, setAdded] = useState(0);
//   const [total, setTotal] = useState(0);
//   const [lastMsg, setLastMsg] = useState<string>('');   // dòng debug
//   const [lastKind, setLastKind] = useState<'ok'|'warn'|'error'|'info'|''>(''); // loại thông điệp

//   useEffect(() => {
//     if (typeof document !== 'undefined') setVisible(!document.hidden);
//     const onVis = () => setVisible(!document.hidden);
//     document.addEventListener('visibilitychange', onVis);
//     return () => document.removeEventListener('visibilitychange', onVis);
//   }, []);

//   useEffect(() => {
//     const onBeat = (e: Event) => {
//       const ev = e as CustomEvent;
//       const d = (ev && ev.detail) || {};
//       // các thông điệp chung (warn/error/info)
//       if (d.kind && d.kind !== 'ok') {
//         setLastKind(d.kind);
//         setLastMsg(d.msg || `${d.kind}`);
//       }
//       if (d.addedSeconds != null) setAdded(Number(d.addedSeconds));
//       if (d.totalLessonSeconds != null) setTotal(Number(d.totalLessonSeconds));
//       if (d.ts) setLastPingAt(d.ts);
//     };
//     window.addEventListener('timebeat', onBeat as EventListener);
//     return () => window.removeEventListener('timebeat', onBeat as EventListener);
//   }, [lessonId]);

//   const statusText = visible ? 'ĐANG ĐẾM' : 'TẠM DỪNG';
//   const statusColor = visible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600';

//   const fmtHMS = (s: number) => {
//     const x = Math.max(0, Math.floor(s));
//     const h = Math.floor(x / 3600);
//     const m = Math.floor((x % 3600) / 60);
//     const ss = x % 60;
//     const pad = (n: number) => String(n).padStart(2, '0');
//     return `${pad(h)}:${pad(m)}:${pad(ss)}`;
//   };

//   const pingText = useMemo(() => (lastPingAt ? new Date(lastPingAt).toLocaleTimeString() : '—'), [lastPingAt]);

//   // nút test: gửi 1 nhịp ngay (dùng token trong app – TimeTrackerClient sẽ gửi đều đặn, nút này chỉ để “ép” khi debug)
//   const triggerManual = () => {
//     window.dispatchEvent(new CustomEvent('timebeat', { detail: { kind: 'info', msg: 'Yêu cầu gửi nhịp… (ấn F12 → Network để xem)' } }));
//     // client sẽ gửi theo interval; để ép gửi liền, bạn có thể tạm mở console và chạy:
//     // window.dispatchEvent(new CustomEvent('timebeat_force'))
//   };

//   return (
//     <div className="sticky top-14 z-40">
//       <div className="mx-auto max-w-screen-lg px-4">
//         <div className="mt-3 flex items-center gap-3 rounded-xl border bg-white/90 dark:bg-gray-900/90 backdrop-blur p-3 shadow-sm">
//           <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
//           <div className="text-sm text-gray-700 dark:text-gray-200">
//             Bài hiện tại: <b>{lessonId}</b>
//           </div>
//           <div className="ml-auto flex items-center gap-4 text-sm">
//             <div className="text-gray-600 dark:text-gray-300"><span className="opacity-70">Nhịp mới nhất: </span><b>{pingText}</b></div>
//             <div className="text-gray-600 dark:text-gray-300"><span className="opacity-70">+giây lần nhịp: </span><b>{added}</b></div>
//             <div className="text-gray-600 dark:text-gray-300"><span className="opacity-70">Tổng bài (server): </span><b title={`${total} giây`}>{fmtHMS(total)}</b></div>
//             <button onClick={triggerManual} className="px-2 py-1 border rounded hover:bg-gray-50">Gửi nhịp ngay</button>
//           </div>
//         </div>

//         {/* dòng debug ngắn gọn */}
//         {lastKind && (
//           <div className={`mt-1 text-xs ${lastKind==='error' ? 'text-red-600' : lastKind==='warn' ? 'text-amber-600' : 'text-gray-500'}`}>
//             Debug: {lastMsg}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
