/**
 * Service d'envoi d'emails via Resend
 */

import { Resend } from 'resend';
import { config, getResendApiKey } from '../config';
import { UserData } from '../types';
import { getConfirmationEmailTemplate } from '../templates/confirmation';
import { getAdminNotificationTemplate } from '../templates/admin-notification';
import { getAdminStatusChangeTemplate } from '../templates/admin-status-change';
import { getWelcomeEmailTemplate } from '../templates/welcome';
import { getRejectionEmailTemplate } from '../templates/rejection';
import { UserStatus } from '../types';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient) {
    const apiKey = getResendApiKey();
    if (!apiKey) {
      console.warn('RESEND_API_KEY non configurée - emails désactivés');
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Envoie un email de confirmation au candidat
 */
export async function sendConfirmationEmail(user: UserData): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[SKIP] Email de confirmation pour ${user.email} - Resend non configuré`);
    return;
  }
  const template = getConfirmationEmailTemplate(user);

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
    console.warn(`Email de confirmation envoyé à ${user.email}`);
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error);
    throw error;
  }
}

/**
 * Envoie une notification à l'admin pour une nouvelle demande
 */
export async function sendAdminNotification(user: UserData, userId: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[SKIP] Notification admin pour ${user.email} - Resend non configuré`);
    return;
  }
  const template = getAdminNotificationTemplate(user, userId);

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: config.resend.adminEmail,
      subject: template.subject,
      html: template.html,
    });
    console.warn(`Notification admin envoyée pour ${user.email}`);
  } catch (error) {
    console.error('Erreur envoi notification admin:', error);
    throw error;
  }
}

/**
 * Envoie un email de bienvenue au compte approuvé
 */
export async function sendWelcomeEmail(user: UserData): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[SKIP] Email bienvenue pour ${user.email} - Resend non configuré`);
    return;
  }
  const template = getWelcomeEmailTemplate(user);

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
    console.warn(`Email de bienvenue envoyé à ${user.email}`);
  } catch (error) {
    console.error('Erreur envoi email bienvenue:', error);
    throw error;
  }
}

/**
 * Envoie un email de refus au candidat
 */
export async function sendRejectionEmail(user: UserData): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[SKIP] Email refus pour ${user.email} - Resend non configuré`);
    return;
  }
  const template = getRejectionEmailTemplate(user);

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
    console.warn(`Email de refus envoyé à ${user.email}`);
  } catch (error) {
    console.error('Erreur envoi email refus:', error);
    throw error;
  }
}

/**
 * Envoie une notification à l'admin pour un changement de statut
 */
export async function sendAdminStatusChangeNotification(
  user: UserData,
  userId: string,
  oldStatus: UserStatus,
  newStatus: UserStatus,
  performedBy?: string
): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[SKIP] Notification admin changement statut pour ${user.email} - Resend non configuré`
    );
    return;
  }
  const template = getAdminStatusChangeTemplate(user, userId, oldStatus, newStatus, performedBy);

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: config.resend.adminEmail,
      subject: template.subject,
      html: template.html,
    });
    console.warn(`Notification admin envoyée: ${user.email} ${oldStatus} → ${newStatus}`);
  } catch (error) {
    console.error('Erreur envoi notification admin changement statut:', error);
    throw error;
  }
}
