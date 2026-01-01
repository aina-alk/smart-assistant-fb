/**
 * Template Email 4 : Demande Rejetée
 */

import { UserData } from '../types';
import { config } from '../config';

export function getRejectionEmailTemplate(user: UserData) {
  return {
    subject: 'Suite à votre demande - Super Assistant Médical',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Super Assistant Médical</h1>
        </div>

        <h2 style="color: #1f2937;">Bonjour ${user.displayName},</h2>

        <p style="color: #4b5563; line-height: 1.6;">
          Nous vous remercions pour l'intérêt que vous portez à Super Assistant Médical.
        </p>

        <p style="color: #4b5563; line-height: 1.6;">
          Après examen de votre demande, nous ne sommes malheureusement pas en mesure
          d'y donner une suite favorable pour le moment.
        </p>

        ${
          user.rejectionReason
            ? `
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Motif :</strong> ${user.rejectionReason}
          </p>
        </div>
        `
            : ''
        }

        <p style="color: #4b5563; line-height: 1.6;">
          Si vous pensez qu'il s'agit d'une erreur ou si votre situation évolue,
          n'hésitez pas à nous recontacter à l'adresse suivante :
          <a href="mailto:support@selav.fr" style="color: #2563eb;">support@selav.fr</a>
        </p>

        <p style="color: #4b5563; line-height: 1.6;">
          Cordialement,
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">
            <strong>L'équipe ${config.app.name}</strong>
          </p>
        </div>
      </div>
    `,
  };
}
