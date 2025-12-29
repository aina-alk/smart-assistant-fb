'use client';

/**
 * StatsCards - Cartes de statistiques pour le dashboard admin
 */

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
  stats: {
    pendingCall: number;
    inReview: number;
    pendingCallback: number;
    pendingInfo: number;
    approved: number;
    rejected: number;
  } | null;
  isLoading?: boolean;
}

const STAT_CONFIG = [
  { key: 'pendingCall', label: 'À rappeler', icon: '🔴', color: 'text-red-600' },
  { key: 'inReview', label: 'En cours', icon: '🟡', color: 'text-yellow-600' },
  { key: 'pendingCallback', label: 'Rappel prévu', icon: '🟠', color: 'text-orange-600' },
  { key: 'pendingInfo', label: 'Infos manquantes', icon: '🟣', color: 'text-purple-600' },
  { key: 'approved', label: 'Approuvés', icon: '🟢', color: 'text-green-600' },
  { key: 'rejected', label: 'Rejetés', icon: '⚫', color: 'text-gray-600' },
] as const;

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CONFIG.map((config) => (
          <Card key={config.key}>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {STAT_CONFIG.map((config) => (
        <Card key={config.key} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span className={`text-2xl font-bold ${config.color}`}>
                {stats?.[config.key as keyof typeof stats] ?? 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{config.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
