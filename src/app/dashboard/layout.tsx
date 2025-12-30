/**
 * Dashboard Layout - Simple wrapper pour le redirector
 * Les dashboards sont maintenant sous /{role}/
 */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
