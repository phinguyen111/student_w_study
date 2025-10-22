// components/user/UserProfileCard.tsx

"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload } from "lucide-react";
import React from 'react';

export default function UserProfileCard() {
  const [isEditing, setIsEditing] = React.useState(false);
  
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Cập nhật ảnh đại diện và chi tiết hồ sơ của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 mb-6">
          <img 
            src="https://i.pravatar.cc/150?img=1" 
            alt="Avatar" 
            className="w-24 h-24 rounded-full border-4 border-primary shadow-lg" 
          />
          <Button variant="outline" size="sm" disabled={!isEditing}>
            <Upload className="h-4 w-4 mr-2" /> 
            Tải ảnh mới
          </Button>
        </div>

        <form className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input id="name" defaultValue="Dev Luyện" disabled={!isEditing} />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="dev.luyen@example.com" disabled />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="bio">Mô tả bản thân</Label>
            <textarea 
                id="bio" 
                rows={3} 
                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="Một lập trình viên đang học hỏi và chia sẻ kiến thức."
                disabled={!isEditing}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" /> 
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}