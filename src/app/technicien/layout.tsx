/**
 * Technicien Layout - Dashboard technicien avec protection par rôle
 */

import { RoleGuard } from '@/components/guards';
import { DashboardShell } from '@/components/layout';

export default function TechnicienLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['technicien']}>
      <DashboardShell role="technicien">{children}</DashboardShell>
    </RoleGuard>
  );
}
