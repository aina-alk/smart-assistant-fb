/**
 * Configuration des Cloud Functions
 */

// API Key Resend (via variable d'environnement)
export const getResendApiKey = (): string | null => {
  return process.env.RESEND_API_KEY || null;
};

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
