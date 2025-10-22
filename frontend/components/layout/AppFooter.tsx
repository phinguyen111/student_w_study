// components/layout/AppFooter.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppFooter() {
  return (
    <footer className="border-t bg-card dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">LearnCode</p>
        <p className="text-sm">© {new Date().getFullYear()} LearnCode. Nền tảng học lập trình web hiện đại.</p>
        <div className="mt-4 flex justify-center gap-4">
            <Link href="/privacy-policy" passHref><Button variant="link" className="text-muted-foreground text-sm hover:text-primary">Chính sách bảo mật</Button></Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/terms" passHref><Button variant="link" className="text-muted-foreground text-sm hover:text-primary">Điều khoản sử dụng</Button></Link>
        </div>
      </div>
    </footer>
  );
}