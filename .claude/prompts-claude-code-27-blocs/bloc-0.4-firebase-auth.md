# [BLOC 0.4] — Authentification Firebase

**Bloc** : 0.4 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Blocs 0.1 à 0.3 terminés

---

## Contexte

La connexion au FHIR Store est établie (bloc 0.3). Nous devons maintenant sécuriser l'application avec Firebase Authentication pour permettre aux praticiens de se connecter via Google OAuth.

---

## Objectif de ce bloc

Implémenter l'authentification complète avec Firebase Auth, incluant la configuration Firebase, la page de login, la protection des routes, et la gestion de session côté client et serveur.

---

## Pré-requis

- [ ] Blocs 0.1 à 0.3 terminés
- [ ] Projet Firebase créé (console.firebase.google.com)
- [ ] Authentication activée avec provider Google
- [ ] Configuration Firebase (apiKey, authDomain, etc.) récupérée

---

## Spécifications

### Ce qui doit être créé

1. **Configuration Firebase** (`lib/firebase/config.ts`) :
   - Initialisation Firebase App (client)
   - Export des instances Auth

2. **Firebase Admin** (`lib/firebase/admin.ts`) :
   - Initialisation Firebase Admin SDK (serveur)
   - Vérification des tokens ID

3. **Hooks d'authentification** (`lib/hooks/use-auth.ts`) :
   - `useAuth()` : état utilisateur, loading, error
   - `signInWithGoogle()` : connexion OAuth
   - `signOut()` : déconnexion

4. **Provider Auth** (`components/providers/auth-provider.tsx`) :
   - Context React pour l'état auth
   - Listener onAuthStateChanged
   - Wrapper pour l'application

5. **Middleware de protection** (`middleware.ts`) :
   - Vérifier le cookie de session Firebase
   - Rediriger vers /login si non authentifié
   - Laisser passer /login, /api/auth, /_next, /favicon.ico

6. **API Routes Auth** :
   - `POST /api/auth/session` : créer cookie session après login
   - `DELETE /api/auth/session` : supprimer cookie session (logout)

7. **Page Login** (`app/(auth)/login/page.tsx`) :
   - Design professionnel médical
   - Bouton "Continuer avec Google"
   - Gestion des erreurs

8. **Layout Auth** (`app/(auth)/layout.tsx`) :
   - Layout centré pour pages auth
   - Pas de sidebar

9. **Types Auth** (`types/auth.ts`) :
   - AuthUser (utilisateur Firebase étendu)
   - AuthState

### Dépendances à installer

```bash
pnpm add firebase firebase-admin
```

### Comportement attendu

- Page /login accessible sans auth
- Clic "Continuer avec Google" ouvre popup Google
- Après auth réussie, cookie session créé et redirection vers /
- Accès à / sans auth redirige vers /login
- Logout supprime le cookie et redirige vers /login
- Refresh conserve la session (cookie httpOnly)

### Contraintes techniques

- Firebase Client SDK pour le frontend (popup OAuth)
- Firebase Admin SDK pour le backend (vérification tokens)
- Cookie de session httpOnly, secure (en prod), sameSite: 'lax'
- Durée session : 5 jours (Firebase max)
- Pas de stockage du token dans localStorage (sécurité)

---

## Structure attendue

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           └── session/
│               └── route.ts        # POST et DELETE
├── components/
│   └── providers/
│       └── auth-provider.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts              # Client Firebase
│   │   └── admin.ts               # Admin Firebase (server)
│   └── hooks/
│       └── use-auth.ts
├── types/
│   └── auth.ts
└── middleware.ts
```

---

## Variables d'environnement Firebase

```env
# Firebase Client (NEXT_PUBLIC_ = exposé au client)
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
```

---

## Design Page Login

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                    🏥 Super Assistant Médical                   │
│                                                                 │
│               L'IA qui rédige pour vous pendant                 │
│                  que vous soignez vos patients                  │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │                                 │                │
│              │   🔵 Continuer avec Google      │                │
│              │                                 │                │
│              └─────────────────────────────────┘                │
│                                                                 │
│              Réservé aux professionnels de santé                │
│                                                                 │
│                    [Erreur affichée ici si échec]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flow d'authentification

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│  User   │────▶│ Login Page  │────▶│ Google Auth │────▶│ Firebase│
│         │     │             │     │   Popup     │     │  Auth   │
└─────────┘     └─────────────┘     └─────────────┘     └────┬────┘
                                                              │
     ┌────────────────────────────────────────────────────────┘
     │ ID Token
     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ POST        │────▶│ Firebase    │────▶│ Set Cookie  │
│ /api/auth/  │     │ Admin       │     │ httpOnly    │
│ session     │     │ Verify      │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
     ┌─────────────────────────────────────────┘
     │ Redirect to /
     ▼
┌─────────────┐
│  Dashboard  │
│    (/)      │
└─────────────┘
```

---

## Code clé : API Session

```typescript
// app/api/auth/session/route.ts

// POST - Créer session après login Google
export async function POST(request: Request) {
  const { idToken } = await request.json();
  
  // Vérifier le token avec Firebase Admin
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  
  // Créer un cookie de session (5 jours max Firebase)
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 jours
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  
  // Retourner avec Set-Cookie header
  return new Response(JSON.stringify({ status: 'success' }), {
    headers: {
      'Set-Cookie': `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${expiresIn / 1000}`,
    },
  });
}

// DELETE - Supprimer session (logout)
export async function DELETE() {
  return new Response(JSON.stringify({ status: 'success' }), {
    headers: {
      'Set-Cookie': `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  });
}
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Page /login s'affiche correctement
- [ ] Clic "Continuer avec Google" ouvre le popup
- [ ] Connexion Google réussie crée le cookie session
- [ ] Redirection vers / après login
- [ ] Accès à / sans cookie redirige vers /login
- [ ] `useAuth()` retourne l'utilisateur connecté
- [ ] Logout supprime le cookie et redirige
- [ ] Refresh de page conserve la session

---

## Notes importantes

> ⚠️ Pour Firebase Admin, la clé privée doit être dans .env.local avec les `\n` remplacés ou en JSON échappé.

> ⚠️ Le middleware Next.js ne peut pas utiliser Firebase Admin (Edge runtime). Il doit simplement vérifier la présence du cookie `session`. La validation du token se fait dans les API routes.

> ⚠️ En développement local (http), le cookie ne sera pas `Secure`. Adapter selon NODE_ENV.

---

## Prochain bloc

**[BLOC 0.5]** — Layout Principal + Navigation
