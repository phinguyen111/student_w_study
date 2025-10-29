// components/admin/AdminUsageCard.tsx
import Image from "next/image";

export function AdminUsageCard({
  name, email, role, langId,
  active, lastHeartbeatAt, lastLessonId,
  secToday, secTotal, secCurrent
}: {
  name:string; email:string; role:string; langId:string;
  active:boolean; lastHeartbeatAt?:string; lastLessonId?:string;
  secToday:number; secTotal:number; secCurrent:number;
}) {
  const fmt=(s:number)=>new Date(s*1000).toISOString().substr(11,8);
  return (
    <div className="p-4 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            <Image src={`https://api.dicebear.com/9.x/identicon/svg?seed=${email}`} alt={name} fill />
          </div>
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${active?'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-600'}`}>
          {active ? 'Đang xem' : 'Offline'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-500">Ngôn ngữ</div>
          <div className="font-medium">{langId.toUpperCase()}</div>
        </div>
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-500">Hôm nay</div>
          <div className="font-medium">{fmt(secToday)}</div>
        </div>
        <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-500">Tổng</div>
          <div className="font-medium">{fmt(secTotal)}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Bài đang xem: <b>{lastLessonId ?? '—'}</b>
        <span className="ml-2 text-gray-400">({fmt(secCurrent)} bài này)</span>
      </div>
      {lastHeartbeatAt && (
        <div className="mt-1 text-xs text-gray-400">ping: {new Date(lastHeartbeatAt).toLocaleTimeString()}</div>
      )}
    </div>
  );
}
