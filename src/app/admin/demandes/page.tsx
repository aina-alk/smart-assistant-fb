'use client';

/**
 * Page Liste des Demandes - Dashboard Admin
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from '@/components/admin/stats-cards';
import { UserRequestCard } from '@/components/admin/user-request-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers, useAdminStats } from '@/lib/hooks/use-admin-users';
import type { UserStatus } from '@/types/user';
import { Users, Inbox } from 'lucide-react';

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all';

export default function DemandesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  // Récupérer les stats
  const { stats, isLoading: statsLoading } = useAdminStats();

  // Récupérer les users selon le filtre
  const statusFilter =
    activeTab === 'pending' ? 'pending' : activeTab === 'all' ? 'all' : (activeTab as UserStatus);
  const { users, isLoading: usersLoading } = useAdminUsers({ statusFilter });

  const handleUserClick = (userId: string) => {
    router.push(`/admin/demandes/${userId}`);
  };

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gestion des demandes
        </h1>
        <p className="text-gray-500 mt-1">
          Gérez les demandes d&apos;inscription et les utilisateurs
        </p>
      </div>

      {/* Statistiques */}
      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h2>
        <StatsCards stats={stats} isLoading={statsLoading} />
      </section>

      {/* Filtres */}
      <section>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              En attente
              {stats && (
                <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                  {stats.pendingCall + stats.inReview + stats.pendingCallback + stats.pendingInfo}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approuvés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
            <TabsTrigger value="all">Tous</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Liste des utilisateurs */}
      <section>
        {usersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Inbox className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">Aucune demande pour ce filtre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <UserRequestCard key={user.id} user={user} onClick={() => handleUserClick(user.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
