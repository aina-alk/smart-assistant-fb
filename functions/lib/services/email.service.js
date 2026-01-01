"use strict";
/**
 * Service d'envoi d'emails via Resend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmationEmail = sendConfirmationEmail;
exports.sendAdminNotification = sendAdminNotification;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendRejectionEmail = sendRejectionEmail;
exports.sendAdminStatusChangeNotification = sendAdminStatusChangeNotification;
const resend_1 = require("resend");
const config_1 = require("../config");
const confirmation_1 = require("../templates/confirmation");
const admin_notification_1 = require("../templates/admin-notification");
const admin_status_change_1 = require("../templates/admin-status-change");
const welcome_1 = require("../templates/welcome");
const rejection_1 = require("../templates/rejection");
let resendClient = null;
function getResendClient() {
    if (!resendClient) {
        const apiKey = (0, config_1.getResendApiKey)();
        if (!apiKey) {
            console.warn('RESEND_API_KEY non configurée - emails désactivés');
            return null;
        }
        resendClient = new resend_1.Resend(apiKey);
    }
    return resendClient;
}
/**
 * Envoie un email de confirmation au candidat
 */
async function sendConfirmationEmail(user) {
    const resend = getResendClient();
    if (!resend) {
        console.warn(`[SKIP] Email de confirmation pour ${user.email} - Resend non configuré`);
        return;
    }
    const template = (0, confirmation_1.getConfirmationEmailTemplate)(user);
    try {
        await resend.emails.send({
            from: config_1.config.resend.fromEmail,
            to: user.email,
            subject: template.subject,
            html: template.html,
        });
        console.warn(`Email de confirmation envoyé à ${user.email}`);
    }
    catch (error) {
        console.error('Erreur envoi email confirmation:', error);
        throw error;
    }
}
/**
 * Envoie une notification à l'admin pour une nouvelle demande
 */
async function sendAdminNotification(user, userId) {
    const resend = getResendClient();
    if (!resend) {
        console.warn(`[SKIP] Notification admin pour ${user.email} - Resend non configuré`);
        return;
    }
    const template = (0, admin_notification_1.getAdminNotificationTemplate)(user, userId);
    try {
        await resend.emails.send({
            from: config_1.config.resend.fromEmail,
            to: config_1.config.resend.adminEmail,
            subject: template.subject,
            html: template.html,
        });
        console.warn(`Notification admin envoyée pour ${user.email}`);
    }
    catch (error) {
        console.error('Erreur envoi notification admin:', error);
        throw error;
    }
}
/**
 * Envoie un email de bienvenue au compte approuvé
 */
async function sendWelcomeEmail(user) {
    const resend = getResendClient();
    if (!resend) {
        console.warn(`[SKIP] Email bienvenue pour ${user.email} - Resend non configuré`);
        return;
    }
    const template = (0, welcome_1.getWelcomeEmailTemplate)(user);
    try {
        await resend.emails.send({
            from: config_1.config.resend.fromEmail,
            to: user.email,
            subject: template.subject,
            html: template.html,
        });
        console.warn(`Email de bienvenue envoyé à ${user.email}`);
    }
    catch (error) {
        console.error('Erreur envoi email bienvenue:', error);
        throw error;
    }
}
/**
 * Envoie un email de refus au candidat
 */
async function sendRejectionEmail(user) {
    const resend = getResendClient();
    if (!resend) {
        console.warn(`[SKIP] Email refus pour ${user.email} - Resend non configuré`);
        return;
    }
    const template = (0, rejection_1.getRejectionEmailTemplate)(user);
    try {
        await resend.emails.send({
            from: config_1.config.resend.fromEmail,
            to: user.email,
            subject: template.subject,
            html: template.html,
        });
        console.warn(`Email de refus envoyé à ${user.email}`);
    }
    catch (error) {
        console.error('Erreur envoi email refus:', error);
        throw error;
    }
}
/**
 * Envoie une notification à l'admin pour un changement de statut
 */
async function sendAdminStatusChangeNotification(user, userId, oldStatus, newStatus, performedBy) {
    const resend = getResendClient();
    if (!resend) {
        console.warn(`[SKIP] Notification admin changement statut pour ${user.email} - Resend non configuré`);
        return;
    }
    const template = (0, admin_status_change_1.getAdminStatusChangeTemplate)(user, userId, oldStatus, newStatus, performedBy);
    try {
        await resend.emails.send({
            from: config_1.config.resend.fromEmail,
            to: config_1.config.resend.adminEmail,
            subject: template.subject,
            html: template.html,
        });
        console.warn(`Notification admin envoyée: ${user.email} ${oldStatus} → ${newStatus}`);
    }
    catch (error) {
        console.error('Erreur envoi notification admin changement statut:', error);
        throw error;
    }
}
//# sourceMappingURL=email.service.js.map