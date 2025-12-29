/**
 * Script de création du premier compte administrateur
 * À exécuter une seule fois lors du déploiement initial
 *
 * Usage: npx ts-node src/scripts/seed-admin.ts
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as path from 'path';

// Configuration de l'admin à créer
const ADMIN_CONFIG = {
  email: 'admin@superassistant.fr',
  displayName: 'Administrateur Principal',
  phone: '+33600000000',
};

async function seedAdmin() {
  console.warn('=== Création du compte administrateur ===\n');

  // Initialiser Firebase Admin avec les credentials
  const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(serviceAccountPath) as ServiceAccount;
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch {
    console.error('Erreur: Fichier service-account.json non trouvé');
    console.error(`Chemin attendu: ${serviceAccountPath}`);
    console.error('\nTéléchargez-le depuis la console Firebase:');
    console.error('Project Settings → Service Accounts → Generate New Private Key');
    process.exit(1);
  }

  const auth = getAuth();
  const db = getFirestore();

  try {
    // Vérifier si un admin existe déjà
    const existingAdmins = await db
      .collection('users')
      .where('role', '==', 'admin')
      .where('status', '==', 'approved')
      .limit(1)
      .get();

    if (!existingAdmins.empty) {
      console.warn('Un administrateur existe déjà:');
      const existingAdmin = existingAdmins.docs[0].data();
      console.warn(`  Email: ${existingAdmin.email}`);
      console.warn(`  UID: ${existingAdmins.docs[0].id}`);
      console.warn('\nAucune action nécessaire.');
      process.exit(0);
    }

    // Créer ou récupérer l'utilisateur Firebase Auth
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(ADMIN_CONFIG.email);
      console.warn(`Utilisateur Auth existant trouvé: ${adminUser.uid}`);
    } catch {
      // L'utilisateur n'existe pas, le créer
      adminUser = await auth.createUser({
        email: ADMIN_CONFIG.email,
        displayName: ADMIN_CONFIG.displayName,
        emailVerified: true,
      });
      console.warn(`Utilisateur Auth créé: ${adminUser.uid}`);
    }

    // Définir les Custom Claims admin
    await auth.setCustomUserClaims(adminUser.uid, {
      role: 'admin',
      status: 'approved',
      structureId: null,
    });
    console.warn('Custom Claims définis: role=admin, status=approved');

    // Créer le document Firestore
    const adminData = {
      email: ADMIN_CONFIG.email,
      displayName: ADMIN_CONFIG.displayName,
      phone: ADMIN_CONFIG.phone,
      role: 'admin',
      status: 'approved',
      createdAt: FieldValue.serverTimestamp(),
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: 'system',
      callbackSlots: [],
      structureId: null,
    };

    await db.collection('users').doc(adminUser.uid).set(adminData);
    console.warn('Document Firestore créé dans /users');

    // Créer l'entrée d'audit
    await db.collection('audit_logs').add({
      action: 'admin_seeded',
      targetUserId: adminUser.uid,
      performedBy: 'system',
      timestamp: FieldValue.serverTimestamp(),
      changes: {
        role: 'admin',
        status: 'approved',
      },
      metadata: {
        email: ADMIN_CONFIG.email,
        seedScript: true,
      },
    });
    console.warn('Entrée audit_logs créée');

    console.warn('\n=== Compte administrateur créé avec succès ===');
    console.warn(`\nEmail: ${ADMIN_CONFIG.email}`);
    console.warn(`UID: ${adminUser.uid}`);
    console.warn("\nConnectez-vous avec un Email Link pour accéder à l'interface admin.");
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    process.exit(1);
  }
}

// Exécuter le script
seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
