'use client'; // <<< Nếu muốn giữ AppHeader đơn giản

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import UserAuth from "./UserAuth"; // Import component logic User/Login

// Navigation Links (Giữ nguyên)
const navLinks = [
  { href: "/learn", label: "Khóa học" },
  { href: "/me/progress", label: "Tiến độ của tôi" },
  { href: "/community", label: "Cộng đồng" },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary" />
          <span className="text-xl font-extrabold tracking-tight dark:text-white">LearnCode</span>
        </Link>
        
        {/* MAIN NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href} 
              passHref 
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* USER/LOGIN COMPONENT */}
        <UserAuth />
      </div>
    </header>
  );
}