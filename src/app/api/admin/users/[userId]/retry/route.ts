/**
 * API Route : Retraiter une inscription échouée
 * POST /api/admin/users/[userId]/retry
 *
 * Permet de relancer le traitement onUserCreated pour les utilisateurs
 * dont le trigger initial a échoué (ex: erreurs de permissions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, FieldValue, verifySessionCookie } from '@/lib/firebase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification via le cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    if (!decodedClaims) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // Vérifier les droits admin
    if (decodedClaims.role !== 'admin') {
      return NextResponse.json({ error: 'Droits administrateur requis' }, { status: 403 });
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    console.warn(`Retraitement inscription pour ${userId} - ${userData.email}`);

    // 1. Définir les Custom Claims
    await adminAuth.setCustomUserClaims(userId, {
      role: userData.role,
      status: userData.status,
      structureId: userData.structureId || null,
    });
    console.warn(`Custom Claims définis pour ${userId}`);

    // 2. Envoyer l'email de confirmation au candidat
    await resend.emails.send({
      from: 'Super Assistant Médical <noreply@selav.fr>',
      to: userData.email,
      subject: "Votre demande d'inscription a bien été reçue",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Super Assistant Médical</h1>
          <h2>Bonjour ${userData.displayName},</h2>
          <p>Nous avons bien reçu votre demande d'inscription en tant que <strong>${getRoleLabel(userData.role)}</strong>.</p>
          <p>Notre équipe va examiner votre demande et vous contacter prochainement pour un court entretien.</p>
          <p>Vous serez notifié par email dès que votre compte sera validé.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
          </p>
        </div>
      `,
    });
    console.warn(`Email de confirmation envoyé à ${userData.email}`);

    // 3. Notifier l'admin
    const adminEmail = process.env.ADMIN_EMAIL || 'support@selav.fr';
    await resend.emails.send({
      from: 'Super Assistant Médical <noreply@selav.fr>',
      to: adminEmail,
      subject: `[Nouvelle inscription] ${userData.displayName} - ${getRoleLabel(userData.role)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Super Assistant Médical</h1>
          <h2>Nouvelle demande d'inscription</h2>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom :</strong> ${userData.displayName}</p>
            <p><strong>Email :</strong> ${userData.email}</p>
            <p><strong>Téléphone :</strong> ${userData.phone}</p>
            <p><strong>Rôle demandé :</strong> ${getRoleLabel(userData.role)}</p>
          </div>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.selav.fr'}/admin/users/${userId}"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Voir la demande
            </a>
          </p>
        </div>
      `,
    });
    console.warn(`Notification admin envoyée à ${adminEmail}`);

    // 4. Logger l'action dans l'audit
    await adminDb.collection('audit_logs').add({
      action: 'user_created_retry',
      targetUserId: userId,
      performedBy: decodedClaims.uid,
      timestamp: FieldValue.serverTimestamp(),
      changes: {
        status: userData.status,
        role: userData.role,
      },
      metadata: {
        email: userData.email,
        displayName: userData.displayName,
        retryReason: 'Manual retry via admin API',
        adminEmail: decodedClaims.email,
      },
    });

    console.warn(`Retraitement inscription terminé pour ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Inscription retraitée avec succès pour ${userData.email}`,
    });
  } catch (error) {
    console.error('Erreur retraitement inscription:', error);
    return NextResponse.json({ error: 'Erreur lors du retraitement' }, { status: 500 });
  }
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    medecin: 'Médecin',
    secretaire: 'Secrétaire médical(e)',
    technicien: 'Technicien',
    admin: 'Administrateur',
  };
  return labels[role] || role;
}
