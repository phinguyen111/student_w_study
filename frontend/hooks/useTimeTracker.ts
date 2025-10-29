'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  langId: string;
  lessonId: string;
}

export function useTimeTracker({ langId, lessonId }: Props) {
  const { token } = useAuth();
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hàm gửi heartbeat
  const sendHeartbeat = async () => {
    if (!token || !langId || !lessonId) return;
    try {
      const res = await fetch('http://localhost:4000/api/progress/track-heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ langId, lessonId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTotalSeconds(data.totalLessonSeconds || 0);
        setLastUpdate(new Date());
      } else {
        console.warn('[heartbeat error]', data.message);
      }
    } catch (err) {
      console.warn('[heartbeat failed]', err);
    }
  };

  // Interval heartbeat mỗi 30 giây
  useEffect(() => {
    if (!langId || !lessonId) return;
    sendHeartbeat(); // gửi ngay khi bắt đầu
    intervalRef.current = setInterval(sendHeartbeat, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [langId, lessonId, token]);

  // Dừng khi tab không hoạt động
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current);
      } else if (!document.hidden) {
        intervalRef.current = setInterval(sendHeartbeat, 30000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [langId, lessonId, token]);

  return { totalSeconds, lastUpdate };
}
