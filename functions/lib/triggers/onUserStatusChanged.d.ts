/**
 * Trigger Firestore : Changement de statut utilisateur
 * Déclenché lors de la mise à jour d'un document dans /users
 */
import * as functions from 'firebase-functions';
export declare const onUserStatusChanged: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
