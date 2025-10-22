'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader"; // Giả định import AppHeader
import AppFooter from "@/components/layout/AppFooter"; // Giả định import AppFooter


export default function LoginPage() {
  // --- STATE QUẢN LÝ FORM ---
  const [email, setEmail] = useState('admin@learncode.com'); // Mặc định Admin
  const [password, setPassword] = useState('123456'); // Mật khẩu Admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- HOOKS ---
  const { login } = useAuth();
  const router = useRouter();

  // --- HÀM XỬ LÝ ĐĂNG NHẬP ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // GỌI API ĐĂNG NHẬP (Sử dụng URL đầy đủ của Backend)
        const res = await fetch('http://localhost:4000/api/auth/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            login(data, data.token); // Lưu thông tin user & token vào useAuth
            router.push('/me/profile'); // Chuyển hướng sau khi đăng nhập thành công
        } else {
            setError(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        }

    } catch (err) {
        // Lỗi mạng hoặc server không phản hồi
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-10 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold dark:text-white">Chào mừng trở lại</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Đăng nhập để tiếp tục hành trình học tập của bạn.
            </CardDescription>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-md border border-yellow-200">
                Tài khoản demo Admin: **admin@learncode.com** / **123456**
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 p-3 bg-red-50/50 dark:bg-red-900/20 rounded-md border border-red-300 font-medium">
                    {error}
                </div>
              )}
              
              <Button type="submit" className="w-full h-10 text-lg shadow-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng nhập <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <AppFooter />
    </>
  );
}