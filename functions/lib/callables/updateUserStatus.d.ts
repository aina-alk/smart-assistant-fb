/**
 * Callable Function : Mettre à jour le statut d'un utilisateur
 * Réservée aux admins - pour les statuts intermédiaires
 */
import * as functions from 'firebase-functions';
export declare const updateUserStatus: functions.HttpsFunction & functions.Runnable<any>;
