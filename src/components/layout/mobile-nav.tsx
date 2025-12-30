/**
 * MobileNav - Navigation mobile avec Sheet
 */

'use client';

import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NavLinks } from './nav-links';
import { useUIStore } from '@/lib/stores/ui-store';

export function MobileNav() {
  const { sidebarOpen, closeSidebar } = useUIStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={(open) => !open && closeSidebar()}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle asChild>
            <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">Super Assistant</span>
                <span className="text-xs text-muted-foreground">Médical</span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="px-3 py-4">
          <NavLinks onNavigate={closeSidebar} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <p className="text-center text-xs text-muted-foreground">v0.1.0 — Beta</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
