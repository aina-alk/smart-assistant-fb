# [BLOC 3.2] — Wrapper FHIRClient Audité

## Contexte

Le `fhir-client.ts` actuel effectue des opérations FHIR avec un token de service account sans tracer quel utilisateur (médecin) effectue l'opération. Ce bloc modifie le client pour intégrer le logging d'audit.

## Objectif de ce bloc

Modifier `src/lib/api/fhir-client.ts` pour :
1. Accepter un contexte utilisateur pour chaque opération
2. Logger automatiquement chaque opération FHIR avec le module d'audit

## Pré-requis

- [ ] Bloc 3.1 terminé (module d'audit)

## Spécifications

### 1. Fichier à modifier

**Fichier** : `src/lib/api/fhir-client.ts`

### 2. Analyse du code actuel

D'après l'analyse, le client a une méthode `request()` centrale (lignes ~103-152) utilisée par toutes les opérations CRUD.

```typescript
// Structure actuelle (simplifiée)
class FHIRClient {
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/fhir+json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  async getPatient(id: string): Promise<Patient> {
    return this.request('GET', `/Patient/${id}`);
  }
  // etc.
}
```

### 3. Modifications à apporter

#### 3.1 Ajouter les imports

```typescript
// En haut du fichier
import {
  auditLogger,
  AuditAction,
  AuditUserContext,
  createAuditContext,
} from '@/lib/audit';
```

#### 3.2 Modifier la signature des méthodes pour accepter le contexte

```typescript
import { GoogleAuth } from 'google-auth-library';
import {
  auditLogger,
  AuditAction,
  AuditUserContext,
} from '@/lib/audit';

// Types FHIR existants
interface Patient {
  resourceType: 'Patient';
  id?: string;
  // ...
}

interface FHIRBundle<T> {
  resourceType: 'Bundle';
  entry?: Array<{ resource: T }>;
  total?: number;
}

/**
 * Client FHIR avec audit intégré
 */
export class FHIRClient {
  private baseUrl: string;
  private auth: GoogleAuth;

  constructor() {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const datasetId = process.env.HEALTHCARE_DATASET_ID;
    const fhirStoreId = process.env.HEALTHCARE_FHIR_STORE_ID;
    const location = process.env.HEALTHCARE_LOCATION || 'europe-west1';

    this.baseUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir`;

    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-healthcare'],
    });
  }

  /**
   * Méthode centrale de requête avec audit
   */
  private async request<T>(
    method: string,
    path: string,
    auditContext: AuditUserContext,
    action: AuditAction,
    resourceType: string,
    resourceId?: string,
    body?: unknown
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Obtenir le token du service account
      const client = await this.auth.getClient();
      const token = await client.getAccessToken();

      // Effectuer la requête
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/fhir+json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const durationMs = performance.now() - startTime;

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(`FHIR Error ${response.status}: ${errorBody}`);
        
        // Log l'échec
        auditLogger.logFailure(
          auditContext,
          action,
          resourceType,
          error,
          resourceId,
          durationMs
        );
        
        throw error;
      }

      const data = await response.json() as T;

      // Log le succès
      auditLogger.logSuccess(
        auditContext,
        action,
        resourceType,
        resourceId,
        durationMs
      );

      return data;

    } catch (error) {
      const durationMs = performance.now() - startTime;
      
      // Log l'erreur si pas déjà loggée
      if (!(error instanceof Error && error.message.startsWith('FHIR Error'))) {
        auditLogger.logFailure(
          auditContext,
          action,
          resourceType,
          error instanceof Error ? error : String(error),
          resourceId,
          durationMs
        );
      }
      
      throw error;
    }
  }

  // ==================== Opérations Patient ====================

  /**
   * Récupère un patient par ID
   */
  async getPatient(id: string, auditContext: AuditUserContext): Promise<Patient> {
    return this.request<Patient>(
      'GET',
      `/Patient/${id}`,
      auditContext,
      AuditAction.READ,
      'Patient',
      id
    );
  }

  /**
   * Crée un nouveau patient
   */
  async createPatient(
    patient: Omit<Patient, 'id'>,
    auditContext: AuditUserContext
  ): Promise<Patient> {
    const result = await this.request<Patient>(
      'POST',
      '/Patient',
      auditContext,
      AuditAction.CREATE,
      'Patient',
      undefined,
      patient
    );
    return result;
  }

  /**
   * Met à jour un patient
   */
  async updatePatient(
    id: string,
    patient: Patient,
    auditContext: AuditUserContext
  ): Promise<Patient> {
    return this.request<Patient>(
      'PUT',
      `/Patient/${id}`,
      auditContext,
      AuditAction.UPDATE,
      'Patient',
      id,
      patient
    );
  }

  /**
   * Supprime un patient
   */
  async deletePatient(id: string, auditContext: AuditUserContext): Promise<void> {
    await this.request<void>(
      'DELETE',
      `/Patient/${id}`,
      auditContext,
      AuditAction.DELETE,
      'Patient',
      id
    );
  }

  /**
   * Recherche des patients
   */
  async searchPatients(
    params: Record<string, string>,
    auditContext: AuditUserContext
  ): Promise<FHIRBundle<Patient>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<FHIRBundle<Patient>>(
      'GET',
      `/Patient?${queryString}`,
      auditContext,
      AuditAction.SEARCH,
      'Patient'
    );
  }

  // ==================== Opérations Encounter ====================

  async getEncounter(id: string, auditContext: AuditUserContext): Promise<unknown> {
    return this.request(
      'GET',
      `/Encounter/${id}`,
      auditContext,
      AuditAction.READ,
      'Encounter',
      id
    );
  }

  async createEncounter(
    encounter: unknown,
    auditContext: AuditUserContext
  ): Promise<unknown> {
    return this.request(
      'POST',
      '/Encounter',
      auditContext,
      AuditAction.CREATE,
      'Encounter',
      undefined,
      encounter
    );
  }

  // ==================== Opérations DocumentReference ====================

  async getDocumentReference(
    id: string,
    auditContext: AuditUserContext
  ): Promise<unknown> {
    return this.request(
      'GET',
      `/DocumentReference/${id}`,
      auditContext,
      AuditAction.READ,
      'DocumentReference',
      id
    );
  }

  async createDocumentReference(
    doc: unknown,
    auditContext: AuditUserContext
  ): Promise<unknown> {
    return this.request(
      'POST',
      '/DocumentReference',
      auditContext,
      AuditAction.CREATE,
      'DocumentReference',
      undefined,
      doc
    );
  }

  // Ajouter les autres méthodes existantes en suivant le même pattern...
}

/**
 * Singleton du client FHIR
 */
export const fhirClient = new FHIRClient();
```

### 4. Impact sur les routes API existantes

Les routes qui utilisent `fhirClient` devront maintenant passer le contexte d'audit. Exemple :

```typescript
// AVANT (dans une route API)
const patient = await fhirClient.getPatient(patientId);

// APRÈS
import { createAuditContext } from '@/lib/audit';

// Dans la route, après authentification
const auditContext = createAuditContext(
  authResult.userId,
  authResult.email,
  request,
  authResult.name
);

const patient = await fhirClient.getPatient(patientId, auditContext);
```

> ⚠️ **Note** : Les modifications des routes sont gérées dans le bloc 3.3 (enrichissement auth-helpers).

## Structure attendue

```
src/lib/api/
├── fhir-client.ts              # MODIFIÉ - Audit intégré
├── claude-client.ts            # Modifié bloc 2.3
└── auth-helpers.ts             # À modifier bloc 3.3
```

## Validation

Ce bloc est terminé quand :

- [ ] Import du module d'audit ajouté
- [ ] Méthode `request()` modifiée pour logger
- [ ] Toutes les méthodes publiques acceptent `auditContext`
- [ ] `pnpm build` réussit (avec erreurs de type attendues dans les routes)
- [ ] Test manuel du logging

## Test manuel

```typescript
// Test avec un contexte mock
import { fhirClient } from '@/lib/api/fhir-client';
import { createAuditContext } from '@/lib/audit';

const mockRequest = new Request('http://localhost');
const auditContext = createAuditContext(
  'user-123',
  'doctor@test.com',
  mockRequest
);

// Test READ
const patient = await fhirClient.getPatient('patient-456', auditContext);
// Vérifier les logs : ✅ [AUDIT] READ Patient/patient-456 | User: doctor@test.com

// Test CREATE
const newPatient = await fhirClient.createPatient(
  { resourceType: 'Patient', name: [{ family: 'Test' }] },
  auditContext
);
// Vérifier les logs
```

## Notes importantes

> ⚠️ **Breaking change** : Toutes les méthodes requièrent maintenant `auditContext`. Les routes existantes auront des erreurs TypeScript jusqu'au bloc 3.3.

> ℹ️ **Rétrocompatibilité temporaire** : Si nécessaire, on peut ajouter un contexte par défaut pour les appels internes, mais ce n'est pas recommandé pour la conformité HDS.

> ℹ️ **Performance** : Le logging ajoute ~1ms par opération (négligeable vs latence réseau FHIR).

---
**Prochain bloc** : 3.3 — Enrichissement auth-helpers
