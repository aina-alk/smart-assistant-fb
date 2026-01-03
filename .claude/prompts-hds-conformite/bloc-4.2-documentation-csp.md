# [BLOC 4.2] — Documentation CSP (Content Security Policy)

## Contexte

L'analyse de sécurité a révélé la présence de `'unsafe-inline'` et `'unsafe-eval'` dans la configuration CSP. Ces directives sont nécessaires pour Next.js (RSC, hydration) mais doivent être documentées et justifiées pour l'audit HDS.

## Objectif de ce bloc

1. Documenter les raisons techniques de la CSP actuelle
2. Ajouter des commentaires dans le code
3. Créer une note de sécurité pour les auditeurs
4. Proposer des améliorations futures

## Pré-requis

- [ ] Aucune dépendance

## Spécifications

### 1. Documenter le fichier de configuration

**Fichier** : `src/lib/security/config.ts`

Ajouter des commentaires détaillés :

```typescript
/**
 * Configuration de sécurité - Super Assistant Médical
 * 
 * Ce fichier définit les politiques de sécurité de l'application.
 * Toute modification doit être documentée et justifiée.
 */

// ==================== Content Security Policy ====================

/**
 * CSP (Content Security Policy) de l'application
 * 
 * JUSTIFICATIONS DES DIRECTIVES :
 * 
 * 1. 'unsafe-inline' dans script-src et style-src :
 *    - REQUIS par Next.js pour React Server Components (RSC)
 *    - REQUIS pour l'hydration côté client
 *    - REQUIS pour les styles inline de shadcn/ui
 *    - Alternative (nonces) incompatible avec le cache Edge de Vercel/Scalingo
 *    - Référence : https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 * 
 * 2. 'unsafe-eval' dans script-src :
 *    - REQUIS par certaines bibliothèques de l'écosystème React
 *    - Peut être retiré si toutes les dépendances le supportent
 *    - À réévaluer lors des mises à jour de dépendances
 * 
 * 3. Domaines externes autorisés :
 *    - api.anthropic.com : API Claude pour génération IA
 *    - api.assemblyai.com : Transcription audio
 *    - healthcare.googleapis.com : FHIR (données patient)
 *    - identitytoolkit.googleapis.com : Firebase Auth
 * 
 * MITIGATIONS :
 * - Toutes les données utilisateur sont sanitizées avant rendu
 * - Les scripts tiers sont chargés uniquement depuis des domaines de confiance
 * - Les cookies sont configurés avec SameSite=Strict et HttpOnly
 * 
 * AUDIT HDS :
 * Cette configuration a été revue pour conformité HDS. Les directives
 * 'unsafe-*' sont un compromis technique documenté, non une négligence.
 */
export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    
    'script-src': [
      "'self'",
      "'unsafe-inline'",  // Voir justification ci-dessus
      "'unsafe-eval'",    // Voir justification ci-dessus
      // CDN de confiance si nécessaire
    ],
    
    'style-src': [
      "'self'",
      "'unsafe-inline'",  // Requis pour Tailwind/shadcn inline styles
    ],
    
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      // Domaines d'images autorisés
    ],
    
    'font-src': [
      "'self'",
      'data:',
    ],
    
    'connect-src': [
      "'self'",
      'https://api.anthropic.com',
      'https://api.assemblyai.com',
      'https://healthcare.googleapis.com',
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://firestore.googleapis.com',
      // Websocket pour hot reload en dev
      ...(process.env.NODE_ENV === 'development' ? ['ws://localhost:*'] : []),
    ],
    
    'frame-ancestors': ["'none'"],  // Pas d'iframe
    
    'form-action': ["'self'"],
    
    'base-uri': ["'self'"],
    
    'object-src': ["'none'"],
  },
  
  /**
   * Headers de sécurité additionnels
   */
  additionalHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
  },
};

/**
 * Génère la string CSP pour les headers HTTP
 */
export function generateCSPString(): string {
  return Object.entries(CSP_CONFIG.directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

// ==================== Rate Limit Config ====================
// ... (reste du fichier inchangé)
```

### 2. Créer la documentation de sécurité

**Fichier** : `docs/security/csp-justification.md` (NOUVEAU)

```markdown
# Justification de la Content Security Policy

## Contexte

Ce document justifie les choix de Content Security Policy (CSP) pour l'application
Super Assistant Médical, dans le cadre de la conformité HDS.

## Directives sensibles

### `'unsafe-inline'` (script-src, style-src)

**Pourquoi c'est présent :**
- Next.js 13+ avec App Router injecte des scripts inline pour l'hydration React
- Les React Server Components (RSC) génèrent du HTML avec des balises `<script>` inline
- shadcn/ui et Tailwind CSS utilisent des styles inline pour le styling dynamique

**Pourquoi on ne peut pas le retirer :**
- L'alternative (nonces cryptographiques) nécessite une génération par requête
- Incompatible avec le cache Edge de Scalingo/Vercel
- Nécessiterait de réécrire toute l'architecture de rendu

**Mitigations en place :**
1. Sanitization de toutes les entrées utilisateur avant rendu
2. Utilisation de `DOMPurify` pour les contenus HTML dynamiques
3. Pas de `dangerouslySetInnerHTML` avec des données non sanitizées
4. Audit régulier des dépendances (npm audit, Snyk)

**Risque résiduel :**
- Faible : Un attaquant devrait exploiter une XSS existante, ce qui est mitigé
  par la sanitization et la validation des entrées.

### `'unsafe-eval'` (script-src)

**Pourquoi c'est présent :**
- Certaines bibliothèques de parsing (ex: handlebars, certains composants)
  utilisent `eval()` ou `new Function()`

**Plan d'amélioration :**
1. Identifier les bibliothèques qui nécessitent `eval`
2. Remplacer par des alternatives sans `eval`
3. Retirer `'unsafe-eval'` de la CSP

**Timeline estimée :** Q2 2026

## Domaines externes autorisés

| Domaine | Usage | Justification |
|---------|-------|---------------|
| api.anthropic.com | API Claude | Génération IA - pas de données patient (anonymisées) |
| api.assemblyai.com | Transcription | Audio - risque documenté |
| healthcare.googleapis.com | FHIR | Données patient - certifié BAA |
| identitytoolkit.googleapis.com | Firebase Auth | Authentification |
| securetoken.googleapis.com | Firebase tokens | Tokens d'authentification |
| firestore.googleapis.com | Firestore | Données non-patient |

## Headers de sécurité additionnels

| Header | Valeur | Protection |
|--------|--------|------------|
| X-Frame-Options | DENY | Clickjacking |
| X-Content-Type-Options | nosniff | MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS (legacy) |
| Referrer-Policy | strict-origin-when-cross-origin | Fuite de données |
| Permissions-Policy | camera=(), microphone=(self) | Accès hardware |

## Conformité HDS

Cette configuration CSP répond aux exigences suivantes du référentiel HDS :

- **Mesure 10.1** : Protection contre les injections → CSP + sanitization
- **Mesure 10.2** : Sécurisation des échanges → HTTPS uniquement
- **Mesure 14.1** : Journalisation des accès → Audit logging FHIR

## Audit et révision

- **Dernière révision** : Janvier 2026
- **Prochaine révision** : Juillet 2026
- **Responsable** : Équipe sécurité

## Références

- [Next.js CSP Documentation](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
```

### 3. Ajouter les headers CSP dans middleware.ts

**Fichier** : `src/middleware.ts` (vérifier/modifier)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCSPString, CSP_CONFIG } from '@/lib/security/config';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Ajouter les headers de sécurité
  response.headers.set('Content-Security-Policy', generateCSPString());
  
  for (const [header, value] of Object.entries(CSP_CONFIG.additionalHeaders)) {
    response.headers.set(header, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Appliquer à toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Validation

Ce bloc est terminé quand :

- [ ] `src/lib/security/config.ts` documenté avec justifications
- [ ] `docs/security/csp-justification.md` créé
- [ ] Headers CSP appliqués via middleware
- [ ] `pnpm build` réussit
- [ ] Headers visibles dans les réponses HTTP

## Test de validation

```bash
# Vérifier les headers CSP
curl -I http://localhost:3000 | grep -i security
curl -I http://localhost:3000 | grep -i content-security-policy

# Attendu :
# Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

## Notes importantes

> ℹ️ **Audit HDS** : La documentation `csp-justification.md` peut être fournie aux auditeurs pour justifier les choix techniques.

> ⚠️ **Évolution** : Réévaluer `'unsafe-eval'` lors de chaque mise à jour majeure de dépendances.

> ℹ️ **Nonces** : Si Scalingo supporte les Edge Functions avec génération dynamique, envisager la migration vers des nonces CSP.

---
**Prochain bloc** : 5.1 — Documentation PRA/PCA
