/**
 * Template Email 3 : Compte Approuvé (Bienvenue)
 */
import { UserData } from '../types';
export declare function getWelcomeEmailTemplate(user: UserData): {
    subject: string;
    html: string;
};
