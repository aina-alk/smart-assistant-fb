/**
 * Template Email 3 : Compte Approuvé (Bienvenue)
 */

import { UserData } from '../types';
import { config } from '../config';

export function getWelcomeEmailTemplate(user: UserData) {
  return {
    subject: 'Bienvenue sur Super Assistant Médical !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">Super Assistant Médical</h1>
        </div>

        <h2 style="color: #059669;">Bonjour ${user.displayName},</h2>

        <p style="color: #4b5563; line-height: 1.6;">
          Excellente nouvelle ! Suite à notre entretien, votre compte
          <strong>Super Assistant Médical</strong> est maintenant <strong>actif</strong>.
        </p>

        <div style="background: #d1fae5; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #065f46;">Accéder à votre espace</h3>
          <a href="${config.app.url}"
             style="background: #059669; color: white; padding: 16px 32px;
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            Se connecter
          </a>
          <p style="margin-top: 15px; color: #065f46; font-size: 14px; margin-bottom: 0;">
            Connectez-vous avec : ${user.email}
          </p>
        </div>

        <h3 style="color: #1f2937;">Premiers pas</h3>
        <ol style="color: #4b5563; line-height: 1.8;">
          <li><strong>Créez votre premier patient</strong> (2 min)<br>
            <span style="color: #6b7280; font-size: 14px;">Ajoutez les informations de base d'un patient</span>
          </li>
          <li><strong>Testez la dictée vocale</strong> (3 min)<br>
            <span style="color: #6b7280; font-size: 14px;">Dictez vos observations et laissez l'IA transcrire</span>
          </li>
          <li><strong>Générez votre premier compte-rendu</strong> (1 min)<br>
            <span style="color: #6b7280; font-size: 14px;">L'assistant génère automatiquement le CRC formaté</span>
          </li>
        </ol>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="margin-top: 0; color: #374151;">Besoin d'aide ?</h3>
          <p style="color: #4b5563; margin-bottom: 10px;">Notre équipe est disponible pour vous accompagner :</p>
          <p style="color: #4b5563; margin: 0;">
            <strong>Email :</strong> support@selav.fr
          </p>
        </div>

        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          Bienvenue parmi nous !
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
