/**
 * NavLinks - Configuration et rendu des liens de navigation
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, CheckSquare, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Accueil', href: '/dashboard', icon: Home },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Consultation', href: '/dashboard/consultation/new', icon: FileText },
  { label: 'Tâches', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

interface NavLinksProps {
  onNavigate?: () => void;
  className?: string;
}

export function NavLinks({ onNavigate, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
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

export { navItems };
