/**
 * Service de logging d'audit pour traçabilité des actions
 */
import { AuditAction, AuditLog } from '../types';
interface CreateAuditLogParams {
    action: AuditAction;
    targetUserId: string;
    performedBy: string;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
/**
 * Crée une entrée dans le journal d'audit
 */
export declare function createAuditLog({ action, targetUserId, performedBy, changes, metadata, }: CreateAuditLogParams): Promise<string>;
/**
 * Récupère les logs d'audit pour un utilisateur
 */
export declare function getAuditLogsForUser(userId: string): Promise<AuditLog[]>;
/**
 * Récupère les derniers logs d'audit (pour admin)
 */
export declare function getRecentAuditLogs(limit?: number): Promise<AuditLog[]>;
export {};
