"use client"

import { useEffect, useState, useRef, useMemo, Fragment } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import AppFooter from "@/components/layout/AppFooter"
import {
  Search,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Filter,
  BarChart3,
  TrendingUp,
} from "lucide-react"

// --- Backend Types ---
type UsageRow = {
  user?: { _id: string; name: string; email: string; role: string } | null
  userId?: string
  langId: string
  totalSecondsAllLessons: number
  byLesson?: { lessonId: string; seconds?: number; totalSeconds?: number }[]
  byDay?: { date: string; seconds: number }[]
  lastHeartbeatAt?: string
  lastLessonId?: string
}

type Lesson = { id: string; title: string; order?: number; level?: number; langId: string }

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

// --- Helper Functions ---
const fmtHMS = (s: number) => {
  const x = Math.max(0, Math.floor(s))
  const h = Math.floor(x / 3600)
  const m = Math.floor((x % 3600) / 60)
  const ss = x % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(ss)}`
}

// --- Stats Card Component ---
const StatsCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
    green: "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300",
  }

  return (
    <Card className={`p-6 ${colorClasses[color]} border-0 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </Card>
  )
}

// --- Main Component ---
export default function AdminUsagePage() {
  const { token, user } = useAuth()

  const [data, setData] = useState<UsageRow[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [langId, setLangId] = useState("")

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const lessonTitleCache = useRef<Map<string, Map<string, string>>>(new Map())

  const getKey = (r: UsageRow) => `${r.user?._id || r.userId}-${r.langId}`

  const fetchData = async (filters?: Record<string, string>) => {
    if (!token) {
      setErr("❌ Chưa đăng nhập bằng tài khoản admin.")
      setData([])
      return
    }
    setLoading(true)
    setErr("")
    try {
      const url = new URL("/api/admin/usage", API_BASE)
      if (filters?.from) url.searchParams.set("from", filters.from)
      if (filters?.to) url.searchParams.set("to", filters.to)
      if (filters?.langId) url.searchParams.set("langId", filters.langId)

      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      const rows: UsageRow[] = Array.isArray(json) ? json : json.report || []
      setData(rows)
    } catch (e: any) {
      setErr(e?.message || "Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && user?.role === "admin") fetchData()
  }, [token, user])

  const totalUsers = useMemo(() => new Set(data.map((r) => r.user?._id || r.userId)).size, [data])
  const totalSeconds = useMemo(() => data.reduce((s, r) => s + (r.totalSecondsAllLessons || 0), 0), [data])

  const ensureLessonTitles = async (langId: string) => {
    if (lessonTitleCache.current.has(langId)) return
    const res = await fetch(`${API_BASE}/api/languages/${langId}/lessons`)
    if (!res.ok) throw new Error(`Load lessons thất bại (${langId})`)
    const lessons: Lesson[] = await res.json()
    const m = new Map<string, string>()
    lessons.forEach((l) => m.set(l.id, l.title || l.id))
    lessonTitleCache.current.set(langId, m)
  }

  const getLessonTitle = (langId: string, lessonId: string) => {
    const map = lessonTitleCache.current.get(langId)
    return map?.get(lessonId) || lessonId
  }

  const toggleExpand = async (row: UsageRow) => {
    const key = getKey(row)
    if (!expanded[key]) {
      try {
        await ensureLessonTitles(row.langId)
      } catch (e) {
        console.warn(e)
      }
    }
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSearch = () => {
    fetchData({ from, to, langId })
    setExpanded({})
  }

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                  Báo cáo Sử dụng
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Theo dõi thời gian học của người dùng theo khóa học và từng bài học. Phân tích chi tiết tiến độ học tập.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Bộ lọc */}
            <Card className="p-6 md:p-8 border-0 shadow-md">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bộ Lọc</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Từ ngày</label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Đến ngày</label>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ngôn ngữ (ID)
                    </label>
                    <Input
                      type="text"
                      placeholder="vd: html"
                      value={langId}
                      onChange={(e) => setLangId(e.target.value.toLowerCase())}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleSearch}
                      disabled={loading}
                      className="w-full h-10 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Tìm kiếm
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Error Message */}
            {err && (
              <div className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 animate-fade-in">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{err}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-12 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="font-medium">Đang tải dữ liệu, vui lòng chờ...</p>
              </div>
            )}

            {/* Data Display */}
            {!loading && !err && (
              <>
                {data.length === 0 ? (
                  <div className="text-center p-12 text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">Không có dữ liệu sử dụng nào khớp với bộ lọc.</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <StatsCard icon={Users} label="Tổng người học" value={totalUsers} color="blue" />
                      <StatsCard icon={Clock} label="Tổng thời gian học" value={fmtHMS(totalSeconds)} color="green" />
                    </div>

                    {/* Data Table */}
                    <Card className="p-0 border-0 shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-100 dark:bg-gray-700/70 sticky top-0 z-10">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                              <th className="p-4 w-16">Chi tiết</th>
                              <th className="p-4">Tên người dùng</th>
                              <th className="p-4">Email</th>
                              <th className="p-4 w-20">Ngôn ngữ</th>
                              <th className="p-4 w-32">Bài đang xem</th>
                              <th className="p-4 w-24">Ping cuối</th>
                              <th className="p-4 text-right w-32">Tổng thời gian</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {data.map((r, i) => {
                              const key = getKey(r)
                              const isOpen = !!expanded[key]
                              const perLesson = (r.byLesson || [])
                                .map((x) => ({
                                  lessonId: x.lessonId,
                                  seconds: x.seconds ?? x.totalSeconds ?? 0,
                                }))
                                .sort((a, b) => b.seconds - a.seconds)

                              return (
                                <Fragment key={i}>
                                  {/* Main Row */}
                                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4">
                                      <Button
                                        onClick={() => toggleExpand(r)}
                                        variant="outline"
                                        className="p-1 h-8 w-8 flex justify-center items-center"
                                      >
                                        {isOpen ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                                      {r.user?.name ?? "— (Ẩn danh)"}
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{r.user?.email ?? "—"}</td>
                                    <td className="p-4 text-center">
                                      <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-xs font-semibold">
                                        {r.langId}
                                      </span>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                                      {r.lastLessonId ?? "—"}
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                                      {r.lastHeartbeatAt
                                        ? new Date(r.lastHeartbeatAt).toLocaleTimeString("vi-VN")
                                        : "—"}
                                    </td>
                                    <td className="p-4 text-right font-bold font-mono text-green-600 dark:text-green-400">
                                      {fmtHMS(r.totalSecondsAllLessons || 0)}
                                    </td>
                                  </tr>

                                  {/* Expanded Details Row */}
                                  {isOpen && (
                                    <tr>
                                      <td className="p-0 border-t-2 border-gray-200 dark:border-gray-700" colSpan={7}>
                                        <div className="p-6 bg-gray-50 dark:bg-gray-800/80 space-y-4">
                                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Chi tiết thời gian học theo bài
                                          </h4>
                                          {perLesson.length === 0 ? (
                                            <div className="text-gray-500 italic text-center py-4">
                                              Không có dữ liệu theo bài học trong khoảng thời gian này.
                                            </div>
                                          ) : (
                                            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                                              <table className="min-w-full text-xs divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-white dark:bg-gray-700">
                                                  <tr className="text-left font-medium text-gray-600 dark:text-gray-300">
                                                    <th className="px-4 py-3 w-1/2">Bài học</th>
                                                    <th className="px-4 py-3 text-right">Giây</th>
                                                    <th className="px-4 py-3 text-right">H:M:S</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                  {perLesson.map((pl) => (
                                                    <tr
                                                      key={pl.lessonId}
                                                      className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                        {getLessonTitle(r.langId, pl.lessonId)}
                                                      </td>
                                                      <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-400">
                                                        {pl.seconds}
                                                      </td>
                                                      <td className="px-4 py-3 text-right font-bold font-mono text-green-600 dark:text-green-400">
                                                        {fmtHMS(pl.seconds)}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  )
}
