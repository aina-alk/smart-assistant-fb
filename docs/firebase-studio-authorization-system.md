# 🔐 Super Assistant Médical — Backend Autorisation Firebase

> **Prompt pour Firebase Studio**  
> Système d'inscription avec circuit d'entretien pour professionnels de santé

---

## 📋 Contexte du Projet

### Description

Super Assistant Médical est une application web médicale destinée aux professionnels de santé (médecins ORL, secrétaires, techniciens). L'application permet la dictée vocale, la génération automatique de comptes-rendus de consultation, et la gestion des patients.

### Problématique

L'authentification Firebase Auth avec Google OAuth permet à n'importe qui de se connecter. Il faut restreindre l'accès aux seuls professionnels de santé vérifiés via un processus d'inscription avec entretien téléphonique.

### Objectif de ce Backend

Construire un système complet d'autorisation qui :
1. Collecte les demandes d'accès via un formulaire d'inscription
2. Notifie l'admin des nouvelles demandes
3. Permet à l'admin de gérer les demandes (appeler, approuver, rejeter)
4. Active les comptes approuvés avec les bons rôles et permissions
5. Envoie des emails à chaque étape du processus

---

## 🏗️ Architecture Technique

### Stack

| Composant | Technologie | Usage |
|-----------|-------------|-------|
| Auth | Firebase Authentication | Google OAuth 2.0 |
| Database | Cloud Firestore | Stockage utilisateurs et logs |
| Functions | Cloud Functions (Node.js 18+) | Logique métier, emails, triggers |
| Email | Resend API | Envoi emails transactionnels |
| Claims | Firebase Custom Claims | Rôles et permissions dans le token |

### Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE AUTH                               │
│                   (Google OAuth 2.0)                             │
│                                                                  │
│  Custom Claims: { role, status }                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUD FIRESTORE                              │
│                                                                  │
│  ├── users/{uid}           # Profils et statuts                  │
│  ├── audit_logs/{id}       # Traçabilité actions                 │
│  └── structures/{id}       # Multi-cabinet (futur)               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD FUNCTIONS                               │
│                                                                  │
│  Triggers Firestore:                                             │
│  • onUserCreated → Email confirmation + notif admin              │
│  • onUserStatusChanged → Email + set custom claims               │
│                                                                  │
│  Callable Functions:                                             │
│  • approveUser(uid) → Approuve et active le compte               │
│  • rejectUser(uid, reason) → Rejette la demande                  │
│  • updateUserStatus(uid, status) → Change le statut              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RESEND API                                 │
│                                                                  │
│  Templates:                                                      │
│  • confirmation-demande                                          │
│  • notification-admin                                            │
│  • compte-approuve                                               │
│  • demande-rejetee                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Modèle de Données Firestore

### Collection `users/{firebase_uid}`

```typescript
interface User {
  // ===== IDENTITÉ =====
  email: string;                    // Email Google
  displayName: string;              // Nom complet
  phone: string;                    // Téléphone professionnel
  photoURL: string | null;          // Photo Google
  
  // ===== RÔLE ET STATUT =====
  role: 'admin' | 'medecin' | 'secretaire' | 'technicien';
  status: 'pending_call' | 'in_review' | 'pending_callback' | 
          'pending_info' | 'approved' | 'rejected' | 'suspended';
  
  // ===== TIMESTAMPS =====
  createdAt: Timestamp;             // Date création demande
  updatedAt: Timestamp;             // Dernière modification
  
  // ===== WORKFLOW ENTRETIEN =====
  callbackSlots: string[];          // ['morning', 'afternoon', 'evening']
  callbackNote: string | null;      // Commentaire du candidat
  interviewScheduledAt: Timestamp | null;
  interviewCompletedAt: Timestamp | null;
  interviewNotes: string | null;    // Notes prises par l'admin
  interviewedBy: string | null;     // UID de l'admin
  
  // ===== APPROBATION / REJET =====
  approvedAt: Timestamp | null;
  approvedBy: string | null;        // UID admin
  rejectedAt: Timestamp | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  
  // ===== HISTORIQUE =====
  statusHistory: Array<{
    status: string;
    changedAt: Timestamp;
    changedBy: string;              // UID ou 'system'
    note: string | null;
  }>;
  
  // ===== STRUCTURE (futur multi-cabinet) =====
  structureId: string | null;
  structureName: string | null;
  
  // ===== DONNÉES SPÉCIFIQUES AU RÔLE =====
  medecinData: MedecinData | null;
  secretaireData: SecretaireData | null;
  technicienData: TechnicienData | null;
  adminData: AdminData | null;
}

interface MedecinData {
  rpps: string;                     // 11 chiffres obligatoire
  adeli: string | null;             // Optionnel
  specialty: string;                // 'ORL', 'Généraliste', etc.
  sector: 1 | 2;                    // Secteur conventionnel
  conventionStatus: string | null;
  signature: string | null;         // URL image signature
}

interface SecretaireData {
  supervisorId: string;             // UID médecin référent
  supervisorName: string;           // Nom pour affichage
  permissions: string[];            // ['patients:read', 'rdv:write']
  service: string | null;
}

interface TechnicienData {
  specialization: string;           // 'audioprothésiste', etc.
  certifications: string[];
  supervisorId: string | null;
}

interface AdminData {
  level: 'super' | 'structure';
  managedStructures: string[];
}
```

### Collection `audit_logs/{auto_id}`

```typescript
interface AuditLog {
  action: 'user_created' | 'user_approved' | 'user_rejected' | 
          'status_changed' | 'role_changed' | 'user_suspended';
  targetUserId: string;
  targetUserEmail: string;
  performedBy: string;              // UID admin ou 'system'
  performedByEmail: string | null;
  timestamp: Timestamp;
  previousValue: any;
  newValue: any;
  metadata: {
    ip: string | null;
    userAgent: string | null;
    source: 'admin_dashboard' | 'cloud_function' | 'api';
  };
}
```

### Collection `structures/{structure_id}` (préparation futur)

```typescript
interface Structure {
  name: string;
  address: string;
  siret: string | null;
  phone: string | null;
  email: string | null;
  adminIds: string[];               // UIDs des admins
  createdAt: Timestamp;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
  };
}
```

---

## 🔒 Règles de Sécurité Firestore

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== FONCTIONS HELPER =====
    
    // Vérifie si l'utilisateur est authentifié
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Vérifie si l'utilisateur est approuvé
    function isApproved() {
      return isAuthenticated() && 
             request.auth.token.status == 'approved';
    }
    
    // Vérifie si l'utilisateur est admin
    function isAdmin() {
      return isApproved() && 
             request.auth.token.role == 'admin';
    }
    
    // Vérifie si l'utilisateur est médecin approuvé
    function isMedecin() {
      return isApproved() && 
             request.auth.token.role == 'medecin';
    }
    
    // Vérifie si c'est le propriétaire du document
    function isOwner(userId) {
      return isAuthenticated() && 
             request.auth.uid == userId;
    }
    
    // ===== COLLECTION USERS =====
    
    match /users/{userId} {
      // Lecture : l'utilisateur lui-même ou un admin
      allow read: if isOwner(userId) || isAdmin();
      
      // Création : uniquement l'utilisateur pour lui-même
      // (première inscription après Google Sign-in)
      allow create: if isOwner(userId) && 
                       request.resource.data.status == 'pending_call' &&
                       request.resource.data.email == request.auth.token.email;
      
      // Mise à jour : 
      // - L'utilisateur peut modifier ses infos de base (pas le status/role)
      // - L'admin peut tout modifier
      allow update: if isAdmin() || 
                       (isOwner(userId) && 
                        !request.resource.data.diff(resource.data).affectedKeys()
                          .hasAny(['status', 'role', 'approvedAt', 'approvedBy', 
                                   'rejectedAt', 'rejectedBy', 'adminData']));
      
      // Suppression : admin uniquement
      allow delete: if isAdmin();
    }
    
    // ===== COLLECTION AUDIT_LOGS =====
    
    match /audit_logs/{logId} {
      // Lecture : admin uniquement
      allow read: if isAdmin();
      
      // Écriture : Cloud Functions uniquement (pas de règle allow)
      allow write: if false;
    }
    
    // ===== COLLECTION STRUCTURES =====
    
    match /structures/{structureId} {
      // Lecture : membres de la structure ou admin
      allow read: if isAdmin() || 
                    (isApproved() && 
                     resource.data.adminIds.hasAny([request.auth.uid]));
      
      // Écriture : super admin uniquement
      allow write: if isAdmin() && 
                      request.auth.token.adminLevel == 'super';
    }
  }
}
```

---

## ⚡ Cloud Functions

### Configuration

```typescript
// functions/src/config.ts

export const config = {
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: 'Super Assistant Médical <contact@superassistant.fr>',
    adminEmail: 'admin@superassistant.fr',
  },
  app: {
    name: 'Super Assistant Médical',
    url: 'https://app.superassistant.fr',
    adminUrl: 'https://app.superassistant.fr/admin',
  },
};
```

### Function 1 : onUserCreated (Trigger Firestore)

```typescript
// Déclenché quand un nouveau document est créé dans users/
// Actions :
// 1. Envoyer email de confirmation au candidat
// 2. Envoyer notification à l'admin
// 3. Créer une entrée dans audit_logs

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';

export const onUserCreated = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    
    const userData = snapshot.data();
    const userId = event.params.userId;
    
    // 1. Email confirmation candidat
    await sendConfirmationEmail(userData);
    
    // 2. Email notification admin
    await sendAdminNotification(userData, userId);
    
    // 3. Audit log
    await createAuditLog({
      action: 'user_created',
      targetUserId: userId,
      targetUserEmail: userData.email,
      performedBy: 'system',
      newValue: { status: userData.status, role: userData.role },
    });
  }
);
```

### Function 2 : onUserStatusChanged (Trigger Firestore)

```typescript
// Déclenché quand le champ 'status' change dans un document users/
// Actions selon le nouveau status :
// - 'approved' → Set custom claims + email bienvenue
// - 'rejected' → Email refus
// - Autres → Audit log uniquement

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';

export const onUserStatusChanged = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const userId = event.params.userId;
    
    if (!before || !after) return;
    if (before.status === after.status) return;
    
    const newStatus = after.status;
    const oldStatus = before.status;
    
    // Traitement selon le nouveau status
    switch (newStatus) {
      case 'approved':
        // Set custom claims
        await getAuth().setCustomUserClaims(userId, {
          role: after.role,
          status: 'approved',
        });
        // Email bienvenue
        await sendWelcomeEmail(after);
        break;
        
      case 'rejected':
        // Email refus
        await sendRejectionEmail(after);
        break;
    }
    
    // Audit log pour tout changement de status
    await createAuditLog({
      action: 'status_changed',
      targetUserId: userId,
      targetUserEmail: after.email,
      performedBy: after.approvedBy || after.rejectedBy || 'system',
      previousValue: { status: oldStatus },
      newValue: { status: newStatus },
    });
  }
);
```

### Function 3 : approveUser (Callable)

```typescript
// Fonction appelable par l'admin pour approuver un utilisateur
// Paramètres : { userId: string, interviewNotes?: string }
// Actions :
// 1. Vérifier que l'appelant est admin
// 2. Mettre à jour le document user (status, approvedAt, approvedBy, etc.)
// 3. Le trigger onUserStatusChanged s'occupe du reste

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const approveUser = onCall(async (request) => {
  // Vérification admin
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }
  
  const callerClaims = request.auth.token;
  if (callerClaims.role !== 'admin' || callerClaims.status !== 'approved') {
    throw new HttpsError('permission-denied', 'Accès admin requis');
  }
  
  const { userId, interviewNotes } = request.data;
  
  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId requis');
  }
  
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'Utilisateur non trouvé');
  }
  
  const userData = userDoc.data();
  
  // Mise à jour
  await userRef.update({
    status: 'approved',
    approvedAt: FieldValue.serverTimestamp(),
    approvedBy: request.auth.uid,
    interviewNotes: interviewNotes || userData?.interviewNotes || null,
    interviewCompletedAt: FieldValue.serverTimestamp(),
    interviewedBy: request.auth.uid,
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: FieldValue.arrayUnion({
      status: 'approved',
      changedAt: new Date(),
      changedBy: request.auth.uid,
      note: interviewNotes || 'Approuvé après entretien',
    }),
  });
  
  return { success: true, message: 'Utilisateur approuvé' };
});
```

### Function 4 : rejectUser (Callable)

```typescript
// Fonction appelable par l'admin pour rejeter une demande
// Paramètres : { userId: string, reason: string }

export const rejectUser = onCall(async (request) => {
  // Vérification admin (même logique que approveUser)
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }
  
  const callerClaims = request.auth.token;
  if (callerClaims.role !== 'admin' || callerClaims.status !== 'approved') {
    throw new HttpsError('permission-denied', 'Accès admin requis');
  }
  
  const { userId, reason } = request.data;
  
  if (!userId || !reason) {
    throw new HttpsError('invalid-argument', 'userId et reason requis');
  }
  
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  
  await userRef.update({
    status: 'rejected',
    rejectedAt: FieldValue.serverTimestamp(),
    rejectedBy: request.auth.uid,
    rejectionReason: reason,
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: FieldValue.arrayUnion({
      status: 'rejected',
      changedAt: new Date(),
      changedBy: request.auth.uid,
      note: reason,
    }),
  });
  
  return { success: true, message: 'Demande rejetée' };
});
```

### Function 5 : updateUserStatus (Callable)

```typescript
// Fonction pour les changements de status intermédiaires
// (in_review, pending_callback, pending_info)

export const updateUserStatus = onCall(async (request) => {
  // Vérification admin
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }
  
  const callerClaims = request.auth.token;
  if (callerClaims.role !== 'admin' || callerClaims.status !== 'approved') {
    throw new HttpsError('permission-denied', 'Accès admin requis');
  }
  
  const { userId, newStatus, note } = request.data;
  
  const allowedStatuses = ['in_review', 'pending_callback', 'pending_info'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new HttpsError(
      'invalid-argument', 
      'Utilisez approveUser ou rejectUser pour ces status'
    );
  }
  
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  
  await userRef.update({
    status: newStatus,
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: FieldValue.arrayUnion({
      status: newStatus,
      changedAt: new Date(),
      changedBy: request.auth.uid,
      note: note || null,
    }),
  });
  
  return { success: true, message: `Status mis à jour: ${newStatus}` };
});
```

### Function 6 : getAdminStats (Callable)

```typescript
// Retourne les statistiques pour le dashboard admin

export const getAdminStats = onCall(async (request) => {
  // Vérification admin
  if (!request.auth?.token?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Accès admin requis');
  }
  
  const db = getFirestore();
  const usersRef = db.collection('users');
  
  const [
    pendingCall,
    inReview,
    pendingCallback,
    approved,
    rejected,
    total
  ] = await Promise.all([
    usersRef.where('status', '==', 'pending_call').count().get(),
    usersRef.where('status', '==', 'in_review').count().get(),
    usersRef.where('status', '==', 'pending_callback').count().get(),
    usersRef.where('status', '==', 'approved').count().get(),
    usersRef.where('status', '==', 'rejected').count().get(),
    usersRef.count().get(),
  ]);
  
  return {
    pendingCall: pendingCall.data().count,
    inReview: inReview.data().count,
    pendingCallback: pendingCallback.data().count,
    approved: approved.data().count,
    rejected: rejected.data().count,
    total: total.data().count,
  };
});
```

---

## 📧 Templates Emails

### Email 1 : Confirmation Demande (au candidat)

```typescript
const confirmationEmailTemplate = (user: UserData) => ({
  subject: '✅ Demande d\'accès reçue - Super Assistant Médical',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bonjour ${user.displayName},</h2>
      
      <p>Nous avons bien reçu votre demande d'accès à <strong>Super Assistant Médical</strong>.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">📋 Récapitulatif de votre demande</h3>
        <table style="width: 100%;">
          <tr><td><strong>Profil :</strong></td><td>${user.role}</td></tr>
          ${user.medecinData ? `
            <tr><td><strong>N° RPPS :</strong></td><td>${user.medecinData.rpps}</td></tr>
            <tr><td><strong>Spécialité :</strong></td><td>${user.medecinData.specialty}</td></tr>
          ` : ''}
          <tr><td><strong>Téléphone :</strong></td><td>${user.phone}</td></tr>
          <tr><td><strong>Créneaux :</strong></td><td>${formatSlots(user.callbackSlots)}</td></tr>
        </table>
      </div>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">📞 Prochaine étape</h3>
        <p>Un membre de notre équipe vous contactera <strong>sous 48 heures ouvrées</strong> 
        pour un bref entretien de présentation (5-10 minutes).</p>
        <p>Cet échange nous permettra de :</p>
        <ul>
          <li>Vérifier vos informations professionnelles</li>
          <li>Vous présenter les fonctionnalités</li>
          <li>Répondre à vos questions</li>
        </ul>
      </div>
      
      <p>À très bientôt !</p>
      <p><strong>L'équipe Super Assistant Médical</strong></p>
    </div>
  `,
});
```

### Email 2 : Notification Admin (nouvelle demande)

```typescript
const adminNotificationTemplate = (user: UserData, userId: string) => ({
  subject: `🆕 Nouvelle demande - ${user.displayName} (${user.role})`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Nouvelle demande d'inscription</h2>
      
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
        <h3>👤 Candidat</h3>
        <p><strong>Nom :</strong> ${user.displayName}</p>
        <p><strong>Email :</strong> ${user.email}</p>
        <p><strong>Téléphone :</strong> ${user.phone}</p>
        
        <h3>📋 Profil demandé</h3>
        <p><strong>Rôle :</strong> ${user.role}</p>
        ${user.medecinData ? `
          <p><strong>RPPS :</strong> ${user.medecinData.rpps}</p>
          <p><strong>Spécialité :</strong> ${user.medecinData.specialty}</p>
          <p><strong>Secteur :</strong> ${user.medecinData.sector}</p>
        ` : ''}
        
        <h3>📅 Disponibilités</h3>
        <p>${formatSlots(user.callbackSlots)}</p>
        
        ${user.callbackNote ? `
          <h3>💬 Commentaire</h3>
          <p>${user.callbackNote}</p>
        ` : ''}
      </div>
      
      <div style="margin-top: 20px;">
        <a href="${config.app.adminUrl}/users/${userId}" 
           style="background: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Voir la demande
        </a>
      </div>
    </div>
  `,
});
```

### Email 3 : Compte Approuvé

```typescript
const welcomeEmailTemplate = (user: UserData) => ({
  subject: '🎉 Bienvenue sur Super Assistant Médical !',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Bonjour ${user.displayName},</h2>
      
      <p>Excellente nouvelle ! Suite à notre entretien, votre compte 
      <strong>Super Assistant Médical</strong> est maintenant <strong>actif</strong>.</p>
      
      <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0;">🚀 Accéder à votre espace</h3>
        <a href="${config.app.url}" 
           style="background: #059669; color: white; padding: 14px 28px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;
                  font-weight: bold;">
          Se connecter
        </a>
        <p style="margin-top: 12px; color: #065f46; font-size: 14px;">
          Connectez-vous avec : ${user.email}
        </p>
      </div>
      
      <h3>📚 Premiers pas</h3>
      <ol>
        <li>Créez votre premier patient (2 min)</li>
        <li>Testez la dictée vocale (3 min)</li>
        <li>Générez votre premier compte-rendu (1 min)</li>
      </ol>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0;">🆘 Besoin d'aide ?</h3>
        <p>Notre équipe est disponible :</p>
        <p>📧 support@superassistant.fr</p>
      </div>
      
      <p>Bienvenue parmi nous !</p>
      <p><strong>L'équipe Super Assistant Médical</strong></p>
    </div>
  `,
});
```

### Email 4 : Demande Rejetée

```typescript
const rejectionEmailTemplate = (user: UserData) => ({
  subject: 'Suite à votre demande - Super Assistant Médical',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bonjour ${user.displayName},</h2>
      
      <p>Nous vous remercions pour l'intérêt que vous portez à Super Assistant Médical.</p>
      
      <p>Après examen de votre demande, nous ne sommes malheureusement pas en mesure 
      d'y donner une suite favorable pour le moment.</p>
      
      ${user.rejectionReason ? `
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Motif :</strong> ${user.rejectionReason}</p>
        </div>
      ` : ''}
      
      <p>Si vous pensez qu'il s'agit d'une erreur ou si votre situation évolue, 
      n'hésitez pas à nous recontacter.</p>
      
      <p>Cordialement,</p>
      <p><strong>L'équipe Super Assistant Médical</strong></p>
    </div>
  `,
});
```

---

## 🔧 Script de Seed : Premier Admin

```typescript
// scripts/seed-admin.ts
// À exécuter une seule fois pour créer le premier admin

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialiser avec le service account
initializeApp({
  credential: cert('./service-account.json'),
});

const FIRST_ADMIN_EMAIL = 'admin@superassistant.fr';

async function seedFirstAdmin() {
  const auth = getAuth();
  const db = getFirestore();
  
  try {
    // Récupérer l'utilisateur par email
    const userRecord = await auth.getUserByEmail(FIRST_ADMIN_EMAIL);
    const uid = userRecord.uid;
    
    console.log(`Utilisateur trouvé: ${uid}`);
    
    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      role: 'admin',
      status: 'approved',
      adminLevel: 'super',
    });
    
    console.log('Custom claims définis');
    
    // Créer/Mettre à jour le document Firestore
    await db.collection('users').doc(uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName || 'Admin',
      phone: '',
      photoURL: userRecord.photoURL || null,
      role: 'admin',
      status: 'approved',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: 'system',
      callbackSlots: [],
      callbackNote: null,
      interviewNotes: 'Compte admin initial',
      statusHistory: [{
        status: 'approved',
        changedAt: new Date(),
        changedBy: 'system',
        note: 'Compte admin initial créé par script',
      }],
      adminData: {
        level: 'super',
        managedStructures: [],
      },
      medecinData: null,
      secretaireData: null,
      technicienData: null,
      structureId: null,
      structureName: null,
    }, { merge: true });
    
    console.log('Document Firestore créé');
    console.log('✅ Premier admin créé avec succès !');
    console.log(`   Email: ${FIRST_ADMIN_EMAIL}`);
    console.log(`   UID: ${uid}`);
    
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error('❌ Utilisateur non trouvé. L\'admin doit d\'abord se connecter via Google.');
      console.error('   1. Connectez-vous à l\'app avec le compte Google');
      console.error('   2. Relancez ce script');
    } else {
      console.error('❌ Erreur:', error);
    }
  }
}

seedFirstAdmin();
```

---

## 📁 Structure des Fichiers

```
functions/
├── src/
│   ├── index.ts                    # Export de toutes les functions
│   ├── config.ts                   # Configuration (env vars)
│   │
│   ├── triggers/
│   │   ├── onUserCreated.ts        # Trigger création user
│   │   └── onUserStatusChanged.ts  # Trigger changement status
│   │
│   ├── callable/
│   │   ├── approveUser.ts          # Approuver un user
│   │   ├── rejectUser.ts           # Rejeter un user
│   │   ├── updateUserStatus.ts     # Changer status intermédiaire
│   │   └── getAdminStats.ts        # Stats dashboard admin
│   │
│   ├── services/
│   │   ├── email.service.ts        # Envoi emails via Resend
│   │   └── audit.service.ts        # Création audit logs
│   │
│   ├── templates/
│   │   ├── confirmation.ts         # Template confirmation
│   │   ├── admin-notification.ts   # Template notif admin
│   │   ├── welcome.ts              # Template bienvenue
│   │   └── rejection.ts            # Template refus
│   │
│   └── types/
│       └── index.ts                # Types TypeScript
│
├── scripts/
│   └── seed-admin.ts               # Script création premier admin
│
├── package.json
├── tsconfig.json
└── .env.example
```

---

## ✅ Checklist de Déploiement

### Pré-requis

- [ ] Projet Firebase créé
- [ ] Firebase Authentication activé avec Google Provider
- [ ] Cloud Firestore activé (mode production)
- [ ] Cloud Functions activé (plan Blaze requis pour emails)
- [ ] Compte Resend créé + API Key

### Configuration

- [ ] Variables d'environnement configurées dans Firebase :
  ```bash
  firebase functions:secrets:set RESEND_API_KEY
  ```
- [ ] Domaines autorisés dans Firebase Auth
- [ ] Règles Firestore déployées

### Déploiement

1. [ ] Déployer les règles Firestore
2. [ ] Déployer les Cloud Functions
3. [ ] Se connecter avec le compte admin via Google
4. [ ] Exécuter le script seed-admin.ts
5. [ ] Tester le flux complet

### Tests à effectuer

- [ ] Inscription nouvelle demande → Email reçu
- [ ] Admin reçoit notification
- [ ] Admin peut voir la demande dans le dashboard
- [ ] Approbation → Custom claims OK + Email bienvenue
- [ ] Utilisateur approuvé peut accéder au dashboard
- [ ] Rejet → Email de refus envoyé
- [ ] Utilisateur non approuvé redirigé vers page d'attente

---

## 📝 Variables d'Environnement

```bash
# .env.example

# Resend (emails)
RESEND_API_KEY=re_xxxxxxxxxxxx

# App URLs
APP_URL=https://app.superassistant.fr
ADMIN_EMAIL=admin@superassistant.fr

# Firebase (automatique dans Cloud Functions)
# FIREBASE_PROJECT_ID
# FIREBASE_DATABASE_URL
```

---

## 🎯 Résumé des Éléments à Créer

| # | Élément | Type | Priorité |
|---|---------|------|----------|
| 1 | Collection `users` | Firestore | P0 |
| 2 | Collection `audit_logs` | Firestore | P1 |
| 3 | Règles de sécurité | Firestore Rules | P0 |
| 4 | `onUserCreated` | Cloud Function (trigger) | P0 |
| 5 | `onUserStatusChanged` | Cloud Function (trigger) | P0 |
| 6 | `approveUser` | Cloud Function (callable) | P0 |
| 7 | `rejectUser` | Cloud Function (callable) | P0 |
| 8 | `updateUserStatus` | Cloud Function (callable) | P1 |
| 9 | `getAdminStats` | Cloud Function (callable) | P1 |
| 10 | Templates emails | Code | P0 |
| 11 | Script seed-admin | Script | P0 |
| 12 | Collection `structures` | Firestore | P2 (futur) |

---

*Document généré pour Firebase Studio — Super Assistant Médical v2.0*
