"use strict";
/**
 * Trigger Firestore : Changement de statut utilisateur
 * Déclenché lors de la mise à jour d'un document dans /users
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
exports.onUserStatusChanged = void 0;
const functions = __importStar(require("firebase-functions"));
const auth_1 = require("firebase-admin/auth");
const email_service_1 = require("../services/email.service");
const audit_service_1 = require("../services/audit.service");
exports.onUserStatusChanged = functions
    .region('europe-west1')
    .firestore.document('users/{userId}')
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const userId = context.params.userId;
    const oldStatus = beforeData.status;
    const newStatus = afterData.status;
    // Ne rien faire si le statut n'a pas changé
    if (oldStatus === newStatus) {
        return;
    }
    console.warn(`Changement de statut pour ${userId}: ${oldStatus} → ${newStatus}`);
    try {
        // Mettre à jour les Custom Claims
        await (0, auth_1.getAuth)().setCustomUserClaims(userId, {
            role: afterData.role,
            status: newStatus,
            structureId: afterData.structureId || null,
        });
        console.warn(`Custom Claims mis à jour pour ${userId}`);
        // Actions selon le nouveau statut (emails à l'utilisateur)
        await handleStatusChange(userId, afterData, oldStatus, newStatus);
        // Notifier l'admin du changement de statut
        await (0, email_service_1.sendAdminStatusChangeNotification)(afterData, userId, oldStatus, newStatus, afterData.updatedBy || undefined);
        // Logger dans l'audit
        await (0, audit_service_1.createAuditLog)({
            action: 'status_changed',
            targetUserId: userId,
            performedBy: afterData.updatedBy || 'system',
            changes: {
                oldStatus,
                newStatus,
            },
            metadata: {
                email: afterData.email,
            },
        });
    }
    catch (error) {
        console.error(`Erreur changement statut ${userId}:`, error);
        throw error;
    }
});
async function handleStatusChange(userId, userData, _oldStatus, newStatus) {
    switch (newStatus) {
        case 'approved':
            // Compte approuvé → envoyer email de bienvenue
            await (0, email_service_1.sendWelcomeEmail)(userData);
            console.warn(`Email de bienvenue envoyé à ${userData.email}`);
            break;
        case 'rejected':
            // Compte rejeté → envoyer email de refus
            await (0, email_service_1.sendRejectionEmail)(userData);
            console.warn(`Email de refus envoyé à ${userData.email}`);
            break;
        case 'in_review':
            // Passage en revue (après appel)
            console.warn(`Utilisateur ${userId} en cours de revue`);
            break;
        case 'pending_callback':
            // En attente de rappel
            console.warn(`Utilisateur ${userId} en attente de rappel`);
            break;
        case 'pending_info':
            // En attente d'informations complémentaires
            console.warn(`Utilisateur ${userId} en attente d'infos`);
            break;
        default:
            console.warn(`Statut non géré: ${newStatus}`);
    }
}
//# sourceMappingURL=onUserStatusChanged.js.map