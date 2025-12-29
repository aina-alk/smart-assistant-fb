# Configuration Firebase Authentication

## Configuration complétée

Le système d'authentification Firebase est maintenant entièrement configuré :

- ✅ Firebase Client SDK configuré
- ✅ Firebase Admin SDK configuré
- ✅ AuthProvider et hook useAuth
- ✅ API routes pour sessions (httpOnly cookies)
- ✅ Middleware de protection des routes
- ✅ Page de login avec Google OAuth
- ✅ Page d'accueil avec profil utilisateur

## Configuration des credentials Firebase Admin (IMPORTANT)

Pour que l'authentification fonctionne en production, vous devez configurer les credentials Firebase Admin.

### Étape 1 : Obtenir le Service Account

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : `healthcare-f5da0`
3. Cliquez sur l'icône ⚙️ > **Project Settings**
4. Allez dans l'onglet **Service Accounts**
5. Cliquez sur **Generate new private key**
6. Un fichier JSON sera téléchargé

### Étape 2 : Extraire les informations

Ouvrez le fichier JSON téléchargé et copiez :

```json
{
  "type": "service_account",
  "project_id": "healthcare-f5da0",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@healthcare-f5da0.iam.gserviceaccount.com",
  ...
}
```

### Étape 3 : Mettre à jour .env.local

Copiez les valeurs dans votre `.env.local` :

```bash
# Firebase Admin (server only)
FIREBASE_ADMIN_PROJECT_ID=healthcare-f5da0
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@healthcare-f5da0.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX...\n-----END PRIVATE KEY-----\n"
```

**Important** : La `FIREBASE_ADMIN_PRIVATE_KEY` doit être entre guillemets et conserver les `\n`.

### Étape 4 : Redémarrer le serveur

```bash
pnpm dev
```

## Architecture du système

### Flow d'authentification

```
1. User clique "Continuer avec Google" sur /login
2. Popup Google OAuth s'ouvre (Firebase Client)
3. Firebase Auth retourne ID Token
4. onAuthStateChanged détecte le user
5. POST /api/auth/session avec idToken
6. Firebase Admin vérifie le token
7. Création du session cookie (httpOnly, 5 jours)
8. Cookie stocké dans le navigateur
9. Middleware vérifie le cookie sur chaque requête
10. Accès autorisé aux routes protégées
```

### Structure des fichiers

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Layout centré pour auth
│   │   └── login/
│   │       └── page.tsx        # Page de connexion Google
│   ├── api/
│   │   └── auth/
│   │       └── session/
│   │           └── route.ts    # POST/DELETE session cookie
│   ├── layout.tsx              # Root layout avec AuthProvider
│   └── page.tsx                # Page d'accueil avec profil
├── components/
│   └── providers/
│       └── auth-provider.tsx   # Context React auth
├── lib/
│   ├── firebase/
│   │   ├── config.ts           # Firebase Client SDK
│   │   └── admin.ts            # Firebase Admin SDK
│   └── hooks/
│       └── use-auth.ts         # Hook useAuth()
├── middleware.ts               # Protection des routes
└── types/
    └── auth.ts                 # Types TypeScript
```

## Sécurité

- ✅ Cookies httpOnly (pas d'accès JavaScript côté client)
- ✅ Cookies Secure en production
- ✅ SameSite: 'lax' pour protection CSRF
- ✅ Session cookie vérifié côté serveur (Firebase Admin)
- ✅ Durée de session : 5 jours
- ✅ Private key Firebase Admin jamais exposée côté client

## Test de l'authentification

### En développement (sans credentials Admin)

Si `FIREBASE_ADMIN_CLIENT_EMAIL` et `FIREBASE_ADMIN_PRIVATE_KEY` ne sont pas configurés, Firebase Admin utilisera les credentials par défaut (GOOGLE_APPLICATION_CREDENTIALS).

**Attention** : Cela peut ne pas fonctionner pour la création de session cookies.

### Avec credentials Admin complets

1. Configurez les 3 variables Firebase Admin dans `.env.local`
2. Redémarrez le serveur : `pnpm dev`
3. Accédez à `http://localhost:3000`
4. Vous serez redirigé vers `/login`
5. Cliquez sur "Continuer avec Google"
6. Authentifiez-vous avec votre compte Google
7. Vous serez redirigé vers `/` avec votre profil affiché
8. Le cookie de session est créé et vérifié

## Routes

- `/login` : Page de connexion (publique)
- `/` : Page d'accueil (protégée)
- `/api/auth/session` : API pour gérer les sessions (publique pour POST/DELETE)
- Toutes les autres routes : **Protégées par défaut**

## Debugging

### Vérifier les cookies

Dans Chrome DevTools :
1. Application > Cookies > http://localhost:3000
2. Vérifiez la présence du cookie `session`
3. HttpOnly doit être ✅
4. Secure doit être ❌ (en dev) ou ✅ (en prod)

### Logs serveur

Les erreurs d'authentification sont loggées dans la console du serveur Next.js.

### Firebase Console

Vérifiez les utilisateurs authentifiés :
1. Firebase Console > Authentication > Users
2. Vous devriez voir les utilisateurs connectés via Google

## Production

Avant de déployer en production :

1. ✅ Configurez les variables d'environnement sur votre plateforme (Vercel, etc.)
2. ✅ Assurez-vous que `NODE_ENV=production` pour activer les cookies Secure
3. ✅ Configurez votre domaine dans Firebase Console > Authentication > Settings > Authorized domains
4. ✅ Vérifiez que les credentials Firebase Admin sont correctement configurés

## Support

Pour toute question sur la configuration Firebase :
- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Documentation Firebase Admin](https://firebase.google.com/docs/admin/setup)
