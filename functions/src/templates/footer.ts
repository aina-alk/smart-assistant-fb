/**
 * Footer commun pour tous les emails
 * Contient les éléments anti-spam obligatoires
 */

import { config } from '../config';

export const EMAIL_FOOTER_HTML = `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
      Cet email a été envoyé par ${config.app.name}
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
      Selav SAS — 123 Rue de la Santé, 97200 Fort-de-France, Martinique
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      <a href="${config.app.url}" style="color: #6b7280;">selav.fr</a> |
      <a href="mailto:support@selav.fr" style="color: #6b7280;">support@selav.fr</a>
    </p>
  </div>
`;

export const EMAIL_FOOTER_TEXT = `
---
Cet email a été envoyé par ${config.app.name}
Selav SAS — 123 Rue de la Santé, 97200 Fort-de-France, Martinique
selav.fr | support@selav.fr
`;
