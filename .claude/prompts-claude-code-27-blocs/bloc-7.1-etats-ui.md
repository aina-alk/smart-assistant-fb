# [BLOC 7.1] — États vides, Erreurs, Loading

**Bloc** : 7.1 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Blocs 1-6 terminés

---

## Contexte

Toutes les fonctionnalités sont implémentées (blocs 1-6). Nous devons maintenant polir l'UX avec une gestion cohérente des états.

---

## Objectif de ce bloc

Créer les composants réutilisables pour les états vides, les erreurs, et les états de chargement dans toute l'application.

---

## Pré-requis

- [ ] Blocs 1 à 6 terminés
- [ ] Application fonctionnelle

---

## Spécifications

### Ce qui doit être créé

1. **Composants États Vides** :
   - `EmptyState` : générique réutilisable
   - Variantes par contexte (patients, tâches, etc.)

2. **Composants Erreur** :
   - `ErrorBoundary` : capture erreurs React
   - `ErrorDisplay` : affichage erreur avec retry
   - `NotFound` : page 404

3. **Composants Loading** :
   - `PageSkeleton` : skeleton page entière
   - `TableSkeleton` : skeleton table
   - `CardSkeleton` : skeleton card
   - `FormSkeleton` : skeleton formulaire

4. **Composants Feedback** :
   - Configuration Toasts (succès, erreur, info)
   - `LoadingButton` : bouton avec spinner

5. **Intégration** :
   - Appliquer sur toutes les pages existantes

---

## Design Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                         📋                                      │
│                                                                 │
│                  Aucun patient                                 │
│                                                                 │
│         Commencez par ajouter votre premier patient            │
│         pour pouvoir créer des consultations.                  │
│                                                                 │
│              [ + Ajouter un patient ]                          │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Interface Empty State

```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}
```

---

## Variantes Empty State

| Contexte | Icône | Titre | Description | Action |
|----------|-------|-------|-------------|--------|
| Patients | Users | Aucun patient | Commencez par ajouter... | + Ajouter un patient |
| Consultations | FileText | Aucune consultation | Ce patient n'a pas encore... | + Nouvelle consultation |
| Tâches | CheckSquare | Aucune tâche | Vous n'avez aucune tâche... | + Créer une tâche |
| Documents | File | Aucun document | Cette consultation n'a pas... | Générer un document |
| Recherche | Search | Aucun résultat | Aucun résultat pour "..." | (pas d'action) |

---

## Design Error State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                         ⚠️                                      │
│                                                                 │
│              Une erreur est survenue                            │
│                                                                 │
│         Impossible de charger les données.                     │
│         Veuillez vérifier votre connexion et réessayer.        │
│                                                                 │
│              [ Réessayer ]   [ Retour ]                        │
│                                                                 │
│                         Code: FETCH_ERROR                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Skeleton

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ████████████████                            ▓▓▓▓▓▓▓▓▓▓        │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓   │ ▓▓▓▓▓▓▓▓▓  │ ▓▓▓▓▓▓▓▓▓  │ ▓▓▓▓▓▓▓   │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓   │ ▓▓▓▓▓▓▓▓▓  │ ▓▓▓▓▓▓▓▓▓  │ ▓▓▓▓▓▓▓   │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓   │ ▓▓▓▓▓▓▓▓▓  │ ▓▓▓▓▓▓▓▓▓  │ ▓▓▓▓▓▓▓   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Structure attendue

```
src/
├── components/
│   └── shared/
│       ├── empty-state.tsx
│       ├── error-display.tsx
│       ├── error-boundary.tsx
│       ├── page-skeleton.tsx
│       ├── table-skeleton.tsx
│       ├── card-skeleton.tsx
│       ├── form-skeleton.tsx
│       └── loading-button.tsx
└── app/
    └── not-found.tsx
```

---

## Toasts Configuration

```typescript
// Types de toasts
const toastConfig = {
  success: {
    duration: 3000,
    icon: '✅',
  },
  error: {
    duration: 5000,
    icon: '❌',
  },
  info: {
    duration: 3000,
    icon: 'ℹ️',
  },
  warning: {
    duration: 4000,
    icon: '⚠️',
  },
};

// Exemples d'utilisation
toast.success("Patient créé avec succès");
toast.error("Erreur lors de la sauvegarde");
toast.info("Consultation enregistrée en brouillon");
```

---

## Validation

Ce bloc est terminé quand :

- [ ] EmptyState réutilisable créé
- [ ] Toutes les listes vides utilisent EmptyState
- [ ] ErrorBoundary capture les erreurs
- [ ] ErrorDisplay avec bouton retry
- [ ] Page 404 personnalisée
- [ ] Skeletons pour tables, cards, formulaires
- [ ] LoadingButton avec spinner
- [ ] Toasts configurés et utilisés partout
- [ ] Intégration sur pages existantes

---

## Notes importantes

> ⚠️ L'ErrorBoundary doit être placé dans le layout pour capturer toutes les erreurs.

> Les skeletons doivent refléter la structure réelle du contenu.

> Utiliser Sonner pour les toasts (déjà installé via shadcn).

---

## Prochain bloc

**[BLOC 7.2]** — Responsive + Optimisations + Deploy
