/**
 * Template Email 2 : Notification Admin (nouvelle demande)
 */

import { UserData, CallbackSlot } from '../types';
import { config } from '../config';

function formatSlots(slots: CallbackSlot[]): string {
  const slotLabels: Record<CallbackSlot, string> = {
    morning: 'Matin (9h-12h)',
    afternoon: 'Après-midi (14h-17h)',
    evening: 'Soir (17h-19h)',
  };
  return slots.map((slot) => slotLabels[slot]).join(', ');
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    medecin: 'Médecin',
    secretaire: 'Secrétaire médical(e)',
    technicien: 'Technicien',
    admin: 'Administrateur',
  };
  return labels[role] || role;
}

export function getAdminNotificationTemplate(user: UserData, userId: string) {
  return {
    subject: `Nouvelle demande - ${user.displayName} (${getRoleLabel(user.role)})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Super Assistant Médical</h1>
          <p style="color: #6b7280; margin-top: 5px;">Administration</p>
        </div>

        <h2 style="color: #1f2937;">Nouvelle demande d'inscription</h2>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Candidat</h3>
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
              <td style="padding: 8px 0; color: #6b7280;"><strong>Téléphone :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.phone}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Profil demandé</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 120px;"><strong>Rôle :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${getRoleLabel(user.role)}</td>
            </tr>
            ${
              user.medecinData
                ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>RPPS :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.medecinData.rpps}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Spécialité :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.medecinData.specialty}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Secteur :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.medecinData.sector}</td>
            </tr>
            `
                : ''
            }
            ${
              user.secretaireData
                ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Superviseur :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.secretaireData.supervisorName}</td>
            </tr>
            `
                : ''
            }
            ${
              user.technicienData
                ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Spécialisation :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.technicienData.specialization}</td>
            </tr>
            `
                : ''
            }
          </table>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Disponibilités pour l'entretien</h3>
          <p style="color: #1f2937; margin: 0;">${formatSlots(user.callbackSlots)}</p>
          ${
            user.callbackNote
              ? `
          <h4 style="color: #374151; margin-top: 15px; margin-bottom: 5px;">Commentaire :</h4>
          <p style="color: #1f2937; margin: 0; font-style: italic;">"${user.callbackNote}"</p>
          `
              : ''
          }
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.adminUrl}/users/${userId}"
             style="background: #2563eb; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: bold;">
            Voir la demande
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
