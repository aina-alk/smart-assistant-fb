/**
 * Medecin Layout - Dashboard médecin avec protection par rôle
 */

import { RoleGuard } from '@/components/guards';
import { DashboardShell } from '@/components/layout';

export default function MedecinLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['medecin']}>
      <DashboardShell role="medecin">{children}</DashboardShell>
    </RoleGuard>
  );
}
