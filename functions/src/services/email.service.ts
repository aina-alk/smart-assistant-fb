/**
 * Service d'envoi d'emails via Resend
 */

import { Resend } from 'resend';
import { config, resendApiKey } from '../config';
import { UserData } from '../types';
import { getConfirmationEmailTemplate } from '../templates/confirmation';
import { getAdminNotificationTemplate } from '../templates/admin-notification';
import { getWelcomeEmailTemplate } from '../templates/welcome';
import { getRejectionEmailTemplate } from '../templates/rejection';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = resendApiKey.value();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY non configurée');
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
