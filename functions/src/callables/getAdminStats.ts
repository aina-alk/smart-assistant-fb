/**
 * Callable Function : Statistiques pour le dashboard admin
 * Réservée aux admins
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { CustomClaims, UserStatus } from '../types';

const db = getFirestore();

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

export const getAdminStats = onCall(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }

  // Vérifier les droits admin
  const callerClaims = request.auth.token as CustomClaims;
  if (callerClaims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Droits administrateur requis');
  }

  try {
    const usersRef = db.collection('users');
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

    console.warn(`Stats admin récupérées par ${request.auth.uid}`);

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    throw new HttpsError('internal', 'Erreur lors de la récupération des statistiques');
  }
});
