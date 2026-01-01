/**
 * Template Email : Notification Admin (changement de statut)
 */
import { UserData, UserStatus } from '../types';
export declare function getAdminStatusChangeTemplate(user: UserData, userId: string, oldStatus: UserStatus, newStatus: UserStatus, performedBy?: string): {
    subject: string;
    html: string;
};
