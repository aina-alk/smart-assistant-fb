/**
 * NavLinks - Rendu des liens de navigation
 * Accepte les items en prop pour navigation dynamique par rôle
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/navigation/nav-config';

interface NavLinksProps {
  items: NavItem[];
  homeHref: string;
  onNavigate?: () => void;
  className?: string;
}

export function NavLinks({ items, homeHref, onNavigate, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {items.map((item) => {
        const isActive =
          item.href === homeHref
            ? pathname === homeHref
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
