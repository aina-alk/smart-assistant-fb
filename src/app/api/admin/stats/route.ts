/**
 * API Route : Statistiques pour le dashboard admin
 * GET /api/admin/stats
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb, verifySessionCookie } from '@/lib/firebase/admin';
import type { UserStatus } from '@/types/user';

interface AdminStats {
  totalUsers: number;
  byStatus: Record<UserStatus, number>;
  byRole: Record<string, number>;
  pendingActions: number;
  recentActivity: {
    newUsersLast7Days: number;
    approvedLast7Days: number;
    rejectedLast7Days: number;
  };
}

export async function GET() {
  try {
    // Vérifier l'authentification via le cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    if (!decodedClaims) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // Vérifier les droits admin
    if (decodedClaims.role !== 'admin') {
      return NextResponse.json({ error: 'Droits administrateur requis' }, { status: 403 });
    }

    // Récupérer tous les utilisateurs
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();

    // Initialiser les compteurs
    const stats: AdminStats = {
      totalUsers: 0,
      byStatus: {
        pending_call: 0,
        in_review: 0,
        pending_callback: 0,
        pending_info: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
      },
      byRole: {
        admin: 0,
        medecin: 0,
        secretaire: 0,
        technicien: 0,
      },
      pendingActions: 0,
      recentActivity: {
        newUsersLast7Days: 0,
        approvedLast7Days: 0,
        rejectedLast7Days: 0,
      },
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Parcourir tous les utilisateurs
    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.totalUsers++;

      // Compter par statut
      const status = data.status as UserStatus;
      if (stats.byStatus[status] !== undefined) {
        stats.byStatus[status]++;
      }

      // Compter par rôle
      const role = data.role as string;
      if (stats.byRole[role] !== undefined) {
        stats.byRole[role]++;
      } else {
        stats.byRole[role] = 1;
      }

      // Actions en attente (statuts nécessitant une action admin)
      if (['pending_call', 'in_review', 'pending_callback', 'pending_info'].includes(status)) {
        stats.pendingActions++;
      }

      // Activité récente
      const createdAt = data.createdAt?.toDate?.();
      if (createdAt && createdAt >= sevenDaysAgo) {
        stats.recentActivity.newUsersLast7Days++;
      }

      const approvedAt = data.approvedAt?.toDate?.();
      if (approvedAt && approvedAt >= sevenDaysAgo) {
        stats.recentActivity.approvedLast7Days++;
      }

      const rejectedAt = data.rejectedAt?.toDate?.();
      if (rejectedAt && rejectedAt >= sevenDaysAgo) {
        stats.recentActivity.rejectedLast7Days++;
      }
    });

    console.warn(`Stats admin récupérées par ${decodedClaims.uid}`);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
