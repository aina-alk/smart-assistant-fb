/**
 * Hook d'authentification pour accéder au contexte auth
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/components/providers/auth-provider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
}
