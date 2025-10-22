// components/user/UserSettingsForm.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronRight, Save } from "lucide-react";

export default function UserSettingsForm() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Cài đặt Tài khoản & Ứng dụng</CardTitle>
        <CardDescription>Quản lý các tùy chọn thông báo, bảo mật và giao diện.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Cài đặt Chung */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="text-lg font-semibold">Giao diện</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
              <span>Chế độ Tối (Dark Mode)</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">Tự động chuyển đổi dựa trên hệ thống.</span>
            </Label>
            <Switch id="dark-mode" defaultChecked />
          </div>
        </div>

        {/* Cài đặt Thông báo */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="text-lg font-semibold">Thông báo</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notify" className="flex flex-col space-y-1">
              <span>Nhận thông báo qua Email</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">Về bài học mới và cập nhật khóa học.</span>
            </Label>
            <Switch id="email-notify" />
          </div>
        </div>

        {/* Cài đặt Bảo mật */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bảo mật</h3>
          <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer transition">
            <Label className="flex flex-col space-y-1">
              <span>Đổi mật khẩu</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">Cập nhật mật khẩu thường xuyên để tăng cường bảo mật.</span>
            </Label>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" /> 
            Lưu Cài đặt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}