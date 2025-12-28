# [BLOC 0.3] — Setup Google Cloud + FHIR Store

**Bloc** : 0.3 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Blocs 0.1 et 0.2 terminés

---

## Contexte

L'UI est configurée (bloc 0.2). Nous devons maintenant connecter l'application à Google Healthcare API pour stocker les données patients au format FHIR R4, standard international de l'interopérabilité en santé.

---

## Objectif de ce bloc

Créer le client FHIR pour communiquer avec Google Healthcare API, avec les types TypeScript de base et les fonctions utilitaires pour les opérations CRUD.

---

## Pré-requis

- [ ] Blocs 0.1 et 0.2 terminés
- [ ] Compte Google Cloud avec projet créé
- [ ] Healthcare API activée
- [ ] Dataset et FHIR Store créés (FHIR R4)
- [ ] Service Account avec rôle `Healthcare FHIR Resource Editor`
- [ ] Fichier JSON credentials téléchargé

---

## Spécifications

### Ce qui doit être créé

1. **Client FHIR** (`lib/api/fhir-client.ts`) avec :
   - Authentification via Google Auth Library
   - Méthodes génériques : create, read, update, delete, search
   - Gestion des erreurs FHIR (OperationOutcome)
   - Typage fort des ressources

2. **Types FHIR de base** (`types/fhir.ts`) :
   ```typescript
   - FHIRResource (interface de base)
   - Bundle<T>
   - BundleEntry<T>
   - OperationOutcome
   - Reference
   - Identifier
   - HumanName
   - ContactPoint
   - Address
   - CodeableConcept
   - Coding
   - Period
   - Meta
   - Annotation
   ```

3. **Utilitaires FHIR** (`lib/utils/fhir-helpers.ts`) :
   - `formatHumanName(name: HumanName): string`
   - `formatAddress(address: Address): string`
   - `formatPhone(telecom: ContactPoint[]): string`
   - `createReference(resourceType: string, id: string): Reference`

4. **Route de test** (`app/api/health/route.ts`) :
   - Vérifie la connexion au FHIR Store
   - Retourne le statut de connexion

### Comportement attendu

- Le client se connecte au FHIR Store sans erreur
- Les opérations CRUD fonctionnent avec typage
- Les erreurs FHIR sont parsées et explicites
- La route /api/health retourne `{ status: "ok", fhir: "connected" }`

### Contraintes techniques

- Utiliser `google-auth-library` pour l'authentification
- Faire les requêtes HTTP directement (fetch) vers l'API REST FHIR
- Pas de SDK healthcare (trop lourd), utiliser l'API REST
- Toutes les opérations sont async/await
- Gestion du rate limiting (429) avec retry

---

## Structure attendue

```
src/
├── lib/
│   ├── api/
│   │   └── fhir-client.ts
│   └── utils/
│       └── fhir-helpers.ts
├── types/
│   ├── fhir.ts
│   └── index.ts
└── app/
    └── api/
        └── health/
            └── route.ts
```

---

## Interface FHIRClient attendue

```typescript
interface FHIRClientConfig {
  projectId: string;
  location: string;
  datasetId: string;
  fhirStoreId: string;
}

class FHIRClient {
  private baseUrl: string;
  private auth: GoogleAuth;
  
  constructor(config: FHIRClientConfig);
  
  // Obtenir un token d'accès
  private getAccessToken(): Promise<string>;
  
  // Opérations CRUD génériques
  create<T extends FHIRResource>(resourceType: string, resource: Omit<T, 'id'>): Promise<T>;
  read<T extends FHIRResource>(resourceType: string, id: string): Promise<T>;
  update<T extends FHIRResource>(resourceType: string, id: string, resource: T): Promise<T>;
  delete(resourceType: string, id: string): Promise<void>;
  search<T extends FHIRResource>(resourceType: string, params?: Record<string, string>): Promise<Bundle<T>>;
  
  // Test connexion
  testConnection(): Promise<boolean>;
}

// Singleton exporté
export const fhirClient: FHIRClient;
```

---

## Format URL FHIR

```
Base URL: https://healthcare.googleapis.com/v1/projects/{project}/locations/{location}/datasets/{dataset}/fhirStores/{fhirStore}/fhir

Exemples:
- GET    /Patient/{id}
- POST   /Patient
- PUT    /Patient/{id}
- DELETE /Patient/{id}
- GET    /Patient?name=dupont
```

---

## Dépendance à installer

```bash
pnpm add google-auth-library
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Variables .env.local configurées avec credentials GCP
- [ ] `GET /api/health` retourne `{ status: "ok", fhir: "connected" }`
- [ ] Test manuel : créer un Patient minimal via le client
- [ ] Test manuel : lire le Patient créé
- [ ] Test manuel : supprimer le Patient test
- [ ] Les erreurs FHIR sont loggées proprement

---

## Notes importantes

> ⚠️ Pour l'authentification côté serveur (API routes), utiliser `GOOGLE_APPLICATION_CREDENTIALS` pointant vers le fichier JSON du service account.

> ⚠️ Le client FHIR ne doit être utilisé que côté serveur (API routes), jamais côté client.

> Créer un Patient test minimal pour validation :
```json
{
  "resourceType": "Patient",
  "name": [{ "family": "Test", "given": ["Connection"] }]
}
```

---

## Prochain bloc

**[BLOC 0.4]** — Authentification Firebase
