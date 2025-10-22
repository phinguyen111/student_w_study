// app/me/profile/page.tsx
import UserProfileSection from '@/components/user/UserProfileSection';
import AppHeader from "@/components/layout/AppHeader"; // Giả định import AppHeader/Footer
import AppFooter from "@/components/layout/AppFooter"; // Giả định import AppHeader/Footer


export default function UserProfilePage() {
  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-10 md:py-16 min-h-screen">
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 dark:text-white">
            Trang cá nhân
        </h1>
        <UserProfileSection />
      </div>
      <AppFooter />
    </>
  );
}