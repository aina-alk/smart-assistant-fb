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
    fromEmail: 'Super Assistant Médical <noreply@selav.fr>',
    adminEmail: process.env.ADMIN_EMAIL || 'support@selav.fr',
  },
  app: {
    name: 'Super Assistant Médical',
    url: process.env.APP_URL || 'https://app.selav.fr',
    adminUrl: process.env.APP_URL ? `${process.env.APP_URL}/admin` : 'https://app.selav.fr/admin',
  },
};
