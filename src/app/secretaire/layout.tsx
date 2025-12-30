/**
 * Secretaire Layout - Dashboard secrétaire avec protection par rôle
 */

import { RoleGuard } from '@/components/guards';
import { DashboardShell } from '@/components/layout';

export default function SecretaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['secretaire']}>
      <DashboardShell role="secretaire">{children}</DashboardShell>
    </RoleGuard>
  );
}
