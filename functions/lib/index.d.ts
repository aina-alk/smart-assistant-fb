/**
 * Cloud Functions pour Super Assistant Médical
 * Système d'autorisation avec circuit d'entretien
 */
export { onUserCreated } from './triggers/onUserCreated';
export { onUserStatusChanged } from './triggers/onUserStatusChanged';
export { approveUser } from './callables/approveUser';
export { rejectUser } from './callables/rejectUser';
export { updateUserStatus } from './callables/updateUserStatus';
export { getAdminStats } from './callables/getAdminStats';
