# [BLOC 3.1] — Types et Service d'Audit FHIR

## Contexte

Le référentiel HDS exige une traçabilité nominative des accès aux données de santé. Actuellement, le `fhir-client.ts` utilise un compte de service sans logger quel utilisateur (médecin) effectue l'opération.

Ce bloc crée le module d'audit qui sera intégré au client FHIR dans le bloc 3.2.

## Objectif de ce bloc

Créer les types et le service d'audit pour tracer les opérations FHIR avec identification de l'utilisateur, horodatage, et détails de l'opération.

## Pré-requis

- [ ] Aucune dépendance (peut être fait en parallèle du bloc 1)

## Spécifications

### 1. Créer le dossier et les fichiers

```
src/lib/audit/
├── index.ts        # Exports
├── types.ts        # Types et interfaces
└── logger.ts       # Service de logging
```

### 2. Créer les types d'audit

**Fichier** : `src/lib/audit/types.ts` (NOUVEAU)

```typescript
/**
 * Types pour le module d'audit HDS
 * Conforme aux exigences de traçabilité du référentiel HDS
 */

/**
 * Actions possibles sur les ressources FHIR
 */
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SEARCH = 'SEARCH',
  BATCH = 'BATCH',
}

/**
 * Résultat d'une opération auditée
 */
export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL',  // Pour les opérations batch
}

/**
 * Entrée d'audit pour une opération FHIR
 */
export interface FHIRAuditEntry {
  /** Identifiant unique de l'entrée d'audit (UUID) */
  id: string;
  
  /** Timestamp ISO 8601 */
  timestamp: string;
  
  /** ID de corrélation (pour tracer une requête à travers les services) */
  requestId: string;
  
  /** Identifiant Firebase de l'utilisateur */
  userId: string;
  
  /** Email du médecin (pour lisibilité des logs) */
  userEmail: string;
  
  /** Nom affiché de l'utilisateur */
  userName?: string;
  
  /** Action effectuée */
  action: AuditAction;
  
  /** Type de ressource FHIR (Patient, Encounter, etc.) */
  resourceType: string;
  
  /** ID de la ressource (si applicable) */
  resourceId?: string;
  
  /** ID du patient concerné (si applicable et différent de resourceId) */
  patientId?: string;
  
  /** Adresse IP du client */
  ipAddress: string;
  
  /** User-Agent du navigateur */
  userAgent: string;
  
  /** Résultat de l'opération */
  outcome: AuditOutcome;
  
  /** Message d'erreur (si outcome = FAILURE) */
  errorMessage?: string;
  
  /** Code d'erreur (si outcome = FAILURE) */
  errorCode?: string;
  
  /** Durée de l'opération en ms */
  durationMs?: number;
  
  /** Métadonnées additionnelles */
  metadata?: Record<string, unknown>;
}

/**
 * Contexte utilisateur pour l'audit
 * Passé par les routes API au client FHIR
 */
export interface AuditUserContext {
  userId: string;
  userEmail: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  requestId: string;
}

/**
 * Options pour le logger d'audit
 */
export interface AuditLoggerOptions {
  /** Nom du service (pour filtrage des logs) */
  serviceName: string;
  
  /** Niveau de log minimum */
  minLevel: 'debug' | 'info' | 'warn' | 'error';
  
  /** Activer l'envoi vers GCP Cloud Logging */
  enableCloudLogging: boolean;
  
  /** Activer le log console (pour dev) */
  enableConsole: boolean;
}

/**
 * Configuration par défaut
 */
export const DEFAULT_AUDIT_OPTIONS: AuditLoggerOptions = {
  serviceName: 'selav-medical-fhir',
  minLevel: 'info',
  enableCloudLogging: process.env.NODE_ENV === 'production',
  enableConsole: true,
};
```

### 3. Créer le service de logging

**Fichier** : `src/lib/audit/logger.ts` (NOUVEAU)

```typescript
import { v4 as uuidv4 } from 'uuid';
import {
  FHIRAuditEntry,
  AuditAction,
  AuditOutcome,
  AuditUserContext,
  AuditLoggerOptions,
  DEFAULT_AUDIT_OPTIONS,
} from './types';

/**
 * Service de logging d'audit pour les opérations FHIR
 * 
 * Les logs sont envoyés vers :
 * - Console (développement)
 * - GCP Cloud Logging (production) via stdout structuré
 * 
 * GCP Cloud Logging capture automatiquement les logs stdout au format JSON
 * et les indexe pour requêtage.
 */
export class AuditLogger {
  private options: AuditLoggerOptions;

  constructor(options: Partial<AuditLoggerOptions> = {}) {
    this.options = { ...DEFAULT_AUDIT_OPTIONS, ...options };
  }

  /**
   * Log une opération FHIR
   */
  log(entry: Omit<FHIRAuditEntry, 'id' | 'timestamp'>): void {
    const fullEntry: FHIRAuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    // Format pour GCP Cloud Logging (JSON structuré)
    const logPayload = {
      severity: this.getSeverity(entry.outcome),
      message: this.formatMessage(fullEntry),
      'logging.googleapis.com/labels': {
        service: this.options.serviceName,
        action: entry.action,
        resourceType: entry.resourceType,
        outcome: entry.outcome,
      },
      // Champs structurés pour requêtage
      audit: fullEntry,
      // Champs spéciaux GCP
      'logging.googleapis.com/trace': entry.requestId,
      httpRequest: {
        remoteIp: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    };

    // Envoi vers stdout (capturé par GCP Cloud Logging en prod)
    if (this.options.enableConsole || this.options.enableCloudLogging) {
      if (this.options.enableCloudLogging) {
        // Format JSON pour GCP
        console.log(JSON.stringify(logPayload));
      } else {
        // Format lisible pour dev
        this.logToConsole(fullEntry);
      }
    }
  }

  /**
   * Crée une entrée d'audit pour une opération réussie
   */
  logSuccess(
    userContext: AuditUserContext,
    action: AuditAction,
    resourceType: string,
    resourceId?: string,
    durationMs?: number,
    metadata?: Record<string, unknown>
  ): void {
    this.log({
      ...userContext,
      action,
      resourceType,
      resourceId,
      outcome: AuditOutcome.SUCCESS,
      durationMs,
      metadata,
    });
  }

  /**
   * Crée une entrée d'audit pour une opération échouée
   */
  logFailure(
    userContext: AuditUserContext,
    action: AuditAction,
    resourceType: string,
    error: Error | string,
    resourceId?: string,
    durationMs?: number
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR';

    this.log({
      ...userContext,
      action,
      resourceType,
      resourceId,
      outcome: AuditOutcome.FAILURE,
      errorMessage,
      errorCode,
      durationMs,
    });
  }

  /**
   * Détermine la sévérité du log basé sur le résultat
   */
  private getSeverity(outcome: AuditOutcome): string {
    switch (outcome) {
      case AuditOutcome.SUCCESS:
        return 'INFO';
      case AuditOutcome.PARTIAL:
        return 'WARNING';
      case AuditOutcome.FAILURE:
        return 'ERROR';
      default:
        return 'INFO';
    }
  }

  /**
   * Formate un message lisible
   */
  private formatMessage(entry: FHIRAuditEntry): string {
    const resourceInfo = entry.resourceId
      ? `${entry.resourceType}/${entry.resourceId}`
      : entry.resourceType;

    return `[AUDIT] ${entry.action} ${resourceInfo} by ${entry.userEmail} - ${entry.outcome}`;
  }

  /**
   * Log formaté pour la console (développement)
   */
  private logToConsole(entry: FHIRAuditEntry): void {
    const icon = entry.outcome === AuditOutcome.SUCCESS ? '✅' : '❌';
    const resourceInfo = entry.resourceId
      ? `${entry.resourceType}/${entry.resourceId}`
      : entry.resourceType;

    console.log(
      `${icon} [AUDIT] ${entry.action} ${resourceInfo}`,
      `| User: ${entry.userEmail}`,
      `| Duration: ${entry.durationMs || 0}ms`,
      entry.errorMessage ? `| Error: ${entry.errorMessage}` : ''
    );
  }
}

/**
 * Instance singleton du logger d'audit
 */
export const auditLogger = new AuditLogger();

/**
 * Helper pour créer un contexte utilisateur depuis une requête
 */
export function createAuditContext(
  userId: string,
  userEmail: string,
  request: Request,
  userName?: string
): AuditUserContext {
  const headers = request.headers;
  
  return {
    userId,
    userEmail,
    userName,
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || headers.get('x-real-ip') 
      || 'unknown',
    userAgent: headers.get('user-agent') || 'unknown',
    requestId: headers.get('x-request-id') || uuidv4(),
  };
}
```

### 4. Créer le fichier d'export

**Fichier** : `src/lib/audit/index.ts` (NOUVEAU)

```typescript
/**
 * Module d'audit HDS pour la traçabilité des accès aux données de santé
 */

export {
  AuditAction,
  AuditOutcome,
  FHIRAuditEntry,
  AuditUserContext,
  AuditLoggerOptions,
} from './types';

export {
  AuditLogger,
  auditLogger,
  createAuditContext,
} from './logger';
```

## Structure attendue

```
src/lib/
└── audit/
    ├── index.ts                # Export principal
    ├── types.ts                # Types et interfaces
    └── logger.ts               # Service de logging
```

## Validation

Ce bloc est terminé quand :

- [ ] `src/lib/audit/types.ts` créé avec tous les types
- [ ] `src/lib/audit/logger.ts` créé avec le service
- [ ] `src/lib/audit/index.ts` créé avec les exports
- [ ] `pnpm tsc --noEmit` réussit
- [ ] Test manuel du logger

## Test manuel

```typescript
// Test dans un fichier temporaire
import { auditLogger, AuditAction, AuditOutcome, createAuditContext } from '@/lib/audit';

// Simuler un contexte
const mockRequest = new Request('http://localhost', {
  headers: {
    'x-forwarded-for': '192.168.1.100',
    'user-agent': 'Mozilla/5.0',
    'x-request-id': 'test-123',
  },
});

const context = createAuditContext(
  'firebase-uid-123',
  'docteur@example.com',
  mockRequest,
  'Dr. Martin'
);

// Test log success
auditLogger.logSuccess(
  context,
  AuditAction.READ,
  'Patient',
  'patient-456',
  50
);

// Test log failure
auditLogger.logFailure(
  context,
  AuditAction.UPDATE,
  'Patient',
  new Error('Validation failed'),
  'patient-456'
);
```

## Notes importantes

> ℹ️ **GCP Cloud Logging** : En production sur Scalingo, les logs stdout au format JSON sont automatiquement capturés. Pour GCP natif, Cloud Logging les indexe directement.

> ℹ️ **Rétention** : Configurer la rétention des logs d'audit à 12 mois minimum (exigence HDS).

> ⚠️ **PII dans les logs** : Les logs contiennent l'email du médecin mais JAMAIS les données patient. Le `resourceId` est un UUID opaque.

---
**Prochain bloc** : 3.2 — Wrapper FHIRClient audité
