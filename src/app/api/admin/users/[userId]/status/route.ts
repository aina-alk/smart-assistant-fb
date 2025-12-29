/**
 * API Route : Mettre à jour le statut d'un utilisateur
 * PATCH /api/admin/users/[userId]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb, FieldValue, verifySessionCookie } from '@/lib/firebase/admin';
import type { UserStatus } from '@/types/user';

// Statuts valides pour cette route (hors approve/reject)
const VALID_INTERMEDIATE_STATUSES: UserStatus[] = [
  'pending_call',
  'in_review',
  'pending_callback',
  'pending_info',
];

interface StatusRequest {
  newStatus: UserStatus;
  note?: string;
}

export async function PATCH(
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
    const body: StatusRequest = await request.json();
    const { newStatus, note } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    if (!newStatus) {
      return NextResponse.json({ error: 'newStatus requis' }, { status: 400 });
    }

    // Vérifier que le statut est valide pour cette route
    if (!VALID_INTERMEDIATE_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Statut invalide. Utilisez /approve ou /reject pour les statuts finaux. Statuts valides: ${VALID_INTERMEDIATE_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    // Vérifier que l'utilisateur n'est pas déjà dans un état final
    if (userData.status === 'approved' || userData.status === 'rejected') {
      return NextResponse.json(
        { error: "Impossible de modifier le statut d'un utilisateur approuvé ou rejeté" },
        { status: 400 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: decodedClaims.uid,
    };

    if (note) {
      updateData.adminNotes = FieldValue.arrayUnion({
        note,
        timestamp: new Date().toISOString(),
        by: decodedClaims.uid,
      });
    }

    await userRef.update(updateData);

    // Créer un audit log
    await adminDb.collection('audit_logs').add({
      action: 'status_changed',
      targetUserId: userId,
      performedBy: decodedClaims.uid,
      timestamp: FieldValue.serverTimestamp(),
      changes: {
        oldStatus: userData.status,
        newStatus,
        note: note || null,
      },
      metadata: {
        adminEmail: decodedClaims.email,
        userEmail: userData.email,
      },
    });

    console.warn(`Statut de ${userId} changé en ${newStatus} par ${decodedClaims.uid}`);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour: ${newStatus}`,
      oldStatus: userData.status,
      newStatus,
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du statut' }, { status: 500 });
  }
}
