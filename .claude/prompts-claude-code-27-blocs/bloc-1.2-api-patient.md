# [BLOC 1.2] — API CRUD Patient (FHIR)

**Bloc** : 1.2 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Bloc 1.1 terminé

---

## Contexte

Les types Patient sont définis (bloc 1.1). Nous devons maintenant créer les API routes pour les opérations CRUD sur les patients, utilisant le client FHIR pour persister les données.

---

## Objectif de ce bloc

Créer les endpoints API REST pour la gestion des patients : liste, recherche, création, lecture, modification, suppression.

---

## Pré-requis

- [ ] Bloc 1.1 terminé
- [ ] Client FHIR fonctionnel (bloc 0.3)
- [ ] Types Patient et FHIRPatient disponibles

---

## Spécifications

### Ce qui doit être créé

1. **Route `/api/patients`** :
   - `GET` : Liste patients avec pagination
   - `POST` : Création nouveau patient

2. **Route `/api/patients/search`** :
   - `GET` : Recherche patients par nom, prénom, DDN, téléphone

3. **Route `/api/patients/[id]`** :
   - `GET` : Détail patient par ID
   - `PUT` : Modification patient
   - `DELETE` : Suppression patient

4. **Gestion des erreurs** standardisée (format JSON)

---

## Endpoints détaillés

| Méthode | Route | Query/Body | Response |
|---------|-------|------------|----------|
| GET | `/api/patients` | `?limit=20&offset=0` | `{ data: Patient[], total: number, hasMore: boolean }` |
| POST | `/api/patients` | `PatientFormData` | `Patient` |
| GET | `/api/patients/search` | `?q=dupont` | `{ data: Patient[] }` |
| GET | `/api/patients/[id]` | - | `Patient` |
| PUT | `/api/patients/[id]` | `PatientFormData` | `Patient` |
| DELETE | `/api/patients/[id]` | - | `{ success: true }` |

---

## Format erreurs

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;  // Erreurs de validation par champ
  };
}

// Codes d'erreur
// - VALIDATION_ERROR (400)
// - NOT_FOUND (404)
// - CONFLICT (409) - doublon potentiel
// - INTERNAL_ERROR (500)
```

---

## Logique métier

1. **Création** :
   - Valider avec Zod
   - Vérifier doublon potentiel (même nom + prénom + DDN)
   - Si doublon, retourner 409 avec les patients similaires
   - Sinon créer dans FHIR

2. **Recherche** :
   - Recherche sur nom OU prénom OU téléphone
   - Minimum 2 caractères pour déclencher
   - Limité à 20 résultats
   - Tri par nom, prénom

3. **Suppression** :
   - Soft delete (marquer comme inactif) ou hard delete selon FHIR

---

## Structure attendue

```
src/
└── app/
    └── api/
        └── patients/
            ├── route.ts            # GET list, POST create
            ├── search/
            │   └── route.ts        # GET search
            └── [id]/
                └── route.ts        # GET, PUT, DELETE
```

---

## Exemple implémentation GET /api/patients

```typescript
// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fhirClient } from '@/lib/api/fhir-client';
import { fhirPatientToPatient } from '@/types/patient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Recherche FHIR avec pagination
    const bundle = await fhirClient.search('Patient', {
      _count: String(limit),
      _offset: String(offset),
      _sort: 'family,given',
    });
    
    const patients = bundle.entry?.map(e => fhirPatientToPatient(e.resource)) || [];
    const total = bundle.total || 0;
    
    return NextResponse.json({
      data: patients,
      total,
      hasMore: offset + patients.length < total,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur' } },
      { status: 500 }
    );
  }
}
```

---

## Validation

Ce bloc est terminé quand :

- [ ] `GET /api/patients` retourne la liste paginée
- [ ] `POST /api/patients` crée un patient valide
- [ ] `POST /api/patients` retourne 400 si données invalides
- [ ] `GET /api/patients/search?q=test` retourne des résultats
- [ ] `GET /api/patients/[id]` retourne le patient
- [ ] `GET /api/patients/[id]` retourne 404 si inexistant
- [ ] `PUT /api/patients/[id]` modifie le patient
- [ ] `DELETE /api/patients/[id]` supprime le patient
- [ ] Les erreurs sont formatées correctement

---

## Notes importantes

> ⚠️ Toutes les routes doivent vérifier l'authentification (cookie session Firebase). Si non authentifié, retourner 401.

> La recherche FHIR utilise les paramètres : `name` pour nom/prénom, `birthdate` pour DDN, `phone` pour téléphone.

> Pour la détection de doublon, utiliser une recherche FHIR combinée avant création.

---

## Prochain bloc

**[BLOC 1.3]** — UI Liste + Recherche Patients
