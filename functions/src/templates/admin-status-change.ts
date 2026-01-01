/**
 * Template Email : Notification Admin (changement de statut)
 */

import { UserData, UserStatus } from '../types';
import { config } from '../config';

const STATUS_LABELS: Record<UserStatus, string> = {
  pending_call: "En attente d'appel",
  pending_callback: 'En attente de rappel',
  pending_info: "En attente d'informations",
  in_review: 'En cours de revue',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  suspended: 'Suspendu',
};

const STATUS_COLORS: Record<UserStatus, string> = {
  pending_call: '#f59e0b',
  pending_callback: '#f59e0b',
  pending_info: '#f59e0b',
  in_review: '#3b82f6',
  approved: '#10b981',
  rejected: '#ef4444',
  suspended: '#6b7280',
};

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    medecin: 'Médecin',
    secretaire: 'Secrétaire médical(e)',
    technicien: 'Technicien',
    admin: 'Administrateur',
  };
  return labels[role] || role;
}

export function getAdminStatusChangeTemplate(
  user: UserData,
  userId: string,
  oldStatus: UserStatus,
  newStatus: UserStatus,
  performedBy?: string
) {
  const oldLabel = STATUS_LABELS[oldStatus] || oldStatus;
  const newLabel = STATUS_LABELS[newStatus] || newStatus;
  const newColor = STATUS_COLORS[newStatus] || '#6b7280';

  return {
    subject: `[${newLabel}] ${user.displayName} - Changement de statut`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Selav</h1>
          <p style="color: #6b7280; margin-top: 5px;">Administration</p>
        </div>

        <h2 style="color: #1f2937;">Changement de statut utilisateur</h2>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Utilisateur concerné</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 120px;"><strong>Nom :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.displayName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Email :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Rôle :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${getRoleLabel(user.role)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Modification</h3>
          <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
            <span style="background: #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 4px; font-size: 14px;">
              ${oldLabel}
            </span>
            <span style="color: #6b7280;">→</span>
            <span style="background: ${newColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: bold;">
              ${newLabel}
            </span>
          </div>
          ${
            performedBy
              ? `
          <p style="color: #6b7280; font-size: 13px; margin-top: 15px; margin-bottom: 0;">
            Action effectuée par : ${performedBy}
          </p>
          `
              : ''
          }
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.adminUrl}/users/${userId}"
             style="background: #2563eb; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: bold;">
            Voir le profil
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            Email envoyé automatiquement par le système ${config.app.name}
          </p>
        </div>
      </div>
    `,
  };
}
