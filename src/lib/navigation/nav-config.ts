/**
 * Configuration de navigation par rôle
 */

import {
  Home,
  Users,
  FileText,
  CheckSquare,
  Settings,
  Calendar,
  UserCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/user';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  medecin: [
    { label: 'Accueil', href: '/medecin', icon: Home },
    { label: 'Patients', href: '/medecin/patients', icon: Users },
    { label: 'Consultation', href: '/medecin/consultation/new', icon: FileText },
    { label: 'Tâches', href: '/medecin/tasks', icon: CheckSquare },
    { label: 'Paramètres', href: '/medecin/settings', icon: Settings },
  ],
  admin: [
    { label: 'Accueil', href: '/admin', icon: Home },
    { label: 'Demandes', href: '/admin/demandes', icon: UserCheck },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
  ],
  secretaire: [
    { label: 'Accueil', href: '/secretaire', icon: Home },
    { label: 'Agenda', href: '/secretaire/agenda', icon: Calendar },
    { label: 'Patients', href: '/secretaire/patients', icon: Users },
    { label: 'Tâches', href: '/secretaire/tasks', icon: CheckSquare },
    { label: 'Paramètres', href: '/secretaire/settings', icon: Settings },
  ],
  technicien: [
    { label: 'Accueil', href: '/technicien', icon: Home },
    { label: 'Examens', href: '/technicien/examens', icon: FileText },
    { label: 'Équipements', href: '/technicien/equipements', icon: Wrench },
    { label: 'Tâches', href: '/technicien/tasks', icon: CheckSquare },
    { label: 'Paramètres', href: '/technicien/settings', icon: Settings },
  ],
};

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_CONFIG[role] || [];
}

export function getRoleHomeUrl(role: UserRole): string {
  return `/${role}`;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    medecin: 'Médecin',
    admin: 'Administrateur',
    secretaire: 'Secrétaire',
    technicien: 'Technicien',
  };
  return labels[role] || role;
}
