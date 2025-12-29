/**
 * Configuration des Cloud Functions
 */

import { defineString } from 'firebase-functions/params';

// Paramètres secrets (définis via Firebase CLI)
export const resendApiKey = defineString('RESEND_API_KEY');

// Configuration de l'application
export const config = {
  resend: {
    fromEmail: 'Super Assistant Médical <contact@superassistant.fr>',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@superassistant.fr',
  },
  app: {
    name: 'Super Assistant Médical',
    url: process.env.APP_URL || 'https://app.superassistant.fr',
    adminUrl: process.env.APP_URL
      ? `${process.env.APP_URL}/admin`
      : 'https://app.superassistant.fr/admin',
  },
};
