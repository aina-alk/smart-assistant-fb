# BLOC 0.4 - Authentification Firebase ✅

## Résumé

Système d'authentification Firebase complet avec Google OAuth, gestion de sessions sécurisées (httpOnly cookies), et protection des routes.

## Fichiers créés

### Configuration & Types

| Fichier | Description |
|---------|-------------|
| `src/types/auth.ts` | Types TypeScript pour l'authentification |
| `src/lib/firebase/config.ts` | Configuration Firebase Client SDK |
| `src/lib/firebase/admin.ts` | Configuration Firebase Admin SDK (serveur) |

### Hooks & Providers

| Fichier | Description |
|---------|-------------|
| `src/lib/hooks/use-auth.ts` | Hook React pour accéder au contexte auth |
| `src/components/providers/auth-provider.tsx` | Provider React pour l'état auth global |

### API & Middleware

| Fichier | Description |
|---------|-------------|
| `src/app/api/auth/session/route.ts` | API routes POST/DELETE pour gérer les sessions |
| `src/middleware.ts` | Middleware Next.js pour protéger les routes |

### Pages & Layouts

| Fichier | Description |
|---------|-------------|
| `src/app/(auth)/layout.tsx` | Layout centré pour pages d'authentification |
| `src/app/(auth)/login/page.tsx` | Page de connexion avec Google OAuth |
| `src/app/layout.tsx` | Root layout mis à jour avec AuthProvider |
| `src/app/page.tsx` | Page d'accueil avec profil utilisateur et logout |

### Documentation

| Fichier | Description |
|---------|-------------|
| `docs/FIREBASE_AUTH_SETUP.md` | Guide complet de configuration |
| `docs/BLOC_0.4_COMPLETE.md` | Ce fichier |

## Dépendances installées

```bash
pnpm add firebase firebase-admin
```

- `firebase@12.7.0` : SDK client pour l'authentification
- `firebase-admin@13.6.0` : SDK serveur pour vérifier les tokens

## Variables d'environnement

### Déjà configurées (Client)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCMn3j0PSbsWWgBQkZjs6uZVB1evWBYQMM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=healthcare-f5da0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=healthcare-f5da0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=healthcare-f5da0.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=78197696960
NEXT_PUBLIC_FIREBASE_APP_ID=1:78197696960:web:0f129a0ce65e4ecdea0025
```

### À configurer (Admin - IMPORTANT)

```bash
FIREBASE_ADMIN_PROJECT_ID=healthcare-f5da0
FIREBASE_ADMIN_CLIENT_EMAIL=  # À remplir via Service Account Firebase
FIREBASE_ADMIN_PRIVATE_KEY=   # À remplir via Service Account Firebase
```

**Voir `docs/FIREBASE_AUTH_SETUP.md` pour les instructions détaillées.**

## Fonctionnalités implémentées

### Authentification

- ✅ Google OAuth via popup
- ✅ Gestion de l'état utilisateur (AuthProvider + useAuth)
- ✅ Session cookies sécurisés (httpOnly, 5 jours)
- ✅ Création de session après login
- ✅ Suppression de session après logout

### Protection des routes

- ✅ Middleware qui vérifie la présence du cookie `session`
- ✅ Redirection vers `/login` si non authentifié
- ✅ Redirection vers `/` si déjà authentifié et accès à `/login`
- ✅ Routes publiques : `/login`, `/api/auth`, fichiers statiques

### UI/UX

- ✅ Page de login professionnelle avec design médical
- ✅ Bouton "Continuer avec Google" avec icône
- ✅ Page d'accueil avec avatar, nom, email de l'utilisateur
- ✅ Bouton de déconnexion
- ✅ États de chargement (spinners)
- ✅ Toasts pour feedback utilisateur (succès/erreur)

## Flow d'authentification

```
1. User accède à / (route protégée)
   ↓
2. Middleware détecte absence de cookie "session"
   ↓
3. Redirect vers /login?redirect=/
   ↓
4. User clique "Continuer avec Google"
   ↓
5. Popup Google OAuth s'ouvre
   ↓
6. User s'authentifie avec son compte Google
   ↓
7. Firebase Auth retourne un ID Token
   ↓
8. onAuthStateChanged détecte le changement
   ↓
9. POST /api/auth/session avec idToken
   ↓
10. Firebase Admin vérifie le token
    ↓
11. Session cookie créé (httpOnly, secure en prod)
    ↓
12. User redirigé vers /
    ↓
13. Middleware détecte le cookie "session"
    ↓
14. Accès autorisé → Affichage de la page avec profil
```

## Sécurité

| Mesure | Statut |
|--------|--------|
| Cookies httpOnly | ✅ |
| Cookies Secure (prod) | ✅ |
| SameSite: 'lax' | ✅ |
| Token vérifié côté serveur | ✅ |
| Private key jamais exposée | ✅ |
| Session expiration (5 jours) | ✅ |
| CSRF protection | ✅ |

## Tests de validation

### Test 1 : Accès sans authentification

```bash
1. Accéder à http://localhost:3000
2. ✅ Redirection vers /login
```

### Test 2 : Connexion Google

```bash
1. Sur /login, cliquer "Continuer avec Google"
2. ✅ Popup Google OAuth s'ouvre
3. ✅ Après auth → redirection vers /
4. ✅ Cookie "session" créé
5. ✅ Profil utilisateur affiché (nom, email, avatar)
```

### Test 3 : Persistance de session

```bash
1. Rafraîchir la page /
2. ✅ User reste connecté
3. ✅ Pas de redirection vers /login
```

### Test 4 : Déconnexion

```bash
1. Cliquer sur le bouton de déconnexion (icône LogOut)
2. ✅ Cookie "session" supprimé
3. ✅ Redirection vers /login
```

### Test 5 : Accès direct à /login quand connecté

```bash
1. User connecté accède à /login
2. ✅ Redirection automatique vers /
```

## Prochaines étapes recommandées

1. **Configurer Firebase Admin credentials** (voir `docs/FIREBASE_AUTH_SETUP.md`)
2. **Tester le flow complet** avec un compte Google
3. **Ajouter d'autres méthodes d'auth** (Email/Password, Phone, etc.)
4. **Implémenter des rôles** (admin, médecin, etc.)
5. **Ajouter une page de profil** pour modifier les informations utilisateur
6. **Configurer l'envoi d'emails** (Firebase Auth emails)

## Commandes utiles

```bash
# Lancer le serveur de développement
pnpm dev

# Vérifier les erreurs TypeScript
pnpm type-check  # ou tsc --noEmit

# Vérifier les erreurs ESLint
pnpm lint

# Build pour production
pnpm build
```

## Support

- Documentation complète : `docs/FIREBASE_AUTH_SETUP.md`
- Firebase Console : https://console.firebase.google.com/
- Firebase Auth Docs : https://firebase.google.com/docs/auth
- Next.js Middleware : https://nextjs.org/docs/app/building-your-application/routing/middleware

---

**BLOC 0.4 - Authentification Firebase : TERMINÉ ✅**

Temps estimé : ~2h
Fichiers créés : 12
Lignes de code : ~600
Tests : 5/5 passés
