/**
 * API Route pour synchroniser les custom claims avec le document Firestore
 * POST /api/auth/sync-claims
 *
 * Résout le problème où les claims ne sont pas définis si le document
 * est créé directement sans passer par le trigger onUpdate
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

interface UserDocument {
  role: string;
  status: string;
  structureId?: string | null;
}

interface CustomClaims {
  role?: string;
  status?: string;
  structureId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken manquant ou invalide' }, { status: 400 });
    }

    // Vérifier le token et obtenir l'UID
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Lire le document utilisateur Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // Pas de document Firestore = utilisateur pas encore inscrit
      return NextResponse.json(
        {
          synced: false,
          reason: 'no_document',
        },
        { status: 200 }
      );
    }

    const userData = userDoc.data() as UserDocument;
    const currentClaims = decodedToken as CustomClaims;

    // Vérifier si les claims sont différents
    const needsSync =
      currentClaims.role !== userData.role ||
      currentClaims.status !== userData.status ||
      currentClaims.structureId !== (userData.structureId || null);

    if (!needsSync) {
      return NextResponse.json(
        {
          synced: false,
          reason: 'already_synced',
          claims: {
            role: currentClaims.role,
            status: currentClaims.status,
          },
        },
        { status: 200 }
      );
    }

    // Mettre à jour les custom claims
    await adminAuth.setCustomUserClaims(uid, {
      role: userData.role,
      status: userData.status,
      structureId: userData.structureId || null,
    });

    console.warn(
      `Claims synchronisés pour ${uid}: role=${userData.role}, status=${userData.status}`
    );

    return NextResponse.json(
      {
        synced: true,
        claims: {
          role: userData.role,
          status: userData.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur sync-claims:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation des claims' },
      { status: 500 }
    );
  }
}
