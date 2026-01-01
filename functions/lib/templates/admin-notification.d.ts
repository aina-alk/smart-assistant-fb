/**
 * Template Email 2 : Notification Admin (nouvelle demande)
 */
import { UserData } from '../types';
export declare function getAdminNotificationTemplate(user: UserData, userId: string): {
    subject: string;
    html: string;
};
