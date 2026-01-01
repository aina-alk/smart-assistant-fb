/**
 * Template Email 1 : Confirmation Demande (au candidat)
 */
import { UserData } from '../types';
export declare function getConfirmationEmailTemplate(user: UserData): {
    subject: string;
    html: string;
};
