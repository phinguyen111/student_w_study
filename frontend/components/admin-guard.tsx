"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    // Simulate checking user role
    // In a real app, this would check authentication state
    const checkAdminRole = async () => {
      // For demo purposes, we'll allow access
      // In production, this would verify JWT token or session
      setIsAdmin(true)
    }

    checkAdminRole()
  }, [])

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Truy cập bị từ chối</CardTitle>
            <CardDescription>Bạn không có quyền truy cập vào trang quản trị</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/learn">
              <Button>Về trang học</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
