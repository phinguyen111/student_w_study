'use client'; // Thêm directive này vì nó sử dụng hooks

import * as React from 'react'; // <<< Cần import React
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings, User, LogOut, Code2, Loader2 } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth"; // Import hook quản lý trạng thái
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// ----------------------------------------------------------------------
// SỬA LỖI: Component Avatar phải sử dụng React.forwardRef để nhận props từ Trigger
// ----------------------------------------------------------------------
interface AvatarProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, className, ...props }, ref) => (
    <img 
      ref={ref} // <<< CHUYỂN TIẾP REF
      src={src} 
      alt={alt} 
      className={cn(
        "w-10 h-10 rounded-full border-2 border-primary cursor-pointer transition hover:scale-105",
        className
      )} 
      onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/150?img=default' }} // Fallback avatar
      {...props} // <<< CHUYỂN TIẾP TẤT CẢ PROPS (bao gồm onClick, onKeyDown,...)
    />
  )
);
Avatar.displayName = 'Avatar'; // Tên hiển thị cho DevTools


export default function UserAuth() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    // Hiển thị loading khi đang kiểm tra trạng thái ban đầu
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Avatar giờ đây truyền ref và props cho Trigger */}
          <Avatar 
            src={user.avatar || 'https://i.pravatar.cc/150?img=default'} 
            alt={user.name}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold">{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* TRANG CÁ NHÂN */}
          <DropdownMenuItem asChild>
            <Link href="/me/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Trang cá nhân</span>
            </Link>
          </DropdownMenuItem>
          
          {/* CÀI ĐẶT (SETTING) */}
          <DropdownMenuItem asChild>
            <Link href="/me/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </Link>
          </DropdownMenuItem>

          {/* TIẾN ĐỘ HỌC TẬP */}
          <DropdownMenuItem asChild>
            <Link href="/me/progress" className="flex items-center cursor-pointer">
              <Code2 className="mr-2 h-4 w-4" />
              <span>Tiến độ học tập</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout} // Xử lý đăng xuất
            className="flex items-center text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // --- TRẠNG THÁI CHƯA ĐĂNG NHẬP ---
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" passHref>
        <Button size="sm">Đăng nhập</Button> {/* Hiển thị nút Đăng nhập chính */}
      </Link>
      <Link href="/register" passHref className="hidden sm:inline-flex">
        <Button variant="outline" size="sm">Đăng ký</Button>
      </Link>
    </div>
  );
}