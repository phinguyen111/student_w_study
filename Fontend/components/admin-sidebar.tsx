"use client"

import { cn } from "@/lib/utils"
import { BookOpen, FileText, LayoutDashboard, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/content", label: "Nội dung", icon: BookOpen },
  { href: "/admin/forms", label: "Bài tập", icon: FileText },
  { href: "/admin/submissions", label: "Bài nộp", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-sidebar min-h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">LC</span>
          </div>
          <span className="font-bold text-lg">Admin</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Link href="/learn">
          <button className="w-full px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors">
            Về trang học
          </button>
        </Link>
      </div>
    </aside>
  )
}
