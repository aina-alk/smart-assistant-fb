'use client';

/**
 * AdminHeader - En-tête du dashboard admin
 */

import { useAuth } from '@/lib/hooks/use-auth';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Dashboard Admin</h1>
              <p className="text-xs text-gray-500">Super Assistant Médical</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.displayName || user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
