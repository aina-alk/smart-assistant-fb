# [BLOC 5.3] — Export PDF (CRC, Ordonnance, Bilan)

**Bloc** : 5.3 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Blocs 5.1 et 5.2 terminés

---

## Contexte

Les formulaires ordonnance et bilan sont prêts (blocs 5.1-5.2). Nous devons maintenant générer les PDFs téléchargeables.

---

## Objectif de ce bloc

Créer le système de génération PDF pour le CRC, l'ordonnance et le bilan avec @react-pdf/renderer.

---

## Pré-requis

- [ ] Blocs 5.1 et 5.2 terminés
- [ ] Données consultation complètes

---

## Spécifications

### Ce qui doit être créé

1. **Templates PDF** :
   - `CRCTemplate` : compte-rendu consultation
   - `OrdonnanceTemplate` : ordonnance médicaments
   - `BilanTemplate` : prescription examens

2. **API Routes** :
   - `GET /api/documents/[id]/pdf` : génère et retourne PDF
   
3. **Styles PDF** (`lib/pdf/styles.ts`) :
   - Design professionnel médical
   - En-tête praticien
   - Pied de page légal

4. **Service Génération** (`lib/pdf/generator.ts`) :
   - Création PDF côté serveur
   - Stockage Cloud Storage
   - Retour URL signée

5. **Composant Bouton** (`components/documents/pdf-download-button.tsx`) :
   - Bouton téléchargement
   - État loading
   - Erreur gérée

### Dépendance

```bash
pnpm add @react-pdf/renderer
```

---

## Design PDF CRC

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Dr Jean MARTIN                           [LOGO si disponible]│
│   Oto-Rhino-Laryngologie                                        │
│   12 rue de la Santé                                            │
│   75001 Paris                                                   │
│   Tél: 01 23 45 67 89                                           │
│   RPPS: 10101010101                                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           COMPTE-RENDU DE CONSULTATION                          │
│                                                                 │
│   Patient: M. DUPONT Jean                                       │
│   Né le: 15/03/1966 (58 ans)                                   │
│   Date de consultation: 28/12/2024                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   MOTIF DE CONSULTATION                                         │
│   ─────────────────────                                         │
│   Hypoacousie bilatérale progressive                            │
│                                                                 │
│   HISTOIRE DE LA MALADIE                                        │
│   ──────────────────────                                        │
│   Patient de 58 ans consultant pour une baisse d'audition       │
│   bilatérale progressive depuis 6 mois...                       │
│                                                                 │
│   EXAMEN CLINIQUE                                               │
│   ───────────────                                               │
│   Otoscopie droite: Tympan normal                               │
│   Otoscopie gauche: Tympan normal                               │
│   ...                                                           │
│                                                                 │
│   DIAGNOSTIC                                                    │
│   ──────────                                                    │
│   Surdité de perception bilatérale...                           │
│                                                                 │
│   CONDUITE À TENIR                                              │
│   ────────────────                                              │
│   • Bilan IRM des conduits auditifs internes                    │
│   • Consultation appareillage auditif...                        │
│                                                                 │
│   CONCLUSION                                                    │
│   ──────────                                                    │
│   Presbyacousie bilatérale...                                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Fait à Paris, le 28/12/2024                                   │
│                                                                 │
│                                          Dr Jean MARTIN         │
│                                          [Signature si dispo]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design PDF Ordonnance

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Dr Jean MARTIN                                                │
│   ORL - Chirurgie cervico-faciale                              │
│   12 rue de la Santé, 75001 Paris                              │
│   RPPS: 10101010101  |  ADELI: 75 1 01010 1                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Paris, le 28/12/2024                                          │
│                                                                 │
│   M. DUPONT Jean                                                │
│   Né le 15/03/1966                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ORDONNANCE                               │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   1. AMOXICILLINE 1g                                            │
│      1 comprimé matin et soir pendant 7 jours                   │
│      À prendre pendant les repas                                │
│      QSP 1 boîte                                                │
│                                                                 │
│   2. OTIPAX gouttes auriculaires                                │
│      4 gouttes x3/jour dans l'oreille droite                    │
│      pendant 5 jours                                            │
│      QSP 1 flacon                                               │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│                                          Dr Jean MARTIN         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── documents/
│           └── [id]/
│               └── pdf/
│                   └── route.ts
├── components/
│   └── documents/
│       └── pdf-download-button.tsx
└── lib/
    └── pdf/
        ├── styles.ts
        ├── generator.ts
        ├── templates/
        │   ├── crc-template.tsx
        │   ├── ordonnance-template.tsx
        │   └── bilan-template.tsx
        └── components/
            ├── header.tsx
            ├── footer.tsx
            └── section.tsx
```

---

## Stockage FHIR

Chaque PDF généré crée un `DocumentReference` FHIR :

```typescript
interface FHIRDocumentReference {
  resourceType: 'DocumentReference';
  id: string;
  status: 'current';
  type: {
    coding: [{
      system: 'document-type';
      code: 'crc' | 'ordonnance' | 'bilan';
    }];
  };
  subject: { reference: string };  // Patient
  context: {
    encounter: [{ reference: string }];  // Encounter
  };
  content: [{
    attachment: {
      contentType: 'application/pdf';
      url: string;  // URL Cloud Storage signée
      title: string;
      creation: string;
    };
  }];
}
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Template CRC génère un PDF lisible
- [ ] Template Ordonnance génère un PDF lisible
- [ ] Template Bilan génère un PDF lisible
- [ ] En-tête praticien présent
- [ ] Date et signature présentes
- [ ] PDF stocké dans Cloud Storage
- [ ] DocumentReference créé dans FHIR
- [ ] Bouton téléchargement fonctionne
- [ ] Gestion erreur si génération échoue

---

## Notes importantes

> ⚠️ @react-pdf/renderer s'exécute côté serveur dans les API routes.

> Les URLs Cloud Storage doivent être signées avec expiration (ex: 1h).

> Penser au format A4 et aux marges d'impression.

> Les polices doivent être enregistrées (utiliser Helvetica par défaut).

---

## Prochain bloc

**[BLOC 6.1]** — API + Types Tâches
