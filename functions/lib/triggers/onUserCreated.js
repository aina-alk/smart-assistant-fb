"use strict";
/**
 * Trigger Firestore : Nouvelle demande d'inscription
 * Déclenché lors de la création d'un document dans /users
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
exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const auth_1 = require("firebase-admin/auth");
const email_service_1 = require("../services/email.service");
const audit_service_1 = require("../services/audit.service");
exports.onUserCreated = functions
    .region('europe-west1')
    .firestore.document('users/{userId}')
    .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const userData = snapshot.data();
    console.warn(`Nouvelle demande d'inscription: ${userId} - ${userData.email}`);
    try {
        // 1. Définir les Custom Claims initiaux
        await (0, auth_1.getAuth)().setCustomUserClaims(userId, {
            role: userData.role,
            status: 'pending_call',
            structureId: userData.structureId || null,
        });
        console.warn(`Custom Claims définis pour ${userId}`);
        // 2. Envoyer l'email de confirmation au candidat
        await (0, email_service_1.sendConfirmationEmail)(userData);
        // 3. Notifier l'admin
        await (0, email_service_1.sendAdminNotification)(userData, userId);
        // 4. Logger l'action dans l'audit
        await (0, audit_service_1.createAuditLog)({
            action: 'user_created',
            targetUserId: userId,
            performedBy: 'system',
            changes: {
                status: 'pending_call',
                role: userData.role,
            },
            metadata: {
                email: userData.email,
                displayName: userData.displayName,
            },
        });
        console.warn(`Traitement inscription terminé pour ${userId}`);
    }
    catch (error) {
        console.error(`Erreur traitement inscription ${userId}:`, error);
        throw error;
    }
});
//# sourceMappingURL=onUserCreated.js.map