# [BLOC 4.4] — Page Détail Consultation

**Bloc** : 4.4 / 27  
**Durée estimée** : 25 min  
**Dépendances** : Bloc 4.3 terminé

---

## Contexte

L'éditeur CRC est complet (bloc 4.3). Nous devons maintenant créer la page de consultation existante pour visualiser et modifier.

---

## Objectif de ce bloc

Créer la page de détail d'une consultation avec mode lecture et mode édition.

---

## Pré-requis

- [ ] Blocs 4.1 à 4.3 terminés

---

## Spécifications

### Ce qui doit être créé

1. **Page Détail** (`app/(dashboard)/consultation/[id]/page.tsx`) :
   - Affichage consultation complète
   - Mode lecture par défaut
   - Bouton pour passer en édition

2. **Page Édition** (`app/(dashboard)/consultation/[id]/edit/page.tsx`) :
   - Formulaire d'édition
   - Réutilise les composants du workflow

3. **Composant Consultation View** (`components/consultation/consultation-view.tsx`) :
   - Vue lecture seule du CRC
   - Diagnostics et codage affichés
   - Liens vers documents

---

## Design Page Détail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Retour patient                Consultation du 28/12/2024          ✏️ Mod. │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Patient: DUPONT Jean (58 ans)                        Statut: ✅ Terminée  │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  COMPTE-RENDU                                                              │
│  ─────────────────────────────────────────────────────────────────────     │
│  [Vue lecture seule du CRC - toutes sections affichées]                    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  DIAGNOSTICS                           CODAGE                              │
│  ─────────────────────────────         ─────────────────────────────       │
│  🔴 H90.3 Surdité perception bilat.   CS            30,00 €                │
│  🔵 H93.1 Acouphènes                  CDQP002       26,88 €                │
│                                        Dépassement   30,00 €                │
│                                        ─────────────────────                │
│                                        TOTAL         86,88 €                │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  DOCUMENTS GÉNÉRÉS                                                         │
│  ─────────────────────────────────────────────────────────────────────     │
│  📄 CRC - Compte-rendu consultation           [Télécharger PDF]           │
│  💊 Ordonnance                                [Télécharger PDF]           │
│  🔬 Bilan - Prescription examens              [Télécharger PDF]           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Structure attendue

```
src/
├── app/
│   └── (dashboard)/
│       └── consultation/
│           └── [id]/
│               ├── page.tsx
│               └── edit/
│                   └── page.tsx
└── components/
    └── consultation/
        └── consultation-view.tsx
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Page `/consultation/[id]` affiche la consultation
- [ ] CRC affiché en mode lecture
- [ ] Diagnostics et codage visibles
- [ ] Documents listés avec liens téléchargement
- [ ] Bouton "Modifier" → page édition
- [ ] Page édition permet de modifier
- [ ] Retour patient fonctionne
- [ ] Consultation inexistante → 404

---

## Notes importantes

> ⚠️ Cette page sera liée depuis la timeline patient.

> Les documents seront implémentés dans le bloc 5.

> Le bouton "Modifier" ne doit apparaître que si statut ≠ "annule".

---

## Prochain bloc

**[BLOC 5.1]** — Génération Ordonnance
