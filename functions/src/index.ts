/**
 * Cloud Functions pour Selav
 * Système d'autorisation avec circuit d'entretien
 */

import { initializeApp } from 'firebase-admin/app';

// Initialiser Firebase Admin
initializeApp();

// Triggers Firestore
export { onUserCreated } from './triggers/onUserCreated';
export { onUserStatusChanged } from './triggers/onUserStatusChanged';

// Callable Functions
export { approveUser } from './callables/approveUser';
export { rejectUser } from './callables/rejectUser';
export { updateUserStatus } from './callables/updateUserStatus';
export { getAdminStats } from './callables/getAdminStats';
export { retryUserCreated } from './callables/retryUserCreated';
