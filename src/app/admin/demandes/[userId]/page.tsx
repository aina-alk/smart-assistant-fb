'use client';

/**
 * Page Détail d'une Demande - Dashboard Admin
 */

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserDetailView } from '@/components/admin/user-detail-view';
import { useUserDetail } from '@/lib/hooks/use-admin-users';
import { ArrowLeft, UserX } from 'lucide-react';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const { userId } = use(params);
  const router = useRouter();
  const { user, isLoading, error } = useUserDetail(userId);

  const handleBack = () => {
    router.push('/admin/demandes');
  };

  const handleSuccess = () => {
    router.push('/admin/demandes');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <UserX className="h-16 w-16 text-gray-300 mx-auto" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Utilisateur non trouvé</h2>
        <p className="mt-2 text-gray-500">
          {error || "Cet utilisateur n'existe pas ou a été supprimé."}
        </p>
        <Button onClick={handleBack} variant="outline" className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <Button
        onClick={handleBack}
        variant="ghost"
        className="gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Button>

      {/* Vue détail */}
      <UserDetailView user={user} onSuccess={handleSuccess} />
    </div>
  );
}
