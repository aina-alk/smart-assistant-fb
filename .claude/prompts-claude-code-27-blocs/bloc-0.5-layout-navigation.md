# [BLOC 0.5] — Layout Principal + Navigation

**Bloc** : 0.5 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Blocs 0.1 à 0.4 terminés

---

## Contexte

L'authentification Firebase est en place (bloc 0.4). Nous devons maintenant créer le layout principal de l'application avec la sidebar de navigation, le header, et la structure des routes protégées.

---

## Objectif de ce bloc

Créer le layout dashboard complet avec navigation, affichage utilisateur, et structure des pages principales (placeholders).

---

## Pré-requis

- [ ] Blocs 0.1 à 0.4 terminés
- [ ] Authentification fonctionnelle
- [ ] Composants shadcn/ui disponibles

---

## Spécifications

### Ce qui doit être créé

1. **Layout Dashboard** (`app/(dashboard)/layout.tsx`) :
   - Sidebar fixe à gauche (desktop)
   - Header avec user menu
   - Zone de contenu principale
   - Responsive : Sheet pour mobile

2. **Composants Layout** :
   - `Sidebar` : navigation principale
   - `Header` : titre page + user menu
   - `NavLinks` : liens de navigation avec icônes
   - `UserMenu` : dropdown avec infos user + logout

3. **Pages placeholder** (dashboard) :
   - `/` : Dashboard accueil
   - `/patients` : Liste patients
   - `/consultation/new` : Nouvelle consultation
   - `/tasks` : Tâches
   - `/settings` : Paramètres

4. **Store UI** (`lib/stores/ui-store.ts`) :
   - État sidebar (open/closed mobile)
   - Breadcrumb actuel

### Comportement attendu

- Sidebar visible en permanence sur desktop (≥1024px)
- Sidebar en Sheet (drawer) sur mobile/tablet
- Navigation active state sur le lien courant
- User menu avec email et bouton logout
- Logout fonctionne (redirige vers /login)
- Pages placeholder avec titre

### Contraintes techniques

- Utiliser les composants shadcn/ui : Sheet, DropdownMenu, Avatar, Button
- Icônes Lucide React
- Responsive avec Tailwind breakpoints
- Server Components par défaut, Client Components où nécessaire

---

## Structure attendue

```
src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── page.tsx                    # Dashboard home
│       ├── patients/
│       │   └── page.tsx                # Placeholder
│       ├── consultation/
│       │   └── new/
│       │       └── page.tsx            # Placeholder
│       ├── tasks/
│       │   └── page.tsx                # Placeholder
│       └── settings/
│           └── page.tsx                # Placeholder
├── components/
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── nav-links.tsx
│       ├── user-menu.tsx
│       └── mobile-nav.tsx
└── lib/
    └── stores/
        └── ui-store.ts
```

---

## Design Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                              🔔  👤 Dr. Martin │
│ │   LOGO   │         Super Assistant Médical                    ▼          │
│ └──────────┘                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐                                                                  │
│ │ 🏠     │                                                                  │
│ │ Home   │  ┌─────────────────────────────────────────────────────────────┐│
│ ├────────┤  │                                                             ││
│ │ 👥     │  │                     CONTENU                                 ││
│ │Patients│  │                                                             ││
│ ├────────┤  │                                                             ││
│ │ 📝     │  │                                                             ││
│ │Consult.│  │                                                             ││
│ ├────────┤  │                                                             ││
│ │ ✅     │  │                                                             ││
│ │ Tâches │  │                                                             ││
│ ├────────┤  │                                                             ││
│ │ ⚙️     │  │                                                             ││
│ │Réglages│  │                                                             ││
│ │        │  └─────────────────────────────────────────────────────────────┘│
│ └────────┘                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Navigation Links

| Label | Route | Icône (Lucide) |
|-------|-------|----------------|
| Accueil | `/` | `Home` |
| Patients | `/patients` | `Users` |
| Consultation | `/consultation/new` | `FileText` |
| Tâches | `/tasks` | `CheckSquare` |
| Paramètres | `/settings` | `Settings` |

---

## Page Dashboard (placeholder)

```tsx
// Afficher :
// - Titre "Bienvenue, Dr. [Prénom]"
// - 3 cards stats placeholder :
//   - Consultations aujourd'hui : 0
//   - Tâches urgentes : 0
//   - Patients total : 0
// - Message "Application en cours de développement"
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Layout s'affiche avec sidebar et header
- [ ] Navigation entre pages fonctionne
- [ ] Active state sur lien courant (style différent)
- [ ] User menu affiche email utilisateur
- [ ] Logout fonctionne (redirige vers /login)
- [ ] Mobile : sidebar en Sheet (hamburger menu)
- [ ] Pages placeholder affichent leur titre

---

## Notes importantes

> ⚠️ Le composant Sidebar doit être un Client Component car il utilise usePathname() pour le active state.

> ⚠️ Le UserMenu utilise le hook useAuth() créé au bloc 0.4.

> ⚠️ Sur mobile (< 1024px), la sidebar est cachée et accessible via un bouton hamburger dans le header qui ouvre un Sheet.

---

## Prochain bloc

**[BLOC 1.1]** — Types TypeScript + Schémas Zod Patient
