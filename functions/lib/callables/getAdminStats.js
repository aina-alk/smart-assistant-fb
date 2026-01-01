"use strict";
/**
 * Callable Function : Statistiques pour le dashboard admin
 * Réservée aux admins
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
exports.getAdminStats = functions
    .region('europe-west1')
    .https.onCall(async (_data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
    }
    // Vérifier les droits admin
    const callerRole = context.auth.token.role;
    if (callerRole !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Droits administrateur requis');
    }
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        // Initialiser les compteurs
        const stats = {
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
            const status = data.status;
            if (stats.byStatus[status] !== undefined) {
                stats.byStatus[status]++;
            }
            // Compter par rôle
            const role = data.role;
            if (stats.byRole[role] !== undefined) {
                stats.byRole[role]++;
            }
            else {
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
        console.warn(`Stats admin récupérées par ${context.auth.uid}`);
        return {
            success: true,
            stats,
        };
    }
    catch (error) {
        console.error('Erreur récupération stats:', error);
        throw new functions.https.HttpsError('internal', 'Erreur lors de la récupération des statistiques');
    }
});
//# sourceMappingURL=getAdminStats.js.map