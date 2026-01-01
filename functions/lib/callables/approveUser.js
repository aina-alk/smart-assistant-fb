"use strict";
/**
 * Callable Function : Approuver un utilisateur
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
exports.approveUser = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const audit_service_1 = require("../services/audit.service");
const db = (0, firestore_1.getFirestore)();
exports.approveUser = functions
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
    const { userId, structureId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId requis');
    }
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Utilisateur non trouvé');
        }
        const userData = userDoc.data();
        // Vérifier que l'utilisateur peut être approuvé
        if (userData.status === 'approved') {
            throw new functions.https.HttpsError('failed-precondition', 'Utilisateur déjà approuvé');
        }
        if (userData.status === 'rejected') {
            throw new functions.https.HttpsError('failed-precondition', 'Utilisateur déjà rejeté');
        }
        // Mettre à jour le document utilisateur
        await userRef.update({
            status: 'approved',
            structureId: structureId || userData.structureId || null,
            approvedAt: firestore_1.FieldValue.serverTimestamp(),
            approvedBy: context.auth.uid,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            updatedBy: context.auth.uid,
        });
        // Mettre à jour les Custom Claims
        await (0, auth_1.getAuth)().setCustomUserClaims(userId, {
            role: userData.role,
            status: 'approved',
            structureId: structureId || userData.structureId || null,
        });
        // Audit log
        await (0, audit_service_1.createAuditLog)({
            action: 'user_approved',
            targetUserId: userId,
            performedBy: context.auth.uid,
            changes: {
                oldStatus: userData.status,
                newStatus: 'approved',
                structureId: structureId || null,
            },
            metadata: {
                adminEmail: context.auth.token.email,
                userEmail: userData.email,
            },
        });
        console.warn(`Utilisateur ${userId} approuvé par ${context.auth.uid}`);
        return {
            success: true,
            message: `Utilisateur ${userData.email} approuvé avec succès`,
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error('Erreur approbation utilisateur:', error);
        throw new functions.https.HttpsError('internal', "Erreur lors de l'approbation");
    }
});
//# sourceMappingURL=approveUser.js.map