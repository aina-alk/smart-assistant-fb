# Selav

L'IA qui rédige vos comptes-rendus médicaux pendant que vous soignez.

## Fonctionnalités

- **Dictée vocale intelligente** — Transcription temps réel avec précision 95%
- **Génération CRC par IA** — Comptes-rendus structurés en quelques secondes
- **Codage automatique** — CIM-10, CCAM, NGAP suggérés automatiquement
- **Ordonnances** — Génération et export PDF
- **Gestion des tâches** — Suivi et rappels intégrés
- **Multi-rôles** — Médecin, secrétaire, technicien, admin

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS |
| Auth | Firebase Authentication |
| Données FHIR | Google Healthcare API |
| Transcription | AssemblyAI |
| Génération IA | Claude API (Anthropic) |
| Hosting | Vercel |

## Installation

```bash
# Cloner le repo
git clone https://github.com/your-org/selav.git
cd selav

# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer en développement
pnpm dev
```

## Configuration

### Variables d'environnement

```bash
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Cloud Healthcare API
GOOGLE_CLOUD_PROJECT=
HEALTHCARE_DATASET_ID=
HEALTHCARE_FHIR_STORE_ID=
HEALTHCARE_LOCATION=europe-west1

# Services IA
ASSEMBLYAI_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Firebase

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activer Authentication avec Google et Email Link
3. Créer une application web et récupérer les credentials
4. Générer une clé de service admin

### Google Cloud Healthcare API

1. Activer l'API Healthcare dans GCP
2. Créer un Dataset et un FHIR Store (version R4)
3. Configurer les permissions IAM

## Scripts

```bash
pnpm dev       # Développement avec Turbopack
pnpm build     # Build production
pnpm start     # Serveur production
pnpm lint      # ESLint
pnpm format    # Prettier
```

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Routes publiques
│   ├── (registration)/     # Inscription
│   ├── admin/              # Dashboard admin
│   ├── medecin/            # Dashboard médecin
│   ├── secretaire/         # Dashboard secrétaire
│   └── technicien/         # Dashboard technicien
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # Sidebar, Header, Nav
│   ├── patients/           # Composants patients
│   ├── consultation/       # Workflow consultation
│   ├── ordonnance/         # Génération ordonnances
│   └── taches/             # Gestion tâches
├── lib/
│   ├── firebase/           # Config Firebase
│   ├── fhir/               # Client FHIR
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   └── validations/        # Schémas Zod
└── types/                  # Types TypeScript
```

## Déploiement

### Vercel

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement
3. Ajouter le domaine autorisé dans Firebase Auth
4. Déployer

### Checklist production

- [ ] Variables d'environnement configurées
- [ ] Domaine Firebase autorisé
- [ ] APIs GCP activées
- [ ] CORS configuré si nécessaire
- [ ] Build sans erreur

## Conformité

| Exigence | Statut |
|----------|--------|
| RGPD | Base légale : exécution contrat de soin |
| Stockage EU | Google europe-west1 |
| HDS | Phase 2 (migration prévue) |

## License

Propriétaire — Tous droits réservés

---

Développé avec soin pour les professionnels de santé.
