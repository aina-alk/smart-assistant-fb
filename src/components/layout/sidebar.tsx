/**
 * Sidebar - Navigation principale (desktop)
 * Accepte navItems et homeHref pour navigation dynamique par rôle
 */

'use client';

import Link from 'next/link';
import { NavLinks } from './nav-links';
import { BrandMark } from '@/components/brand';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/navigation/nav-config';

interface SidebarProps {
  navItems: NavItem[];
  homeHref: string;
  className?: string;
}

export function Sidebar({ navItems, homeHref, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={homeHref}>
          <BrandMark size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks items={navItems} homeHref={homeHref} />
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-center text-xs text-muted-foreground">v0.1.0 — Beta</p>
      </div>
    </aside>
  );
}
