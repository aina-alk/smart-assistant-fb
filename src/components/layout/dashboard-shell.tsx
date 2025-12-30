/**
 * DashboardShell - Layout wrapper unifié pour tous les dashboards par rôle
 * Combine Sidebar, Header et MobileNav avec navigation dynamique
 */

'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { getNavItemsForRole, getRoleHomeUrl } from '@/lib/navigation/nav-config';
import type { UserRole } from '@/types/user';

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  pageTitle?: string;
}

export function DashboardShell({ children, role, pageTitle }: DashboardShellProps) {
  const navItems = getNavItemsForRole(role);
  const homeHref = getRoleHomeUrl(role);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar navItems={navItems} homeHref={homeHref} />

      {/* Mobile Navigation */}
      <MobileNav navItems={navItems} homeHref={homeHref} />

      {/* Main content area */}
      <div className="lg:pl-64">
        <Header title={pageTitle} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
