"use strict";
/**
 * Template Email 1 : Confirmation Demande (au candidat)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfirmationEmailTemplate = getConfirmationEmailTemplate;
const config_1 = require("../config");
function formatSlots(slots) {
    const slotLabels = {
        morning: 'Matin (9h-12h)',
        afternoon: 'Après-midi (14h-17h)',
        evening: 'Soir (17h-19h)',
    };
    return slots.map((slot) => slotLabels[slot]).join(', ');
}
function getRoleLabel(role) {
    const labels = {
        medecin: 'Médecin',
        secretaire: 'Secrétaire médical(e)',
        technicien: 'Technicien',
        admin: 'Administrateur',
    };
    return labels[role] || role;
}
function getConfirmationEmailTemplate(user) {
    return {
        subject: "Demande d'accès reçue - Super Assistant Médical",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Super Assistant Médical</h1>
        </div>

        <h2 style="color: #1f2937;">Bonjour ${user.displayName},</h2>

        <p style="color: #4b5563; line-height: 1.6;">
          Nous avons bien reçu votre demande d'accès à <strong>Super Assistant Médical</strong>.
        </p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Récapitulatif de votre demande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Profil :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${getRoleLabel(user.role)}</td>
            </tr>
            ${user.medecinData
            ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>N° RPPS :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.medecinData.rpps}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Spécialité :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.medecinData.specialty}</td>
            </tr>
            `
            : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Téléphone :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${user.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Créneaux :</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${formatSlots(user.callbackSlots)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Prochaine étape</h3>
          <p style="color: #1e40af; margin-bottom: 10px;">
            Un membre de notre équipe vous contactera <strong>sous 48 heures ouvrées</strong>
            pour un bref entretien de présentation (5-10 minutes).
          </p>
          <p style="color: #1e40af; margin-bottom: 0;">Cet échange nous permettra de :</p>
          <ul style="color: #1e40af; margin-top: 5px;">
            <li>Vérifier vos informations professionnelles</li>
            <li>Vous présenter les fonctionnalités</li>
            <li>Répondre à vos questions</li>
          </ul>
        </div>

        <p style="color: #4b5563; line-height: 1.6;">À très bientôt !</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">
            <strong>L'équipe ${config_1.config.app.name}</strong>
          </p>
        </div>
      </div>
    `,
    };
}
//# sourceMappingURL=confirmation.js.map