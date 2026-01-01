/**
 * Trigger Firestore : Nouvelle demande d'inscription
 * Déclenché lors de la création d'un document dans /users
 */
import * as functions from 'firebase-functions';
export declare const onUserCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
