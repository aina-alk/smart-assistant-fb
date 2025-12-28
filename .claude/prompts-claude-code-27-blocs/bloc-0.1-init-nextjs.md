# [BLOC 0.1] — Initialisation Projet Next.js 15

**Bloc** : 0.1 / 27  
**Durée estimée** : 25 min  
**Dépendances** : Aucune (premier bloc)

---

## Contexte

Nous démarrons le développement de "Super Assistant Médical", une application web pour chirurgiens ORL permettant de générer des comptes-rendus de consultation via dictée vocale et IA. Ce premier bloc initialise le projet avec la stack technique définie.

**Architecture cible** :
- Frontend : Next.js 15 + React 19 + TypeScript
- Auth : Firebase Authentication
- Data : Google Healthcare FHIR API
- IA : AssemblyAI (transcription) + Claude (génération)

---

## Objectif de ce bloc

Créer la structure de base du projet Next.js 15 avec TypeScript, configuré pour le développement d'une application médicale professionnelle.

---

## Pré-requis

- [ ] Node.js 20+ installé
- [ ] pnpm installé
- [ ] Git configuré

---

## Spécifications

### Ce qui doit être créé

1. **Projet Next.js 15** avec App Router
   - TypeScript 5 en mode strict
   - Alias `@/` pour imports
   
2. **Structure de dossiers** conforme à l'architecture définie
   
3. **Configuration** ESLint + Prettier pour code quality

4. **Package.json** avec les dépendances suivantes :
   - next@15
   - react@19
   - react-dom@19
   - typescript@5
   - @tanstack/react-query
   - zustand
   - react-hook-form
   - @hookform/resolvers
   - zod
   - date-fns
   - lucide-react
   - clsx
   - tailwind-merge

5. **Fichier .env.example** avec toutes les variables nécessaires (sans valeurs)

### Comportement attendu

- `pnpm dev` démarre le serveur sans erreur sur port 3000
- Page d'accueil affiche "Super Assistant Médical - Setup en cours"
- TypeScript compile sans erreur ni warning

### Contraintes techniques

- Utiliser pnpm comme package manager
- App Router uniquement (pas de pages/)
- Pas de `use client` sauf si nécessaire
- Fichiers en .tsx pour composants, .ts pour utilitaires

---

## Structure attendue

```
super-assistant-medical/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── lib/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── validations/
│   │   ├── utils/
│   │   ├── prompts/
│   │   └── constants/
│   └── types/
│       └── index.ts
├── public/
│   └── .gitkeep
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Variables .env.example

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Cloud (FHIR)
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=
HEALTHCARE_DATASET_ID=
HEALTHCARE_FHIR_STORE_ID=
HEALTHCARE_LOCATION=

# Services IA
ASSEMBLYAI_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Validation

Ce bloc est terminé quand :

- [ ] `pnpm install` s'exécute sans erreur
- [ ] `pnpm dev` démarre le serveur
- [ ] `pnpm build` compile sans erreur
- [ ] `pnpm lint` passe sans erreur
- [ ] La page http://localhost:3000 s'affiche
- [ ] Structure de dossiers créée

---

## Notes importantes

> ⚠️ Ne pas installer Tailwind ni shadcn/ui dans ce bloc — ce sera fait dans le bloc 0.2.

> ⚠️ Ne pas installer Firebase dans ce bloc — ce sera fait dans le bloc 0.4.

---

## Prochain bloc

**[BLOC 0.2]** — Configuration Tailwind + shadcn/ui
