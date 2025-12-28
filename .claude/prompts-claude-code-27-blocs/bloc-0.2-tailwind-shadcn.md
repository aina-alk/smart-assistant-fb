# [BLOC 0.2] — Configuration Tailwind + shadcn/ui

**Bloc** : 0.2 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 0.1 terminé

---

## Contexte

Le projet Next.js 15 est initialisé (bloc 0.1). Nous devons maintenant configurer le système de design avec Tailwind CSS et les composants shadcn/ui pour une UI professionnelle et accessible.

---

## Objectif de ce bloc

Installer et configurer Tailwind CSS avec un thème médical personnalisé, puis initialiser shadcn/ui avec les composants de base nécessaires au projet.

---

## Pré-requis

- [ ] Bloc 0.1 terminé
- [ ] Projet Next.js fonctionnel

---

## Spécifications

### Ce qui doit être créé

1. **Tailwind CSS** configuré avec :
   - Design tokens personnalisés (couleurs médicales)
   - Font Inter depuis Google Fonts
   - Pas de dark mode (application médicale = light only)

2. **shadcn/ui** initialisé avec composants :
   - button
   - card
   - input
   - label
   - form
   - dialog
   - alert-dialog
   - table
   - tabs
   - badge
   - avatar
   - toast (+ sonner)
   - skeleton
   - select
   - dropdown-menu
   - separator
   - scroll-area
   - sheet (pour sidebar mobile)
   - popover
   - command (pour recherche)

3. **Utilitaire cn()** pour class merging

4. **Design tokens** dans globals.css :
   ```
   Couleurs :
   - primary: #2563eb (Blue 600) - Actions principales
   - primary-foreground: #ffffff
   - secondary: #64748b (Slate 500)
   - success: #22c55e (Green 500) - Via custom
   - warning: #f59e0b (Amber 500) - Via custom
   - destructive: #ef4444 (Red 500)
   - background: #ffffff
   - foreground: #0f172a (Slate 900)
   - muted: #f1f5f9 (Slate 100)
   - muted-foreground: #64748b
   - border: #e2e8f0 (Slate 200)
   - ring: #2563eb
   
   Radius: 0.5rem (8px) par défaut
   ```

### Comportement attendu

- Tous les composants shadcn/ui fonctionnent
- Le thème personnalisé s'applique
- La font Inter est chargée
- Pas de flash de dark mode

### Contraintes techniques

- Utiliser la CLI shadcn pour l'installation
- Style "new-york" pour shadcn/ui
- baseColor "slate"
- CSS variables activées

---

## Structure attendue

```
src/
├── app/
│   ├── layout.tsx              # Mise à jour avec font Inter + Toaster
│   ├── globals.css             # Tokens CSS complets
│   └── page.tsx                # Page démo des composants
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── form.tsx
│       ├── dialog.tsx
│       ├── alert-dialog.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── sonner.tsx
│       ├── skeleton.tsx
│       ├── select.tsx
│       ├── dropdown-menu.tsx
│       ├── separator.tsx
│       ├── scroll-area.tsx
│       ├── sheet.tsx
│       ├── popover.tsx
│       └── command.tsx
├── lib/
│   └── utils.ts                # Fonction cn()
├── components.json             # Config shadcn
└── tailwind.config.ts          # Config Tailwind
```

---

## Page de démo temporaire

La page d'accueil doit afficher une démo des composants pour vérifier l'installation :

```tsx
// Afficher :
// - Un Card avec titre "Super Assistant Médical" et description
// - Un Button primary "Commencer"
// - Un Button secondary "En savoir plus"  
// - Un Input avec label "Email"
// - Un Badge "Beta"
// - Un bouton qui déclenche un Toast de succès
```

---

## Validation

Ce bloc est terminé quand :

- [ ] `pnpm dev` démarre sans erreur
- [ ] La page affiche la démo des composants
- [ ] Les couleurs custom s'appliquent (primary blue)
- [ ] La font Inter est chargée
- [ ] Le toast fonctionne (clic sur bouton)
- [ ] Pas de mode sombre visible

---

## Notes importantes

> ⚠️ S'assurer que le Toaster (Sonner) est ajouté dans le layout.tsx racine.

> ⚠️ Ajouter les couleurs custom success et warning dans tailwind.config.ts en extend.

---

## Prochain bloc

**[BLOC 0.3]** — Setup Google Cloud + FHIR Store
