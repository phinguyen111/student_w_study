'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, Edit, Award, Flame, Zap, CheckCircle, Loader2 } from "lucide-react";
import React from 'react';
import { cn } from "@/lib/utils"; 
import { useAuth } from "@/hooks/useAuth"; // <<< SỬ DỤNG HOOK NÀY ĐỂ LẤY DỮ LIỆU THỰC
import Link from 'next/link';

// --- Helper Component: Thẻ Thành tích (Giữ nguyên) ---
const AchievementCard = ({ icon: Icon, title, description, colorClass }: { icon: any, title: string, description: string, colorClass: string }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-4 flex items-start gap-3">
      <div className={cn("p-2 rounded-full", colorClass)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-base">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

// --- Helper Component: Chỉ số Học tập (Giữ nguyên) ---
const StatDisplay = ({ icon: Icon, value, label, color }: { icon: any, value: string | number, label: string, color: string }) => (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
        <Icon className={cn("w-7 h-7 mb-2", color)} />
        <span className="text-2xl font-bold dark:text-white">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
    </div>
);

// Helper function để định dạng ngày tháng
const formatMemberSince = (dateString: string) => {
    if (!dateString) return "Không xác định";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
    } catch (e) {
        return "Không xác định";
    }
}


// --- Main Component ---
export default function UserProfileSection() {
  const [isEditing, setIsEditing] = React.useState(false);
  
  // =================================================================
  // <<< HOÀN THIỆN: SỬ DỤNG DỮ LIỆU THỰC TẾ TỪ useAuth() >>>
  const { user, isLoading } = useAuth(); 
  // =================================================================

  // Dữ liệu giả định cho ACHIEVEMENTS (Vẫn dùng)
  const achievements = [
    { title: "Kẻ Lửa Trại", description: "Duy trì Streak 7 ngày học liên tiếp.", icon: Flame, colorClass: "bg-red-500" },
    { title: "Kỷ Lục Gia", description: "Chuỗi học liên tục đạt 25 ngày!", icon: Flame, colorClass: "bg-orange-500" },
    { title: "Thợ Lặn Sâu", description: "Hoàn thành 50+ bài học.", icon: CheckCircle, colorClass: "bg-green-500" },
  ];
  
  // Xử lý trạng thái Loading
  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Đang tải hồ sơ...</span>
        </div>
    );
  }

  // Xử lý trường hợp chưa đăng nhập
  if (!user) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-500">Truy cập bị từ chối</h2>
            <p className="text-muted-foreground">Vui lòng <Link href="/login" className="text-primary hover:underline">đăng nhập</Link> để xem thông tin hồ sơ của bạn.</p>
        </div>
    );
  }

  // ===============================================
  // LẤY DỮ LIỆU THỰC TỪ USER
  // ===============================================
  const { 
    name, 
    email, 
    avatar: avatarSrc, 
    // Lấy các trường progress từ User.js
    totalXp = 0, 
    currentStreak = 0, 
    lessonsCompletedCount = 0, 
    createdAt 
  } = user;

  // Cập nhật statsData với dữ liệu THẬT
  const statsData = {
    totalLessonsCompleted: lessonsCompletedCount,
    currentStreak: currentStreak, 
    totalXp: totalXp.toLocaleString('en-US') + " XP", 
    memberSince: formatMemberSince(createdAt), 
  };
  // ===============================================


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Cột 1: Thông tin cơ bản & Chỉnh sửa */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Thông tin cá nhân</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-primary">
            <Edit className="h-4 w-4 mr-2" /> 
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </Button>
        </CardHeader>
        <CardContent>
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b dark:border-gray-700">
            {/* Avatar */}
            <div className="relative">
                <img 
                    src={avatarSrc} 
                    alt={name}
                    className="w-28 h-28 rounded-full border-4 border-primary shadow-xl" 
                />
                {isEditing && (
                    <Button size="icon" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary/90">
                        <Upload className="h-4 w-4" />
                    </Button>
                )}
            </div>
            
            {/* Info Summary */}
            <div className="text-center md:text-left space-y-1">
                <h2 className="text-2xl font-extrabold dark:text-white">{name}</h2> 
                <p className="text-muted-foreground">{email}</p> 
                <p className="text-sm italic text-gray-500">Thành viên từ: {statsData.memberSince}</p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Tên hiển thị</Label>
              <Input id="name" defaultValue={name} disabled={!isEditing} /> 
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bio">Mô tả bản thân</Label>
              <textarea 
                  id="bio" 
                  rows={4} 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-text disabled:opacity-80"
                  defaultValue={"Tôi là Dev Luyện, đang nỗ lực học các công nghệ web hiện đại!"} 
                  disabled={!isEditing}
              />
            </div>
            
            {isEditing && (
              <div className="pt-4 flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" /> 
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Cột 2: Chỉ số & Thành tích */}
      <div className="lg:col-span-1 space-y-8">
        
        {/* Chỉ số Học tập */}
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <Zap className="h-5 w-5" /> 
                    Chỉ số Học tập
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    <StatDisplay 
                        icon={Flame} 
                        value={statsData.currentStreak} // Dữ liệu từ user.currentStreak
                        label="Ngày Streak" 
                        color="text-red-500" 
                    />
                    <StatDisplay 
                        icon={CheckCircle} 
                        value={statsData.totalLessonsCompleted} // Dữ liệu từ user.lessonsCompletedCount
                        label="Bài đã hoàn thành" 
                        color="text-green-500" 
                    />
                    <div className="col-span-2">
                        <StatDisplay 
                            icon={Award} 
                            value={statsData.totalXp} // Dữ liệu từ user.totalXp
                            label="Tổng Điểm Kinh Nghiệm (XP)" 
                            color="text-yellow-500" 
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Huy hiệu/Thành tích */}
        <div className="space-y-3">
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Huy hiệu đã đạt
            </h3>
            <div className="space-y-3">
                {achievements.map((ach, index) => (
                    <AchievementCard key={index} {...ach} />
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}