"use strict";
/**
 * Service de logging d'audit pour traçabilité des actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.getAuditLogsForUser = getAuditLogsForUser;
exports.getRecentAuditLogs = getRecentAuditLogs;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Crée une entrée dans le journal d'audit
 */
async function createAuditLog({ action, targetUserId, performedBy, changes, metadata, }) {
    const auditLog = {
        action,
        targetUserId,
        performedBy,
        timestamp: firestore_1.FieldValue.serverTimestamp(),
        changes,
        metadata,
    };
    const docRef = await db.collection('audit_logs').add(auditLog);
    console.warn(`Audit log créé: ${action} sur ${targetUserId} par ${performedBy}`);
    return docRef.id;
}
/**
 * Récupère les logs d'audit pour un utilisateur
 */
async function getAuditLogsForUser(userId) {
    const snapshot = await db
        .collection('audit_logs')
        .where('targetUserId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}
/**
 * Récupère les derniers logs d'audit (pour admin)
 */
async function getRecentAuditLogs(limit = 100) {
    const snapshot = await db
        .collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}
//# sourceMappingURL=audit.service.js.map