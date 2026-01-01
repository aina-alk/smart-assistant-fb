"use strict";
/**
 * Callable Function : Mettre à jour le statut d'un utilisateur
 * Réservée aux admins - pour les statuts intermédiaires
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
exports.updateUserStatus = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const audit_service_1 = require("../services/audit.service");
const db = (0, firestore_1.getFirestore)();
// Statuts valides pour cette fonction (hors approve/reject)
const VALID_INTERMEDIATE_STATUSES = [
    'pending_call',
    'in_review',
    'pending_callback',
    'pending_info',
];
exports.updateUserStatus = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
    }
    // Vérifier les droits admin
    const callerRole = context.auth.token.role;
    if (callerRole !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Droits administrateur requis');
    }
    const { userId, newStatus, note } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId requis');
    }
    if (!newStatus) {
        throw new functions.https.HttpsError('invalid-argument', 'newStatus requis');
    }
    // Vérifier que le statut est valide pour cette fonction
    if (!VALID_INTERMEDIATE_STATUSES.includes(newStatus)) {
        throw new functions.https.HttpsError('invalid-argument', `Statut invalide. Utilisez approveUser ou rejectUser pour les statuts finaux. Statuts valides: ${VALID_INTERMEDIATE_STATUSES.join(', ')}`);
    }
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Utilisateur non trouvé');
        }
        const userData = userDoc.data();
        // Vérifier que l'utilisateur n'est pas déjà dans un état final
        if (userData.status === 'approved' || userData.status === 'rejected') {
            throw new functions.https.HttpsError('failed-precondition', "Impossible de modifier le statut d'un utilisateur approuvé ou rejeté");
        }
        // Mettre à jour le document utilisateur
        const updateData = {
            status: newStatus,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            updatedBy: context.auth.uid,
        };
        if (note) {
            updateData.adminNotes = firestore_1.FieldValue.arrayUnion({
                note,
                timestamp: new Date().toISOString(),
                by: context.auth.uid,
            });
        }
        await userRef.update(updateData);
        // Audit log
        await (0, audit_service_1.createAuditLog)({
            action: 'status_changed',
            targetUserId: userId,
            performedBy: context.auth.uid,
            changes: {
                oldStatus: userData.status,
                newStatus,
                note: note || null,
            },
            metadata: {
                adminEmail: context.auth.token.email,
                userEmail: userData.email,
            },
        });
        console.warn(`Statut de ${userId} changé en ${newStatus} par ${context.auth.uid}`);
        return {
            success: true,
            message: `Statut mis à jour: ${newStatus}`,
            oldStatus: userData.status,
            newStatus,
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error('Erreur mise à jour statut:', error);
        throw new functions.https.HttpsError('internal', 'Erreur lors de la mise à jour du statut');
    }
});
//# sourceMappingURL=updateUserStatus.js.map