/**
 * Service d'envoi d'emails via Resend
 */
import { UserData } from '../types';
import { UserStatus } from '../types';
/**
 * Envoie un email de confirmation au candidat
 */
export declare function sendConfirmationEmail(user: UserData): Promise<void>;
/**
 * Envoie une notification à l'admin pour une nouvelle demande
 */
export declare function sendAdminNotification(user: UserData, userId: string): Promise<void>;
/**
 * Envoie un email de bienvenue au compte approuvé
 */
export declare function sendWelcomeEmail(user: UserData): Promise<void>;
/**
 * Envoie un email de refus au candidat
 */
export declare function sendRejectionEmail(user: UserData): Promise<void>;
/**
 * Envoie une notification à l'admin pour un changement de statut
 */
export declare function sendAdminStatusChangeNotification(user: UserData, userId: string, oldStatus: UserStatus, newStatus: UserStatus, performedBy?: string): Promise<void>;
