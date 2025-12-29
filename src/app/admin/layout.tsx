/**
 * Layout Admin - Protège toutes les routes /admin/*
 */

import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
