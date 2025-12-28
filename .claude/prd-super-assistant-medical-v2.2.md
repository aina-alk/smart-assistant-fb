# PRD — Super Assistant Médical Chirurgien

## Document de Référence Produit

| Métadonnée | Valeur |
|------------|--------|
| **Version** | 2.2 |
| **Date** | 28 décembre 2024 |
| **Statut** | Draft pour validation |
| **Auteur** | Architecte FullStack |
| **Cible initiale** | Chirurgiens ORL (extensible autres spécialités) |
| **Changelog** | v2.2 : Migration Auth.js → Firebase Authentication |

---

## Table des Matières

1. [Problème & Solution](#1-problème--solution)
2. [Persona Utilisateur](#2-persona-utilisateur)
3. [Architecture Fonctionnelle](#3-architecture-fonctionnelle)
4. [MVP Scope & Roadmap](#4-mvp-scope--roadmap)
5. [Modèle de Données](#5-modèle-de-données)
6. [Spécifications par Module](#6-spécifications-par-module)
7. [Parcours Utilisateur](#7-parcours-utilisateur)
8. [Monétisation](#8-monétisation)
9. [Métriques de Succès](#9-métriques-de-succès)
10. [Risques & Mitigations](#10-risques--mitigations)
11. [Timeline](#11-timeline)
12. [Stack Technique](#12-stack-technique)

---

## 1. Problème & Solution

### 1.1 Analyse DURE du Problème

| Critère | Analyse |
|---------|---------|
| **D**ifficile | Rédiger un CRC/CRO complet nécessite de mémoriser l'examen, structurer les informations selon les standards médicaux, intégrer les codes CIM-10/CCAM/NGAP, et produire un document professionnel — tout en gérant le flux de patients |
| **U**rgent | Chaque consultation/intervention génère une dette administrative immédiate. Les chirurgiens accumulent 2-3h de retard documentaire par jour, impactant leur vie personnelle et risquant des erreurs par fatigue |
| **R**épété | Problème quotidien : 15-25 consultations/jour + 2-4 blocs/semaine = milliers de documents à rédiger par an |
| **É**vident | Les chirurgiens en parlent spontanément comme leur principale source de frustration. Le temps administratif est universellement reconnu comme le fléau de la médecine moderne |

### 1.2 Les Deux Workflows d'un Chirurgien

```
              ┌─────────────────────────────────────────────┐
              │           CHIRURGIEN ORL                     │
              │         (puis autres spécialités)            │
              └─────────────────┬───────────────────────────┘
                                │
            ┌───────────────────┴───────────────────┐
            │                                       │
            ▼                                       ▼
┌───────────────────────┐               ┌───────────────────────┐
│   🩺 CONSULTATIONS    │               │   🏥 BLOC OPÉRATOIRE   │
│      (50% temps)      │               │      (50% temps)       │
├───────────────────────┤               ├───────────────────────┤
│                       │               │                       │
│ • Compte-rendu (CRC)  │               │ • Programmation       │
│ • Ordonnances         │               │ • Dossier préop       │
│ • Bilans à prescrire  │               │ • Compte-rendu (CRO)  │
│ • Courriers confrères │               │ • Codage CCAM         │
│ • Codage NGAP/CCAM    │               │ • Consignes postop    │
│                       │               │ • Ordonnances postop  │
└───────────────────────┘               └───────────────────────┘
            │                                       │
            └───────────────────┬───────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   📋 GESTION PATIENT   │
                    │   💰 FACTURATION       │
                    │                       │
                    │ • Historique complet  │
                    │ • Tâches à réaliser   │
                    │ • Priorités           │
                    │ • Parcours de soin    │
                    │ • Factures/Paiements  │
                    └───────────────────────┘
```

### 1.3 Quantification du Problème

#### Workflow Consultations

| Document | Fréquence | Temps moyen | Complexité |
|----------|-----------|-------------|------------|
| Compte-rendu consultation (CRC) | 15-25/jour | 8-12 min | Moyenne |
| Ordonnance | 10-20/jour | 3-5 min | Faible |
| Bilan à prescrire | 5-10/jour | 2-3 min | Faible |
| Courrier confrère | 3-5/jour | 10-15 min | Élevée |
| Codage NGAP/CCAM | 15-25/jour | 2-3 min | Moyenne |

**Temps total consultations** : 2-3h de documentation/jour

#### Workflow Bloc Opératoire

| Document | Fréquence | Temps moyen | Complexité |
|----------|-----------|-------------|------------|
| Dossier préopératoire | 2-4/semaine | 15-20 min | Élevée |
| Compte-rendu opératoire (CRO) | 2-4/semaine | 20-30 min | Très élevée |
| Codage CCAM | 2-4/semaine | 5-10 min | Moyenne |
| Consignes postopératoires | 2-4/semaine | 5-10 min | Moyenne |
| Ordonnances postop | 2-4/semaine | 5-10 min | Moyenne |

**Temps total bloc** : 2-4h de documentation/semaine bloc

#### Impact Annuel

| Métrique | Valeur |
|----------|--------|
| Heures perdues | 500-750 heures/an |
| Équivalent journées | 60-90 jours/an |
| Coût d'opportunité | 30 000 - 50 000 €/an |

### 1.4 Solution Proposée

> **Super Assistant Médical** : Un assistant IA qui écoute, comprend, rédige et facture.

**Proposition de valeur unique** :

> *"Dictez pendant que vous examinez. L'IA rédige pendant que vous passez au patient suivant."*

| Différenciateur | Description |
|-----------------|-------------|
| **Spécialisation chirurgicale** | Vocabulaire ORL pré-entraîné, templates adaptés |
| **Temps réel** | Transcription live, pas d'attente |
| **Conformité française** | CIM-10, CCAM, NGAP, format HAS, RGPD |
| **Deux workflows** | Consultation ET bloc opératoire |
| **Facturation intégrée** | Du codage au paiement |
| **Zero friction** | Un clic pour générer, un clic pour valider |

---

## 2. Persona Utilisateur

### 2.1 Persona Principal : Dr. Sophie Martin

| Attribut | Description |
|----------|-------------|
| **Âge** | 38 ans |
| **Expérience** | 10 ans post-internat |
| **Activité** | 50% CHU (salariat) + 50% libéral (secteur 2) |
| **Volume** | 60-80 consultations/semaine, 2-3 blocs opératoires |
| **Sous-spécialité** | Otologie, chirurgie de l'oreille |
| **Situation** | Mariée, 2 enfants (5 et 8 ans) |

### 2.2 Journée Type

```
06:30   Réveil, préparation enfants
08:00   Arrivée CHU, staff du service
08:30   Bloc opératoire (2 interventions)
13:00   Déjeuner rapide + début rédaction CRO du matin
14:00   Consultations CHU (12-15 patients)
18:30   Fin consultations, encore 8 CRC à rédiger
19:30   Rentre chez elle, dîner famille
21:00   Enfants couchés → reprend les CRC en retard
23:00   Termine enfin, épuisée
```

### 2.3 Frustrations Actuelles

| Frustration | Verbatim |
|-------------|----------|
| **Temps volé** | "Je passe plus de temps à écrire sur mes patients qu'à les examiner" |
| **Culpabilité** | "Je rentre tard tous les soirs, mes enfants me voient à peine" |
| **Qualité** | "Quand je suis fatiguée, mes CRC sont moins détaillés" |
| **Outils inadaptés** | "Le logiciel du CHU date de 2010, c'est une torture" |
| **Codage** | "Je perds un temps fou à chercher les bons codes CCAM/NGAP" |
| **Facturation** | "Ma secrétaire passe des heures sur les relances impayés" |

### 2.4 Niveau Technique

| Aspect | Niveau |
|--------|--------|
| Smartphone | Utilisation quotidienne, à l'aise |
| Ordinateur | Basique (Word, email, logiciel métier) |
| Nouvelles technologies | Curieuse mais prudente |
| IA | A testé ChatGPT, impressionnée mais "pas adapté au médical" |
| Dictée vocale | Utilise déjà Dragon pour certains courriers |

### 2.5 Point de Rupture

> "Le jour où j'ai raté le spectacle de fin d'année de ma fille parce que j'avais 15 CRC en retard, j'ai su que quelque chose devait changer."

### 2.6 Critères de Décision d'Achat

| Critère | Poids | Seuil |
|---------|-------|-------|
| Gain de temps prouvé | 40% | Minimum 50% de réduction |
| Qualité médicale | 25% | Équivalente ou supérieure |
| Facilité d'utilisation | 20% | Utilisable sans formation |
| Prix | 10% | < 200€/mois |
| Support | 5% | Réactif et compétent |

---

## 3. Architecture Fonctionnelle

### 3.1 Vue d'Ensemble des Modules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPER ASSISTANT MÉDICAL                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MODULE        │  │   MODULE        │  │   MODULE        │  │   MODULE        │
│   PATIENT       │  │   CONSULTATION  │  │   BLOC          │  │   FACTURATION   │
│                 │  │                 │  │                 │  │                 │
│ • Création      │  │ • Dictée        │  │ • Planning      │  │ • Factures      │
│ • Recherche     │  │ • Transcription │  │ • Dossier préop │  │ • Encaissement  │
│ • Historique    │  │ • Génération    │  │ • CRO           │  │ • Tiers payant  │
│ • Tâches        │  │ • Validation    │  │ • Codage CCAM   │  │ • Télétrans.    │
│                 │  │ • Documents     │  │ • Postop        │  │ • Relances      │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │                    │
         └────────────────────┴────────────────────┴────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICES TRANSVERSES                              │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│  🔐 Auth        │  📊 Analytics   │  🧠 Knowledge   │  ⚙️ Settings          │
│  Firebase Auth  │  Métriques      │  Base ORL       │  Profil praticien     │
│  Google OAuth   │  Dashboard      │  RAG (V2)       │  Templates perso      │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
```

### 3.2 Modules par Phase MVP

| Module | MVP 1.0 | MVP 1.5 | MVP 2.0 | MVP 3.0 |
|--------|---------|---------|---------|---------|
| Patient | ✅ CRUD + Tâches | - | Multi-praticien | - |
| Consultation | ✅ Core | Templates perso | RAG + Learning | - |
| Bloc | - | ✅ Core | Optimisations | - |
| Facturation | Codage seul | - | - | ✅ Full |
| Analytics | - | - | ✅ Dashboard | Avancé |
| Knowledge | - | - | ✅ RAG | Multi-spécialités |

---

## 4. MVP Scope & Roadmap

### 4.1 MVP 1.0 — Consultation Core (14 semaines)

> **Objectif** : Prouver la valeur sur le workflow consultation

#### Fonctionnalités Incluses

| ID | Fonctionnalité | Priorité | Description |
|----|----------------|----------|-------------|
| F01 | Gestion patients | P0 | CRUD patient + recherche |
| F02 | Dictée vocale | P0 | Enregistrement + transcription temps réel |
| F03 | Génération CRC | P0 | CRC structuré depuis transcription |
| F04 | Codage suggéré | P0 | CIM-10 + NGAP/CCAM automatiques |
| F05 | Ordonnance | P0 | Génération depuis CRC |
| F06 | Bilan | P0 | Prescription examens |
| F07 | Historique | P0 | Timeline patient |
| F08 | Tâches | P0 | Gestion tâches par patient |
| F09 | Auth | P0 | Firebase Auth (Google OAuth) |

#### Hors-Scope MVP 1.0

| Exclusion | Raison | Phase prévue |
|-----------|--------|--------------|
| Bloc opératoire | Complexité additionnelle | MVP 1.5 |
| Facturation complète | Dépendances télétransmission | MVP 3.0 |
| Multi-praticien | Nécessite RBAC | MVP 2.0 |
| Personnalisation templates | Nice-to-have | MVP 1.5 |
| Mobile natif | Web-first | V2 |
| HDS complet | Coût infrastructure | V2 |

#### Critères de Succès MVP 1.0

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Temps génération CRC | < 2 min | Chrono end-to-end |
| Précision transcription | > 95% | Évaluation manuelle |
| Taux complétion CRC | > 90% | % sections remplies |
| NPS beta-testeurs | > 40 | Survey |
| Bugs critiques | 0 | Tracking |

### 4.2 MVP 1.5 — Bloc Core (6 semaines)

> **Objectif** : Étendre au workflow bloc opératoire

| ID | Fonctionnalité | Description |
|----|----------------|-------------|
| F10 | Programmation bloc | Planning interventions |
| F11 | Dossier préopératoire | Checklist + documents |
| F12 | Génération CRO | Compte-rendu opératoire IA |
| F13 | Codage CCAM bloc | Actes chirurgicaux |
| F14 | Consignes postop | Document patient |
| F15 | Ordonnances postop | Antalgiques, ATB, etc. |

### 4.3 MVP 2.0 — Avancé (8 semaines)

> **Objectif** : Améliorer la qualité et étendre les usages

| ID | Fonctionnalité | Description |
|----|----------------|-------------|
| F16 | Knowledge Management | Base de connaissances ORL |
| F17 | RAG | Récupération contexte intelligent |
| F18 | Analytics | Dashboard activité |
| F19 | Multi-praticien | Partage patients |
| F20 | Multi-spécialités | Extension autres spécialités |
| F21 | Conformité HDS | Migration hébergeur certifié |

### 4.4 MVP 3.0 — Facturation (8 semaines)

> **Objectif** : Boucler le cycle de soin avec la facturation

| ID | Fonctionnalité | Description |
|----|----------------|-------------|
| F22 | Génération factures | Depuis actes codés |
| F23 | Gestion tiers payant | AMO + AMC |
| F24 | Encaissement | CB, chèque, virement |
| F25 | Télétransmission FSE | Envoi CPAM |
| F26 | Retours Noémie | Traitement automatique |
| F27 | Relances | Impayés automatisées |
| F28 | Export FEC | Comptabilité |

---

## 5. Modèle de Données

### 5.1 Entités Principales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODÈLE DE DONNÉES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Practitioner │         │   Patient    │         │    Task      │
│              │         │              │         │              │
│ • id (RPPS)  │──1:N──▶│ • id         │◀──N:1──│ • id         │
│ • name       │         │ • lastName   │         │ • type       │
│ • specialty  │         │ • firstName  │         │ • priority   │
│ • sector     │         │ • birthDate  │         │ • dueDate    │
│ • email      │         │ • gender     │         │ • status     │
│ • phone      │         │ • phone      │         │ • patientId  │
│              │         │ • email      │         │ • consultId  │
└──────────────┘         │ • insurance  │         └──────────────┘
                         │ • mutuelle   │
                         └──────┬───────┘
                                │
                         ┌──────┴───────┐
                         │              │
                         ▼              ▼
              ┌──────────────┐   ┌──────────────┐
              │ Consultation │   │ Intervention │
              │              │   │              │
              │ • id         │   │ • id         │
              │ • date       │   │ • date       │
              │ • status     │   │ • status     │
              │ • transcript │   │ • type       │
              │ • motif      │   │ • indication │
              │ • examen     │   │ • technique  │
              │ • diagnostic │   │ • findings   │
              │ • codes      │   │ • codes      │
              └──────┬───────┘   └──────┬───────┘
                     │                  │
              ┌──────┴─────┬────────────┴────────┐
              │            │                     │
              ▼            ▼                     ▼
       ┌──────────┐ ┌──────────┐         ┌──────────┐
       │ Document │ │Ordonnance│         │  Facture │
       │   (CRC)  │ │          │         │          │
       │          │ │ • lines  │         │ • actes  │
       │ • type   │ │ • type   │         │ • amount │
       │ • content│ └──────────┘         │ • status │
       │ • pdf    │                      │ • FSE    │
       └──────────┘                      └──────────┘
```

### 5.2 Formats de Stockage

| Entité | Stockage | Format | Justification |
|--------|----------|--------|---------------|
| Patient | Google Healthcare FHIR | FHIR R4 Patient | Compliance, interopérabilité |
| Consultation | Google Healthcare FHIR | FHIR R4 Encounter | Standard médical |
| Documents | Google Healthcare FHIR | FHIR R4 DocumentReference | Lien vers PDF |
| Transcription | BigQuery | JSON | Analytics, RAG |
| Facture | BigQuery | Structured | Requêtes complexes |
| Practitioner | BigQuery | Structured | Hors données patient |
| Task | BigQuery | Structured | Flexible, requêtes |

---

## 6. Spécifications par Module

### 6.1 Module Patient

#### Vue Liste Patients

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 Rechercher un patient...                              [ + Nouveau ]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ NOM           │ PRÉNOM    │ DDN        │ DERNIÈRE  │ TÂCHES │      │   │
│  │               │           │            │ VISITE    │        │      │   │
│  ├───────────────┼───────────┼────────────┼───────────┼────────┼──────┤   │
│  │ MARTIN        │ Sophie    │ 15/03/1985 │ 20/12/24  │ 2 🔴   │  →   │   │
│  │ DUPONT        │ Jean      │ 22/07/1962 │ 18/12/24  │ 1 🟡   │  →   │   │
│  │ BERNARD       │ Marie     │ 03/11/1978 │ 15/12/24  │ 0      │  →   │   │
│  │ PETIT         │ Pierre    │ 28/09/1990 │ 12/12/24  │ 3 🔴   │  →   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Affichage 1-4 sur 234 patients                    [ < ] Page 1/59 [ > ]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Fiche Patient

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Retour                                          [ Modifier ] [ Tâche ]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐  MARTIN Sophie                                                │
│  │         │  Née le 15/03/1985 (39 ans) • Femme                           │
│  │   👤    │  📱 06 12 34 56 78 • ✉️ sophie.martin@email.com               │
│  │         │  🏥 CPAM Paris • Mutuelle: MGEN                               │
│  └─────────┘                                                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ Consultations ]  [ Interventions ]  [ Documents ]  [ Tâches ]           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📅 TIMELINE                                    [ + Nouvelle consultation ] │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  ● 20/12/2024 — Consultation                                               │
│    Motif: Hypoacousie bilatérale                                           │
│    Diagnostic: Presbyacousie modérée                                       │
│    Codes: NGAP CS • CIM-10 H91.1                                           │
│                                                          [ Voir le CRC ]   │
│                                                                             │
│  ● 15/11/2024 — Consultation                                               │
│    Motif: Contrôle audiométrique                                           │
│    Diagnostic: Presbyacousie stable                                        │
│    Codes: NGAP CS • CIM-10 H91.1                                           │
│                                                          [ Voir le CRC ]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Module Consultation

#### Interface Dictée

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Consultation — MARTIN Sophie                              20/12/2024      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │                                 │  │                                 │  │
│  │     🎤 DICTÉE EN COURS          │  │     📝 TRANSCRIPTION            │  │
│  │                                 │  │                                 │  │
│  │         ⏺️ 02:34                 │  │  "La patiente se présente      │  │
│  │                                 │  │   pour une hypoacousie         │  │
│  │     [ ⏸️ Pause ] [ ⏹️ Stop ]     │  │   bilatérale évoluant depuis   │  │
│  │                                 │  │   6 mois. Elle décrit une      │  │
│  │                                 │  │   gêne principalement dans     │  │
│  │  Volume: ████████░░░            │  │   les environnements           │  │
│  │                                 │  │   bruyants..."                 │  │
│  │                                 │  │                                 │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│                      [ 🤖 Générer le compte-rendu ]                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### CRC Généré

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Compte-Rendu de Consultation                              [ ✏️ Éditer ]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MOTIF DE CONSULTATION                                                     │
│  ───────────────────────────────────────────────────────────────────────   │
│  Hypoacousie bilatérale progressive évoluant depuis 6 mois.                │
│                                                                             │
│  ANTÉCÉDENTS                                                               │
│  ───────────────────────────────────────────────────────────────────────   │
│  • Antécédents familiaux: père appareillé à 70 ans                         │
│  • Pas d'exposition professionnelle au bruit                               │
│  • Pas d'ototoxiques                                                       │
│                                                                             │
│  EXAMEN CLINIQUE                                                           │
│  ───────────────────────────────────────────────────────────────────────   │
│  Otoscopie: tympans normaux bilatéralement                                 │
│  Acoumétrie: Rinne positif bilatéral, Weber indifférent                    │
│                                                                             │
│  EXAMENS COMPLÉMENTAIRES                                                   │
│  ───────────────────────────────────────────────────────────────────────   │
│  Audiométrie tonale: perte bilatérale symétrique sur les aigus             │
│  - Seuils: 35 dB à 2000 Hz, 50 dB à 4000 Hz, 60 dB à 8000 Hz              │
│                                                                             │
│  CONCLUSION                                                                │
│  ───────────────────────────────────────────────────────────────────────   │
│  Presbyacousie modérée bilatérale. Indication d'appareillage auditif.      │
│                                                                             │
│  CODAGE                                                                    │
│  ───────────────────────────────────────────────────────────────────────   │
│  🏷️ CIM-10: H91.1 — Presbyacousie                                          │
│  💰 NGAP: CS (30,00 €)                                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ 💊 Ordonnance ]  [ 🔬 Bilan ]  [ 📄 Export PDF ]  [ ✅ Valider ]        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Module Documents

#### Génération Ordonnance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Ordonnance — MARTIN Sophie                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ORDONNANCE                                    Paris, le 20/12/2024 │   │
│  │  ═══════════                                                        │   │
│  │                                                                     │   │
│  │  Patient: Mme Sophie MARTIN                                         │   │
│  │  Née le 15/03/1985                                                  │   │
│  │                                                                     │   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │                                                                     │   │
│  │  1. AUDIOPROTHÈSE AUDITIVE BILATÉRALE                              │   │
│  │     Appareillage auditif bilatéral                                  │   │
│  │     QSP: 1                                                          │   │
│  │                                                                     │   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │                                                                     │   │
│  │                                               Dr. [Praticien]       │   │
│  │                                               Chirurgien ORL        │   │
│  │                                               RPPS: XXXXXXXXXXX     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [ + Ajouter médicament ]        [ 👁️ Aperçu PDF ]  [ 📥 Télécharger ]    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Parcours Utilisateur

### 7.1 Parcours Principal : Consultation Complète

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PARCOURS CONSULTATION COMPLÈTE                           │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌───────┐     ┌───────┐     ┌───────┐     ┌───────┐     ┌───────┐
     │       │     │       │     │       │     │       │     │       │
     │ Login │────▶│Patient│────▶│Dictée │────▶│ CRC   │────▶│Export │
     │       │     │       │     │       │     │       │     │       │
     └───────┘     └───────┘     └───────┘     └───────┘     └───────┘
         │             │             │             │             │
         ▼             ▼             ▼             ▼             ▼
    Firebase       Recherche     Démarrer      Générer       PDF +
    Auth           ou créer      dictée        avec IA      Ordonnance
         │             │             │             │             │
         │             │             │             │             │
       5 sec        10 sec       2-5 min       < 30 sec      10 sec
         │             │             │             │             │
         └─────────────┴─────────────┴─────────────┴─────────────┘
                                    │
                              TOTAL: ~5 min
                         (vs 10-15 min manuel)
```

### 7.2 Micro-Parcours Critiques

| Parcours | Étapes | Temps cible | Friction max |
|----------|--------|-------------|--------------|
| Login → Dashboard | 2 clics | < 5 sec | 0 |
| Recherche patient | 1 input | < 200ms | 0 |
| Nouveau patient | 1 formulaire | < 30 sec | 1 page |
| Démarrer dictée | 1 clic | < 1 sec | 0 |
| Générer CRC | 1 clic | < 30 sec | Attente |
| Créer ordonnance | 2 clics | < 10 sec | 0 |
| Export PDF | 1 clic | < 3 sec | 0 |

---

## 8. Monétisation

### 8.1 Modèle Recommandé : SaaS B2B

| Aspect | Choix | Justification |
|--------|-------|---------------|
| Modèle | Abonnement mensuel | Revenus récurrents, fidélisation |
| Cible | Praticiens individuels puis cabinets | Adoption bottom-up |
| Trial | 14 jours gratuits | Conversion par valeur prouvée |

### 8.2 Grille Tarifaire

| Plan | Prix/mois | Inclus | Cible |
|------|-----------|--------|-------|
| **Essentiel** | 99€ | 1 praticien, 200 consultations/mois | ORL libéral solo |
| **Pro** | 199€ | 1 praticien, illimité, bloc opératoire | ORL avec bloc |
| **Équipe** | 399€ | 3 praticiens, illimité, analytics | Cabinet de groupe |
| **Établissement** | Sur devis | Illimité, intégration DPI, HDS | Cliniques |

### 8.3 Moment de Conversion

> **Aha Moment** : Quand le praticien génère son premier CRC complet en moins de 2 minutes et réalise le gain de temps.

| Étape | Action | Objectif conversion |
|-------|--------|---------------------|
| J0 | Inscription | - |
| J0 | Premier patient créé | 50% |
| J1-3 | Première dictée | 70% |
| J1-3 | Premier CRC généré | 85% |
| J7 | 10+ CRC générés | Conversion trial → payant |
| J14 | Fin trial | > 20% conversion |

---

## 9. Métriques de Succès

### 9.1 North Star Metric

> **Nombre de CRC générés par semaine**

Reflète directement la valeur délivrée aux utilisateurs.

### 9.2 Métriques Primaires

| Métrique | Définition | Cible MVP | Mesure |
|----------|------------|-----------|--------|
| MAU | Monthly Active Users | 50 | Analytics |
| CRC/user/semaine | Documents générés | > 15 | API logs |
| Time to CRC | Temps dictée → CRC validé | < 5 min | Timestamps |
| Churn mensuel | % users qui arrêtent | < 5% | Cohort |

### 9.3 Métriques Secondaires

| Métrique | Définition | Cible | Mesure |
|----------|------------|-------|--------|
| Précision transcription | % mots corrects | > 95% | Sampling |
| Taux complétion CRC | % sections remplies | > 90% | Analyse contenu |
| NPS | Net Promoter Score | > 40 | Survey |
| Support tickets | Tickets/user/mois | < 0.5 | Zendesk |

### 9.4 Métriques Techniques

| Métrique | Cible | Alerte |
|----------|-------|--------|
| Uptime | 99.5% | < 99% |
| Latence API (p95) | < 500ms | > 1s |
| Erreur rate | < 1% | > 2% |
| Transcription latency | < 2s | > 5s |

### 9.5 Funnel Acquisition

| Étape | Définition | Cible |
|-------|------------|-------|
| Visite landing | Visiteurs uniques | 1000/mois |
| Inscription trial | Créent un compte | 10% |
| Activation | Créent 1 patient | 80% |
| Engagement | Génèrent 3+ CRC | 60% |
| Conversion | Passent payant | 20% |
| Rétention J7 | > 30% reviennent après 7 jours | Analytics |

---

## 10. Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Qualité transcription insuffisante | Moyen | Critique | Tester AssemblyAI sur corpus ORL réel avant dev |
| Documents générés non conformes | Moyen | Élevé | Validation par 3 ORL avant lancement |
| Adoption lente | Élevé | Moyen | Focus sur 10 beta-testeurs engagés |
| Coûts API explosent | Faible | Moyen | Monitoring strict, limites par compte |
| Concurrence (Nabla, etc.) | Moyen | Moyen | Différenciation : bloc + facturation |
| Exigences HDS | Faible (MVP) | Faible | Anonymisation, pas de stockage long terme |
| Complexité codage CCAM | Moyen | Moyen | Base de données CCAM actualisée, validation praticien |
| Rejet télétransmission | Moyen | Moyen | Tests approfondis avec jeux de données CPAM |

---

## 11. Timeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP COMPLÈTE (36 semaines)                        │
└─────────────────────────────────────────────────────────────────────────┘

MVP 1.0 — CONSULTATION CORE (14 semaines)
══════════════════════════════════════════
Sem 1-2    │████████│  Setup projet, archi, Firebase Auth
Sem 3-4    │████████│  Module Patient (FHIR + BigQuery)
Sem 5-6    │████████│  Transcription (AssemblyAI)
Sem 7-8    │████████│  Génération CRC (Claude + prompts ORL)
Sem 9-10   │████████│  Ordonnance + Bilan + Codage NGAP/CCAM
Sem 11-12  │████████│  UI complète consultation
Sem 13     │████    │  Beta 5 ORL
Sem 14     │████    │  Corrections + lancement

MVP 1.5 — BLOC CORE (6 semaines)
═══════════════════════════════════
Sem 15-16  │████████│  Programmation + Dossier préop
Sem 17-18  │████████│  Génération CRO + prompts chirurgicaux
Sem 19-20  │████████│  Codage CCAM avancé + Consignes postop

MVP 2.0 — AVANCÉ (8 semaines)
═══════════════════════════════════
Sem 21-24  │████████████████│  Knowledge Management + RAG
Sem 25-28  │████████████████│  Analytics + Multi-spécialités + HDS

MVP 3.0 — FACTURATION CORE (8 semaines)
═══════════════════════════════════
Sem 29-30  │████████│  Génération factures + Gestion tiers payant
Sem 31-32  │████████│  Encaissement + Suivi paiements
Sem 33-34  │████████│  Télétransmission FSE + Retours Noémie
Sem 35-36  │████████│  Relances + Stats + Export FEC

           ─────────────────────────────────────────────────────────────────►
           Jan     Fév     Mar     Avr     Mai     Jun     Jul     Août    Sep
           └─────── MVP 1.0 ───────┘└── 1.5 ──┘└──── 2.0 ────┘└──── 3.0 ────┘
```

---

## 12. Stack Technique

### 12.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STACK TECHNIQUE v2.2                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  Next.js 15        │  Framework React (App Router)                       │
│  React 19          │  UI Library                                         │
│  TypeScript 5      │  Type safety                                        │
│  Tailwind CSS 4    │  Styling utility-first                              │
│  shadcn/ui         │  Composants UI accessibles                          │
│  TanStack Query    │  Data fetching, caching                             │
│  Zustand           │  État global                                        │
│  React Hook Form   │  Formulaires                                        │
│  Zod               │  Validation                                         │
├──────────────────────────────────────────────────────────────────────────┤
│ BACKEND (API Routes Next.js)                                             │
├──────────────────────────────────────────────────────────────────────────┤
│  Server Actions    │  Mutations directes                                 │
│  Route Handlers    │  API REST endpoints                                 │
│  Edge Runtime      │  Latence minimale                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ SERVICES EXTERNES                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│  Google Healthcare │  FHIR Store (données patients)                      │
│  BigQuery          │  Analytics + RAG embeddings                         │
│  AssemblyAI        │  Transcription audio                                │
│  Claude API        │  Génération CRC/CRO                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ AUTH & SÉCURITÉ                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Firebase Auth     │  Authentification (Google OAuth 2.0)                │
│  Firebase Admin SDK│  Vérification tokens côté serveur                   │
│  Google IAM        │  Permissions cloud                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ HÉBERGEMENT                                                              │
├──────────────────────────────────────────────────────────────────────────┤
│  Vercel            │  Frontend + API Routes                              │
│  Google Cloud      │  FHIR + BigQuery + Storage                          │
│  Firebase          │  Auth service                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Choix Firebase Auth vs Auth.js

| Critère | Firebase Auth | Auth.js (v5) |
|---------|---------------|--------------|
| **Intégration GCP** | Native (même écosystème) | Nécessite configuration |
| **Google OAuth** | Simplifié, préconfigurée | Configuration manuelle |
| **Token verification** | Admin SDK intégré | JWT à gérer |
| **Scaling** | Géré par Google | Dépend de l'hébergement |
| **Coût MVP** | Gratuit (50k MAU) | Gratuit |
| **Multi-tenancy future** | Supporté nativement | À implémenter |
| **Complexité setup** | Faible | Moyenne |

> ✅ **Choix : Firebase Auth** — Cohérence écosystème Google (FHIR, BigQuery), setup simplifié, scaling transparent.

### 12.3 MCP Servers (Développement Cursor)

```json
{
  "mcpServers": {
    "bigquery": {
      "command": "./tools/toolbox",
      "args": ["--prebuilt", "bigquery", "--stdio"],
      "env": {
        "BIGQUERY_PROJECT": "super-assistant-medical"
      }
    },
    "healthcare": {
      "command": "./tools/toolbox",
      "args": ["--prebuilt", "healthcare", "--stdio"],
      "env": {
        "HEALTHCARE_PROJECT": "super-assistant-medical",
        "HEALTHCARE_LOCATION": "europe-west1",
        "HEALTHCARE_DATASET": "medical-data",
        "HEALTHCARE_FHIR_STORE": "patients-fhir"
      }
    },
    "assemblyai": {
      "command": "node",
      "args": ["./tools/assemblyai-mcp/dist/index.js"],
      "env": {
        "ASSEMBLYAI_API_KEY": "${ASSEMBLYAI_API_KEY}"
      }
    }
  }
}
```

### 12.4 Coûts Estimés

| Phase | Composant | Coût/mois |
|-------|-----------|-----------|
| **MVP** | Vercel (Hobby) | 0€ |
| | Firebase Auth (< 50k MAU) | 0€ |
| | AssemblyAI (100h) | ~20€ |
| | Claude API | ~15€ |
| | Google Cloud | ~20€ |
| | **Total MVP** | **~55€/mois** |
| **Production** | Vercel Pro | 20€ |
| | Firebase Auth | 0€ (jusqu'à 50k) |
| | AssemblyAI | ~100€ |
| | Claude API | ~100€ |
| | Google Cloud | ~150€ |
| | **Total Production** | **~370€/mois** |

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **CRC** | Compte-Rendu de Consultation |
| **CRO** | Compte-Rendu Opératoire |
| **NGAP** | Nomenclature Générale des Actes Professionnels |
| **CCAM** | Classification Commune des Actes Médicaux |
| **CIM-10** | Classification Internationale des Maladies, 10ème révision |
| **FSE** | Feuille de Soins Électronique |
| **AMO** | Assurance Maladie Obligatoire (CPAM) |
| **AMC** | Assurance Maladie Complémentaire (Mutuelle) |
| **FHIR** | Fast Healthcare Interoperability Resources |
| **HDS** | Hébergement de Données de Santé |
| **RPPS** | Répertoire Partagé des Professionnels de Santé |
| **ADELI** | Automatisation DEs LIstes (répertoire national) |
| **Firebase Auth** | Service d'authentification Google Firebase |

### B. Références Réglementaires

| Référence | Description |
|-----------|-------------|
| RGPD | Règlement Général sur la Protection des Données |
| HDS | Certification Hébergeur de Données de Santé (décret 2018-137) |
| CNIL | Recommandations traitement données de santé |
| HAS | Haute Autorité de Santé — standards de documentation |
| ATIH | Agence Technique de l'Information sur l'Hospitalisation (CCAM) |

### C. Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 2.0 | 28/12/2024 | Version initiale |
| 2.1 | 28/12/2024 | Ajout détails facturation, timeline |
| 2.2 | 28/12/2024 | Migration Auth.js → Firebase Authentication |

---

*Document généré le 28 décembre 2024 — Version 2.2*
