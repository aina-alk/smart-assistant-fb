/**
 * Dashboard Layout - Layout principal avec sidebar et protection medecin+approved
 */

import { DashboardGuard } from '@/components/dashboard/dashboard-guard';
import { Sidebar, Header, MobileNav } from '@/components/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Main content area */}
        <div className="lg:pl-64">
          <Header />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </DashboardGuard>
  );
}
