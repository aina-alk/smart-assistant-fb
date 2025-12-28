# [BLOC 1.4] — UI Fiche Patient + Timeline

**Bloc** : 1.4 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 1.3 terminé

---

## Contexte

La liste patients est fonctionnelle (bloc 1.3). Nous devons maintenant créer la page de détail d'un patient avec son historique et ses informations.

---

## Objectif de ce bloc

Créer la fiche patient complète avec onglets : informations, timeline des consultations, tâches, et mode édition.

---

## Pré-requis

- [ ] Bloc 1.3 terminé
- [ ] API patient détail fonctionnelle

---

## Spécifications

### Ce qui doit être créé

1. **Page Fiche Patient** (`app/(dashboard)/patients/[id]/page.tsx`) :
   - Header avec nom et actions
   - Onglets : Timeline, Tâches, Documents
   - Infos patient en sidebar/header

2. **Page Édition Patient** (`app/(dashboard)/patients/[id]/edit/page.tsx`) :
   - Formulaire pré-rempli
   - Sauvegarde modifications

3. **Composants** :
   - `PatientHeader` : nom, âge, sexe, actions
   - `PatientInfo` : carte infos détaillées
   - `PatientTimeline` : historique consultations (placeholder)
   - `PatientTabs` : navigation onglets

4. **Hook** :
   - `usePatient(id)` : données patient avec TanStack Query
   - `useUpdatePatient()` : mutation modification

---

## Design Fiche Patient

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Patients                                                    [ ✏️ Modifier ]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐   DUPONT Jean                                                 │
│  │         │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                            │
│  │   👤    │   📅 15/03/1966 (58 ans)  |  👨 Homme                         │
│  │         │   📱 06 12 34 56 78       |  ✉️ jean.dupont@email.com         │
│  └─────────┘   🏠 12 rue de la Paix, 75001 Paris                           │
│                                                                             │
│                NIR: 1 66 03 75 001 123 45  |  Mutuelle: MGEN - 123456789   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                        │
│  │ 📋 Timeline  │ │ ✅ Tâches    │ │ 📄 Documents │                        │
│  └──────────────┘ └──────────────┘ └──────────────┘                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TIMELINE                                          [ + Nouvelle Consult. ]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                                                                        ││
│  │            Aucune consultation pour ce patient                         ││
│  │                                                                        ││
│  │                   [ Créer la première consultation ]                   ││
│  │                                                                        ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Onglets

| Onglet | Contenu | Badge |
|--------|---------|-------|
| Timeline | Liste consultations/interventions | Nombre total |
| Tâches | Tâches liées au patient | Nombre en cours |
| Documents | PDFs générés | Nombre total |

---

## États à gérer

- Loading : Skeleton de la fiche
- Erreur : Message + bouton retry
- Patient inexistant : 404 avec lien retour
- Timeline vide : Empty state avec CTA

---

## Structure attendue

```
src/
├── app/
│   └── (dashboard)/
│       └── patients/
│           └── [id]/
│               ├── page.tsx
│               └── edit/
│                   └── page.tsx
├── components/
│   └── patients/
│       ├── patient-header.tsx
│       ├── patient-info.tsx
│       ├── patient-timeline.tsx
│       └── patient-tabs.tsx
└── lib/
    └── hooks/
        ├── use-patient.ts
        └── use-update-patient.ts
```

---

## Validation

Ce bloc est terminé quand :

- [ ] `/patients/[id]` affiche la fiche patient
- [ ] Informations patient correctement affichées
- [ ] Onglets fonctionnent (Timeline actif par défaut)
- [ ] Timeline affiche "Aucune consultation" (empty state)
- [ ] Bouton "Modifier" ouvre la page édition
- [ ] Page édition pré-remplit le formulaire
- [ ] Modification sauvegarde et redirige
- [ ] Patient inexistant → page 404
- [ ] Loading state avec skeleton

---

## Notes importantes

> ⚠️ La timeline sera alimentée dans les blocs suivants (consultations). Pour l'instant, afficher un empty state.

> L'onglet Tâches sera implémenté au bloc 6. Pour l'instant, afficher "Bientôt disponible".

> L'onglet Documents sera implémenté au bloc 5.

---

## Prochain bloc

**[BLOC 2.1]** — Client AssemblyAI + WebSocket
