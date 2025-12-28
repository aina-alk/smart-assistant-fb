# [BLOC 4.1] — Types + API Consultation (FHIR Encounter)

**Bloc** : 4.1 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Bloc 3 terminé

---

## Contexte

Les modules génération IA sont prêts (bloc 3). Nous devons maintenant créer le backend pour la gestion des consultations.

---

## Objectif de ce bloc

Créer les types, schémas de validation, et API CRUD pour les consultations, utilisant le format FHIR Encounter.

---

## Pré-requis

- [ ] Bloc 3 terminé
- [ ] Client FHIR fonctionnel
- [ ] Types Patient disponibles

---

## Spécifications

### Ce qui doit être créé

1. **Types Consultation** (`types/consultation.ts`) :
   - Interface `Consultation` (format app)
   - Interface `FHIREncounter` (format FHIR)
   - Mapping bidirectionnel

2. **Schémas Zod** (`lib/validations/consultation.ts`) :
   - `consultationFormSchema`
   - `consultationUpdateSchema`

3. **API Routes** :
   - `GET /api/consultations` : liste avec filtres
   - `POST /api/consultations` : création
   - `GET /api/consultations/[id]` : détail
   - `PUT /api/consultations/[id]` : modification
   - `DELETE /api/consultations/[id]` : suppression

4. **Hooks** :
   - `useConsultations(params)` : liste
   - `useConsultation(id)` : détail
   - `useCreateConsultation()` : création
   - `useUpdateConsultation()` : modification

---

## Types Consultation

```typescript
interface Consultation {
  id: string;
  patientId: string;
  praticienId: string;
  date: Date;
  
  // Contenu
  motif: string;
  transcription?: string;
  crc?: CRCGenerated;
  
  // Codage
  diagnostics?: DiagnosticSelection;
  codage?: CodageConsultation;
  
  // Statut
  statut: 'brouillon' | 'en_cours' | 'termine' | 'annule';
  
  // Documents générés
  documents?: string[];    // IDs des DocumentReference
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Mapping FHIR Encounter

```typescript
interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: 'AMB';       // Ambulatory
  };
  type: [{
    coding: [{
      system: string;
      code: 'consultation';
    }];
  }];
  subject: {
    reference: string;  // Patient/{id}
  };
  participant: [{
    individual: {
      reference: string;  // Practitioner/{id}
    };
  }];
  period: {
    start: string;
    end?: string;
  };
  reasonCode: [{
    text: string;       // Motif
  }];
  // Extensions pour données custom
  extension: [{
    url: 'transcription';
    valueString: string;
  }, {
    url: 'crc';
    valueString: string;  // JSON stringifié
  }, {
    url: 'diagnostics';
    valueString: string;
  }, {
    url: 'codage';
    valueString: string;
  }];
}
```

---

## Structure attendue

```
src/
├── types/
│   └── consultation.ts
├── lib/
│   ├── validations/
│   │   └── consultation.ts
│   └── hooks/
│       ├── use-consultations.ts
│       ├── use-consultation.ts
│       ├── use-create-consultation.ts
│       └── use-update-consultation.ts
└── app/
    └── api/
        └── consultations/
            ├── route.ts
            └── [id]/
                └── route.ts
```

---

## Endpoints

| Méthode | Route | Query/Body | Response |
|---------|-------|------------|----------|
| GET | `/api/consultations` | `?patient_id=&date_from=&date_to=&statut=` | `{ data: Consultation[], total }` |
| POST | `/api/consultations` | `{ patientId, motif, date? }` | `Consultation` |
| GET | `/api/consultations/[id]` | - | `Consultation` |
| PUT | `/api/consultations/[id]` | `Partial<Consultation>` | `Consultation` |
| DELETE | `/api/consultations/[id]` | - | `{ success: true }` |

---

## Validation

Ce bloc est terminé quand :

- [ ] Types Consultation définis
- [ ] Mapping FHIR ↔ App fonctionne
- [ ] `POST /api/consultations` crée une consultation
- [ ] `GET /api/consultations?patient_id=xxx` filtre par patient
- [ ] `PUT /api/consultations/[id]` met à jour
- [ ] La timeline patient affiche les consultations
- [ ] Les hooks TanStack Query fonctionnent

---

## Notes importantes

> ⚠️ Les données complexes (CRC, diagnostics, codage) sont stockées en extension FHIR sous forme de JSON stringifié.

> Penser à invalider le cache TanStack Query après création/modification.

> Le statut "brouillon" permet de sauvegarder une consultation incomplète.

---

## Prochain bloc

**[BLOC 4.2]** — Page Nouvelle Consultation (Workflow complet)
