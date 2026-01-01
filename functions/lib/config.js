"use strict";
/**
 * Configuration des Cloud Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.getResendApiKey = void 0;
// API Key Resend (via variable d'environnement)
const getResendApiKey = () => {
    return process.env.RESEND_API_KEY || null;
};
exports.getResendApiKey = getResendApiKey;
// Configuration de l'application
exports.config = {
    resend: {
        fromEmail: 'Super Assistant Médical <contact@superassistant.fr>',
        adminEmail: process.env.ADMIN_EMAIL || 'support@selav.fr',
    },
    app: {
        name: 'Super Assistant Médical',
        url: process.env.APP_URL || 'https://app.superassistant.fr',
        adminUrl: process.env.APP_URL
            ? `${process.env.APP_URL}/admin`
            : 'https://app.superassistant.fr/admin',
    },
};
//# sourceMappingURL=config.js.map