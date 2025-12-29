/**
 * API Route : Rejeter un utilisateur
 * POST /api/admin/users/[userId]/reject
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, FieldValue, verifySessionCookie } from '@/lib/firebase/admin';

interface RejectRequest {
  reason?: string;
}

export async function POST(
  request: NextRequest,
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
    const body: RejectRequest = await request.json().catch(() => ({}));
    const { reason } = body;

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

    // Vérifier que l'utilisateur peut être rejeté
    if (userData.status === 'approved') {
      return NextResponse.json(
        { error: 'Impossible de rejeter un utilisateur approuvé' },
        { status: 400 }
      );
    }

    if (userData.status === 'rejected') {
      return NextResponse.json({ error: 'Utilisateur déjà rejeté' }, { status: 400 });
    }

    // Mettre à jour le document utilisateur
    await userRef.update({
      status: 'rejected',
      rejectionReason: reason || null,
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: decodedClaims.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: decodedClaims.uid,
    });

    // Mettre à jour les Custom Claims
    await adminAuth.setCustomUserClaims(userId, {
      role: userData.role,
      status: 'rejected',
      structureId: null,
    });

    // Créer un audit log
    await adminDb.collection('audit_logs').add({
      action: 'user_rejected',
      targetUserId: userId,
      performedBy: decodedClaims.uid,
      timestamp: FieldValue.serverTimestamp(),
      changes: {
        oldStatus: userData.status,
        newStatus: 'rejected',
        reason: reason || null,
      },
      metadata: {
        adminEmail: decodedClaims.email,
        userEmail: userData.email,
      },
    });

    console.warn(`Utilisateur ${userId} rejeté par ${decodedClaims.uid}`);

    return NextResponse.json({
      success: true,
      message: `Utilisateur ${userData.email} rejeté`,
    });
  } catch (error) {
    console.error('Erreur rejet utilisateur:', error);
    return NextResponse.json({ error: 'Erreur lors du rejet' }, { status: 500 });
  }
}
