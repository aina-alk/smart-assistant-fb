# [BLOC 5.1] — Documentation PRA/PCA

## Contexte

La certification HDS exige une documentation formelle du Plan de Reprise d'Activité (PRA) et du Plan de Continuité d'Activité (PCA). Ces documents décrivent les procédures en cas d'incident majeur affectant l'application.

## Objectif de ce bloc

Créer la documentation PRA/PCA conforme aux exigences HDS pour l'application Super Assistant Médical hébergée sur Scalingo.

## Pré-requis

- [ ] Aucune dépendance technique
- [ ] Peut être exécuté en parallèle des autres blocs

## Spécifications

### 1. Créer le document PRA/PCA

**Fichier** : `docs/pra-pca.md` (NOUVEAU)

```markdown
# Plan de Reprise et de Continuité d'Activité (PRA/PCA)

## Super Assistant Médical — Version 1.0

**Date de création** : [DATE]
**Dernière mise à jour** : [DATE]
**Responsable** : [NOM DU RESPONSABLE]
**Classification** : Document interne — Confidentiel

---

## 1. Objectifs et Périmètre

### 1.1 Objectif du document

Ce document définit les procédures de reprise et de continuité d'activité pour l'application Super Assistant Médical en cas d'incident majeur affectant la disponibilité, l'intégrité ou la confidentialité des données de santé.

### 1.2 Périmètre

| Composant | Hébergeur | Certification |
|-----------|-----------|---------------|
| Application web Next.js | Scalingo | HDS |
| Base de données FHIR | Google Cloud Healthcare | HDS (région europe-west1) |
| Authentification | Firebase Auth | — |
| Cache/Rate-limiting | Scalingo Redis | HDS |
| Stockage fichiers | Google Cloud Storage | HDS |

### 1.3 Données concernées

- **Données de santé** : Comptes-rendus médicaux, ordonnances, transcriptions
- **Données nominatives** : NIR, identité patients, coordonnées
- **Données professionnelles** : Identifiants médecins, paramètres cabinet

---

## 2. Analyse des Risques

### 2.1 Scénarios de sinistre

| Scénario | Probabilité | Impact | Criticité |
|----------|-------------|--------|-----------|
| Panne Scalingo (région) | Faible | Élevé | Critique |
| Panne GCP Healthcare | Très faible | Critique | Critique |
| Cyberattaque (ransomware) | Moyenne | Critique | Critique |
| Erreur humaine (suppression données) | Moyenne | Moyen | Majeur |
| Panne réseau local cabinet | Élevée | Faible | Mineur |

### 2.2 Objectifs de reprise

| Métrique | Objectif | Justification |
|----------|----------|---------------|
| **RTO** (Recovery Time Objective) | 4 heures | Délai max avant reprise du service |
| **RPO** (Recovery Point Objective) | 1 heure | Perte de données max acceptable |
| **MTPD** (Maximum Tolerable Period of Disruption) | 24 heures | Durée max d'interruption |

---

## 3. Plan de Continuité d'Activité (PCA)

### 3.1 Mode dégradé

En cas d'indisponibilité partielle, l'application bascule en mode dégradé :

| Composant indisponible | Mode dégradé | Impact utilisateur |
|------------------------|--------------|-------------------|
| Redis (rate-limiting) | Fail-secure : blocage des requêtes | Indisponibilité temporaire |
| Anthropic API | Désactivation génération IA | Saisie manuelle uniquement |
| AssemblyAI | Désactivation transcription | Saisie manuelle uniquement |
| FHIR (lecture) | Cache local si disponible | Données potentiellement obsolètes |
| FHIR (écriture) | File d'attente locale | Synchronisation différée |

### 3.2 Procédure d'escalade

```
Niveau 1 (0-15 min)    : Alerte automatique → Équipe technique
Niveau 2 (15-60 min)   : Diagnostic → Responsable technique
Niveau 3 (1-4 heures)  : Escalade → Direction + Support hébergeur
Niveau 4 (>4 heures)   : Activation PRA → Communication utilisateurs
```

### 3.3 Contacts d'urgence

| Rôle | Contact | Téléphone | Email |
|------|---------|-----------|-------|
| Responsable technique | [NOM] | [TEL] | [EMAIL] |
| Support Scalingo | — | — | support@scalingo.com |
| Support GCP | — | — | Via console GCP |
| DPO | [NOM] | [TEL] | [EMAIL] |

---

## 4. Plan de Reprise d'Activité (PRA)

### 4.1 Procédure de reprise — Panne Scalingo

**Durée estimée** : 1-4 heures

1. **Diagnostic** (15 min)
   - Vérifier le status Scalingo : https://status.scalingo.com
   - Identifier la nature de la panne (région, service spécifique)

2. **Communication** (immédiat)
   - Informer les utilisateurs via email/SMS
   - Mettre à jour la page de status interne

3. **Basculement** (si panne > 1h)
   - Option A : Attendre restauration Scalingo (recommandé)
   - Option B : Déploiement d'urgence sur autre région Scalingo
   
4. **Vérification post-reprise**
   - Tester les fonctionnalités critiques
   - Vérifier l'intégrité des données Redis
   - Contrôler les logs d'erreur

### 4.2 Procédure de reprise — Panne GCP Healthcare

**Durée estimée** : Variable (dépend de Google)

1. **Diagnostic** (15 min)
   - Vérifier le status GCP : https://status.cloud.google.com
   - Identifier la portée (FHIR store, région, global)

2. **Mode dégradé**
   - Activer le mode lecture seule si possible
   - Informer les utilisateurs de l'indisponibilité partielle

3. **Reprise**
   - Les données FHIR sont répliquées par Google
   - Aucune action manuelle requise pour la restauration

### 4.3 Procédure de reprise — Cyberattaque

**Durée estimée** : 4-24 heures

1. **Isolation** (immédiat)
   - Couper l'accès public à l'application
   - Révoquer tous les tokens d'API
   - Changer les credentials Firebase Admin

2. **Investigation**
   - Analyser les logs Scalingo et GCP
   - Identifier le vecteur d'attaque
   - Évaluer l'étendue de la compromission

3. **Restauration**
   - Restaurer depuis la dernière sauvegarde saine
   - Redéployer l'application avec les correctifs
   - Réactiver progressivement les accès

4. **Post-incident**
   - Notification CNIL si données personnelles affectées (72h max)
   - Notification des utilisateurs concernés
   - Rapport d'incident détaillé

### 4.4 Procédure de restauration des données

**Sauvegardes disponibles** :

| Donnée | Méthode | Rétention | Restauration |
|--------|---------|-----------|--------------|
| FHIR (patients, CRC, CRO) | GCP automatic backup | 30 jours | Via console GCP |
| Redis (sessions, rate-limit) | Scalingo daily backup | 7 jours | Via CLI Scalingo |
| Firestore (autorisations) | Firebase automatic | 7 jours | Via console Firebase |
| Code source | Git (GitHub) | Illimité | `git clone` |

**Commandes de restauration** :

```bash
# Restaurer Redis Scalingo
scalingo -a selav-medical addons-redis-restore <backup_id>

# Restaurer Firestore
# Via console Firebase > Firestore > Import/Export

# Restaurer FHIR
# Via console GCP > Healthcare > FHIR store > Import
```

---

## 5. Tests et Maintenance

### 5.1 Planning des tests

| Test | Fréquence | Responsable | Dernière exécution |
|------|-----------|-------------|-------------------|
| Test de restauration Redis | Trimestriel | Équipe technique | [DATE] |
| Test de failover application | Semestriel | Équipe technique | [DATE] |
| Simulation cyberattaque | Annuel | Prestataire sécurité | [DATE] |
| Revue du document PRA/PCA | Annuel | Responsable technique | [DATE] |

### 5.2 Historique des incidents

| Date | Incident | Durée | Actions | Leçons apprises |
|------|----------|-------|---------|-----------------|
| — | — | — | — | — |

---

## 6. Conformité HDS

### 6.1 Exigences respectées

- ✅ **Sauvegarde des données** : Automatique via GCP et Scalingo
- ✅ **Chiffrement** : TLS 1.3 en transit, AES-256 au repos
- ✅ **Traçabilité** : Logs d'audit nominatifs (bloc 3.x)
- ✅ **Localisation** : Données hébergées en France/UE
- ✅ **Réversibilité** : Export FHIR standard possible

### 6.2 Certification

| Hébergeur | Certification | Validité |
|-----------|---------------|----------|
| Scalingo | HDS | [VÉRIFIER DATE] |
| Google Cloud (europe-west1) | HDS | [VÉRIFIER DATE] |

---

## 7. Annexes

### 7.1 Checklist reprise d'activité

- [ ] Status des hébergeurs vérifié
- [ ] Équipe technique alertée
- [ ] Communication utilisateurs envoyée
- [ ] Mode dégradé activé si nécessaire
- [ ] Logs analysés
- [ ] Données restaurées si nécessaire
- [ ] Tests post-reprise effectués
- [ ] Rapport d'incident rédigé

### 7.2 Références

- Documentation Scalingo : https://doc.scalingo.com
- Documentation GCP Healthcare : https://cloud.google.com/healthcare-api/docs
- Référentiel HDS : https://esante.gouv.fr/produits-services/hds

---

**Document approuvé par** : _________________________ Date : _____________

**Prochaine revue prévue** : _________________________
```

## Structure attendue

```
docs/
├── fhir-playbook.md           # Existant
├── scalingo-setup.md          # Créé bloc 0.4
└── pra-pca.md                 # NOUVEAU - Ce bloc
```

## Validation

Ce bloc est terminé quand :

- [ ] `docs/pra-pca.md` créé avec toutes les sections
- [ ] Les placeholders [DATE], [NOM], etc. sont identifiés pour remplissage ultérieur
- [ ] Le document couvre les exigences HDS de base
- [ ] Les procédures sont actionnables

## Notes importantes

> ⚠️ **Placeholders** : Ce document contient des placeholders à compléter avec les vraies informations (contacts, dates, etc.)

> ⚠️ **Revue régulière** : Ce document doit être revu et mis à jour au moins annuellement ou après chaque incident majeur.

> ℹ️ **Certification HDS** : Vérifier les dates de validité des certifications HDS de Scalingo et GCP avant mise en production.

> ℹ️ **Tests** : Les procédures doivent être testées régulièrement pour s'assurer qu'elles sont toujours valides.

---
**Prochain bloc** : 5.2 — README migration + checklist déploiement
