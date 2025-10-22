// frontend/components/layout/ClientHeaderAuth.tsx
'use client'; 
// Đảm bảo mọi thứ bên trong file này là client-side

import UserAuth from "./UserAuth"; 

export default function ClientHeaderAuth() {
  // Chỉ đơn giản là render component UserAuth
  return <UserAuth />;
}