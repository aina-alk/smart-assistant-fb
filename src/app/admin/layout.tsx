/**
 * Admin Layout - Dashboard admin avec protection par rôle
 */

import { RoleGuard } from '@/components/guards';
import { DashboardShell } from '@/components/layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardShell role="admin">{children}</DashboardShell>
    </RoleGuard>
  );
}
