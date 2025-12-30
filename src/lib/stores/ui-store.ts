/**
 * UI Store - État global de l'interface utilisateur
 * Gère la sidebar mobile et le breadcrumb
 */

import { create } from 'zustand';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface UIState {
  // Sidebar mobile
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Breadcrumb
  breadcrumb: BreadcrumbItem[];
  setBreadcrumb: (items: BreadcrumbItem[]) => void;
  clearBreadcrumb: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar mobile - fermée par défaut
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Breadcrumb
  breadcrumb: [],
  setBreadcrumb: (items) => set({ breadcrumb: items }),
  clearBreadcrumb: () => set({ breadcrumb: [] }),
}));
