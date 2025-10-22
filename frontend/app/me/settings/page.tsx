// app/me/settings/page.tsx
import UserSettingsForm from '@/components/user/UserSettingsForm';

export default function UserSettingsPage() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Cài đặt</h1>
      <UserSettingsForm />
    </div>
  );
}