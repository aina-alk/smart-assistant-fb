# [BLOC 6.1] — API + Types Tâches (FHIR Task)

**Bloc** : 6.1 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Bloc 5 terminé

---

## Contexte

Le module documents est complet (bloc 5). Nous ajoutons maintenant un système de gestion des tâches pour le suivi des actions à faire.

---

## Objectif de ce bloc

Créer les types, schémas de validation, et API CRUD pour les tâches, utilisant le format FHIR Task.

---

## Pré-requis

- [ ] Bloc 5 terminé
- [ ] Client FHIR fonctionnel

---

## Spécifications

### Ce qui doit être créé

1. **Types Tâche** (`types/tache.ts`) :
   - Interface `Tache` (format app)
   - Interface `FHIRTask` (format FHIR)
   - Mapping bidirectionnel

2. **Schémas Zod** (`lib/validations/tache.ts`) :
   - `tacheFormSchema`

3. **API Routes** :
   - `GET /api/taches` : liste avec filtres
   - `POST /api/taches` : création
   - `GET /api/taches/[id]` : détail
   - `PUT /api/taches/[id]` : modification
   - `DELETE /api/taches/[id]` : suppression
   - `POST /api/taches/[id]/complete` : marquer terminée

4. **Hooks** :
   - `useTaches(params)` : liste
   - `useCreateTache()` : création
   - `useUpdateTache()` : modification
   - `useCompleteTache()` : marquer terminée

---

## Types Tâche

```typescript
type TachePriorite = 'basse' | 'normale' | 'haute' | 'urgente';
type TacheStatut = 'a_faire' | 'en_cours' | 'terminee' | 'annulee';
type TacheCategorie = 'rappel' | 'suivi' | 'administratif' | 'medical' | 'autre';

interface Tache {
  id: string;
  titre: string;
  description?: string;
  
  // Priorité et statut
  priorite: TachePriorite;
  statut: TacheStatut;
  categorie: TacheCategorie;
  
  // Dates
  echeance?: Date;
  rappel?: Date;
  
  // Relations
  patientId?: string;
  consultationId?: string;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

---

## Mapping FHIR Task

```typescript
interface FHIRTask {
  resourceType: 'Task';
  id: string;
  status: 'draft' | 'requested' | 'in-progress' | 'completed' | 'cancelled';
  intent: 'proposal' | 'plan' | 'order';
  priority: 'routine' | 'urgent' | 'asap' | 'stat';
  code: {
    coding: [{
      system: string;
      code: string;  // Catégorie
    }];
  };
  description: string;
  for?: {
    reference: string;  // Patient/{id}
  };
  encounter?: {
    reference: string;  // Encounter/{id}
  };
  authoredOn: string;
  lastModified: string;
  restriction?: {
    period: {
      end: string;  // Échéance
    };
  };
  extension?: [{
    url: 'reminder';
    valueDateTime: string;
  }];
}
```

---

## Endpoints

| Méthode | Route | Query/Body | Response |
|---------|-------|------------|----------|
| GET | `/api/taches` | `?statut=&priorite=&patient_id=&echeance_avant=` | `{ data: Tache[], total }` |
| POST | `/api/taches` | `TacheFormData` | `Tache` |
| GET | `/api/taches/[id]` | - | `Tache` |
| PUT | `/api/taches/[id]` | `Partial<Tache>` | `Tache` |
| DELETE | `/api/taches/[id]` | - | `{ success: true }` |
| POST | `/api/taches/[id]/complete` | - | `Tache` |

---

## Schéma Zod

```typescript
const tacheFormSchema = z.object({
  titre: z.string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
    
  description: z.string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional(),
    
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
  
  categorie: z.enum(['rappel', 'suivi', 'administratif', 'medical', 'autre']),
  
  echeance: z.date().optional(),
  
  rappel: z.date().optional(),
  
  patientId: z.string().uuid().optional(),
  
  consultationId: z.string().uuid().optional(),
});
```

---

## Structure attendue

```
src/
├── types/
│   └── tache.ts
├── lib/
│   ├── validations/
│   │   └── tache.ts
│   └── hooks/
│       ├── use-taches.ts
│       ├── use-create-tache.ts
│       ├── use-update-tache.ts
│       └── use-complete-tache.ts
└── app/
    └── api/
        └── taches/
            ├── route.ts
            └── [id]/
                ├── route.ts
                └── complete/
                    └── route.ts
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Types Tache définis
- [ ] Mapping FHIR ↔ App fonctionne
- [ ] `POST /api/taches` crée une tâche
- [ ] `GET /api/taches?statut=a_faire` filtre correctement
- [ ] `GET /api/taches?priorite=urgente` filtre correctement
- [ ] `POST /api/taches/[id]/complete` marque terminée
- [ ] Hooks TanStack Query fonctionnent

---

## Notes importantes

> ⚠️ Les tâches urgentes seront mises en avant dans le dashboard.

> Une tâche peut être liée à un patient ET/OU une consultation.

> Le rappel déclenche une notification (hors scope MVP, mais prévoir le champ).

---

## Prochain bloc

**[BLOC 6.2]** — UI Gestion Tâches + Dashboard Widget
