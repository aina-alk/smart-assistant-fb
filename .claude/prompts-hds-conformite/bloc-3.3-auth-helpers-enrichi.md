# [BLOC 3.3] — Enrichissement auth-helpers

## Contexte

Suite à la modification du `fhir-client.ts` (bloc 3.2), les routes API doivent fournir un contexte d'audit. Ce bloc enrichit `auth-helpers.ts` pour faciliter la création du contexte d'audit après authentification.

## Objectif de ce bloc

1. Modifier `verifyMedecinAccess()` pour retourner les informations nécessaires à l'audit
2. Créer une fonction helper pour générer le contexte d'audit
3. Mettre à jour les routes qui utilisent le client FHIR

## Pré-requis

- [ ] Bloc 3.1 terminé (module d'audit)
- [ ] Bloc 3.2 terminé (fhir-client audité)

## Spécifications

### 1. Fichier principal à modifier

**Fichier** : `src/lib/api/auth-helpers.ts`

### 2. Enrichir le type de retour de verifyMedecinAccess

```typescript
// AVANT
interface AuthResult {
  authorized: boolean;
  userId?: string;
  error?: string;
}

// APRÈS
interface AuthResult {
  authorized: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
  error?: string;
}
```

### 3. Modifier la fonction verifyMedecinAccess

```typescript
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from './firebase-admin';
import { AuditUserContext, createAuditContext } from '@/lib/audit';

/**
 * Résultat de la vérification d'accès médecin
 */
export interface AuthResult {
  authorized: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
  error?: string;
}

/**
 * Résultat enrichi avec contexte d'audit
 */
export interface AuthResultWithAudit extends AuthResult {
  auditContext?: AuditUserContext;
}

/**
 * Vérifie que l'utilisateur est un médecin autorisé
 * Retourne les informations utilisateur pour l'audit
 */
export async function verifyMedecinAccess(
  request: NextRequest
): Promise<AuthResult> {
  try {
    // Initialiser Firebase Admin si nécessaire
    initializeFirebaseAdmin();

    // Extraire le token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { authorized: false, error: 'Token manquant' };
    }

    const token = authHeader.substring(7);

    // Vérifier le token Firebase
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Récupérer les infos utilisateur depuis Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return { authorized: false, error: 'Utilisateur non trouvé' };
    }

    const userData = userDoc.data();

    // Vérifier le statut d'approbation
    if (userData?.status !== 'approved') {
      return { authorized: false, error: 'Compte non approuvé' };
    }

    // Vérifier le rôle médecin
    if (userData?.role !== 'medecin') {
      return { authorized: false, error: 'Rôle médecin requis' };
    }

    return {
      authorized: true,
      userId: decodedToken.uid,
      userEmail: decodedToken.email || userData?.email,
      userName: userData?.displayName || userData?.name || decodedToken.name,
    };

  } catch (error) {
    console.error('[Auth] Erreur de vérification:', error);
    return {
      authorized: false,
      error: error instanceof Error ? error.message : 'Erreur d\'authentification',
    };
  }
}

/**
 * Vérifie l'accès et crée le contexte d'audit en une seule opération
 * Utilisation recommandée dans les routes qui accèdent aux données FHIR
 */
export async function verifyMedecinAccessWithAudit(
  request: NextRequest
): Promise<AuthResultWithAudit> {
  const authResult = await verifyMedecinAccess(request);

  if (!authResult.authorized || !authResult.userId || !authResult.userEmail) {
    return authResult;
  }

  // Créer le contexte d'audit
  const auditContext = createAuditContext(
    authResult.userId,
    authResult.userEmail,
    request,
    authResult.userName
  );

  return {
    ...authResult,
    auditContext,
  };
}

/**
 * Helper pour extraire l'IP depuis la requête
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Helper pour extraire le User-Agent
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
```

### 4. Mettre à jour une route exemple utilisant FHIR

**Fichier** : `src/app/api/patients/[id]/route.ts` (exemple)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyMedecinAccessWithAudit } from '@/lib/api/auth-helpers';
import { fhirClient } from '@/lib/api/fhir-client';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ====== Auth avec contexte d'audit ======
    const authResult = await verifyMedecinAccessWithAudit(request);
    
    if (!authResult.authorized || !authResult.auditContext) {
      return NextResponse.json(
        { error: authResult.error || 'Non autorisé' },
        { status: 401 }
      );
    }
    // ========================================

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authResult.userId!, 'api');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // ====== Appel FHIR avec contexte d'audit ======
    const patient = await fhirClient.getPatient(
      params.id,
      authResult.auditContext  // <-- Le contexte est passé automatiquement
    );
    // =============================================

    return NextResponse.json(patient);

  } catch (error) {
    console.error('[Patients] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyMedecinAccessWithAudit(request);
    
    if (!authResult.authorized || !authResult.auditContext) {
      return NextResponse.json(
        { error: authResult.error || 'Non autorisé' },
        { status: 401 }
      );
    }

    const patientData = await request.json();

    // L'opération UPDATE sera automatiquement loggée
    const updatedPatient = await fhirClient.updatePatient(
      params.id,
      patientData,
      authResult.auditContext
    );

    return NextResponse.json(updatedPatient);

  } catch (error) {
    console.error('[Patients] Erreur update:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
```

### 5. Liste des routes à mettre à jour

Toutes les routes qui utilisent `fhirClient` doivent être mises à jour :

| Route | Fichier | Opérations FHIR |
|-------|---------|-----------------|
| GET /api/patients/[id] | `src/app/api/patients/[id]/route.ts` | READ Patient |
| PUT /api/patients/[id] | `src/app/api/patients/[id]/route.ts` | UPDATE Patient |
| DELETE /api/patients/[id] | `src/app/api/patients/[id]/route.ts` | DELETE Patient |
| POST /api/patients | `src/app/api/patients/route.ts` | CREATE Patient |
| GET /api/patients | `src/app/api/patients/route.ts` | SEARCH Patient |
| GET /api/consultations/[id] | `src/app/api/consultations/[id]/route.ts` | READ Encounter |
| POST /api/consultations | `src/app/api/consultations/route.ts` | CREATE Encounter |
| ... | ... | ... |

> ℹ️ **Pattern à suivre** : Remplacer `verifyMedecinAccess` par `verifyMedecinAccessWithAudit` et passer `authResult.auditContext` aux méthodes du `fhirClient`.

## Structure attendue

```
src/lib/api/
├── auth-helpers.ts             # MODIFIÉ - Audit context helper
├── fhir-client.ts              # Modifié bloc 3.2
└── claude-client.ts            # Modifié bloc 2.3

src/app/api/
├── patients/
│   ├── route.ts                # À MODIFIER
│   └── [id]/route.ts           # À MODIFIER
├── consultations/
│   ├── route.ts                # À MODIFIER
│   └── [id]/route.ts           # À MODIFIER
└── ... (autres routes FHIR)
```

## Validation

Ce bloc est terminé quand :

- [ ] `AuthResult` enrichi avec `userEmail` et `userName`
- [ ] `verifyMedecinAccessWithAudit()` créé
- [ ] Toutes les routes utilisant FHIR sont mises à jour
- [ ] `pnpm build` réussit sans erreur
- [ ] Test end-to-end : appel API → logs d'audit visibles

## Test end-to-end

```bash
# 1. Démarrer l'app
pnpm dev

# 2. Se connecter en tant que médecin et récupérer un token

# 3. Appeler une route FHIR
curl -X GET http://localhost:3000/api/patients/patient-123 \
  -H "Authorization: Bearer <token>"

# 4. Vérifier les logs
# Attendu : ✅ [AUDIT] READ Patient/patient-123 | User: doctor@example.com | Duration: XXms
```

## Notes importantes

> ℹ️ **Migration progressive** : Si le projet a beaucoup de routes, migrer progressivement en commençant par les routes les plus critiques (Patient, Encounter).

> ⚠️ **Ne pas oublier les routes** : Une route non migrée causera une erreur TypeScript car `auditContext` est maintenant requis.

> ℹ️ **Rétrocompatibilité** : `verifyMedecinAccess()` est conservé pour les routes qui n'accèdent pas à FHIR (ex: ordonnances, bilans).

---
**Prochain bloc** : 4.1 — Rate-limit fail-secure + migration ioredis
