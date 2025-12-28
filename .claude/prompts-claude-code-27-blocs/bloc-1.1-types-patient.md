# [BLOC 1.1] — Types TypeScript + Schémas Zod Patient

**Bloc** : 1.1 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 0 complet

---

## Contexte

Le setup est complet (bloc 0). Nous commençons maintenant le module Patient qui permettra de gérer les fiches patients. Ce bloc définit les types et validations.

---

## Objectif de ce bloc

Créer les types TypeScript pour les patients, les schémas Zod pour la validation des formulaires, et les utilitaires de validation spécifiques (NIR, téléphone français).

---

## Pré-requis

- [ ] Bloc 0 complet
- [ ] Types FHIR de base disponibles

---

## Spécifications

### Ce qui doit être créé

1. **Types Patient** (`types/patient.ts`) :
   - Interface `Patient` (format application)
   - Interface `FHIRPatient` (format FHIR)
   - Fonctions de mapping bidirectionnel

2. **Schémas Zod** (`lib/validations/patient.ts`) :
   - `patientFormSchema` : validation formulaire création/édition
   - `patientSearchSchema` : validation recherche

3. **Validateurs** (`lib/utils/validators.ts`) :
   - `validateNIR(nir: string)` : validation numéro sécu français
   - `validateFrenchPhone(phone: string)` : validation téléphone FR
   - `formatNIR(nir: string)` : formatage affichage NIR

---

## Types Patient (format application)

```typescript
interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  sexe: 'M' | 'F';
  
  // Contact
  telephone?: string;
  email?: string;
  
  // Adresse
  adresse?: string;
  codePostal?: string;
  ville?: string;
  
  // Sécurité sociale
  nir?: string;                    // Numéro sécu (15 chiffres)
  
  // Mutuelle
  mutuelleNom?: string;
  mutuelleNumero?: string;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Schéma Zod Patient

```typescript
const patientFormSchema = z.object({
  nom: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le nom contient des caractères invalides"),
    
  prenom: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le prénom contient des caractères invalides"),
    
  dateNaissance: z.date()
    .max(new Date(), "La date de naissance ne peut pas être dans le futur")
    .min(new Date('1900-01-01'), "Date de naissance invalide"),
    
  sexe: z.enum(['M', 'F'], {
    required_error: "Le sexe est requis"
  }),
  
  telephone: z.string()
    .regex(/^0[1-9][0-9]{8}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal('')),
    
  email: z.string()
    .email("Email invalide")
    .optional()
    .or(z.literal('')),
    
  nir: z.string()
    .length(15, "Le NIR doit contenir 15 chiffres")
    .regex(/^[12][0-9]{14}$/, "NIR invalide")
    .optional()
    .or(z.literal('')),
    
  // ... autres champs optionnels
});
```

---

## Validation NIR

Le NIR (Numéro d'Inscription au Répertoire) français a le format suivant :
- Position 1 : Sexe (1 = homme, 2 = femme)
- Positions 2-3 : Année de naissance
- Positions 4-5 : Mois de naissance
- Positions 6-7 : Département de naissance
- Positions 8-10 : Commune de naissance
- Positions 11-13 : Numéro d'ordre
- Positions 14-15 : Clé de contrôle

```typescript
function validateNIR(nir: string): boolean {
  if (!/^[12][0-9]{14}$/.test(nir)) return false;
  
  // Calcul de la clé
  const numero = BigInt(nir.substring(0, 13));
  const cle = parseInt(nir.substring(13, 15));
  const cleCalculee = 97 - Number(numero % 97n);
  
  return cle === cleCalculee;
}
```

---

## Structure attendue

```
src/
├── types/
│   ├── patient.ts
│   └── index.ts                    # Re-export
├── lib/
│   ├── validations/
│   │   └── patient.ts
│   └── utils/
│       └── validators.ts
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Types Patient et FHIRPatient définis
- [ ] Mapping Patient ↔ FHIRPatient fonctionne
- [ ] Schéma Zod valide un patient correct
- [ ] Schéma Zod rejette un patient invalide avec messages FR
- [ ] validateNIR valide un NIR correct
- [ ] validateNIR rejette un NIR invalide
- [ ] validateFrenchPhone accepte 0612345678
- [ ] validateFrenchPhone rejette +33612345678 (format non accepté)

---

## Notes importantes

> ⚠️ Les messages d'erreur Zod doivent être en français.

> ⚠️ Le mapping vers FHIR doit gérer les champs optionnels (ne pas créer de propriétés undefined).

> Pour les tests manuels, utiliser des NIR de test valides (ex: 1 85 05 78 006 084 36).

---

## Prochain bloc

**[BLOC 1.2]** — API CRUD Patient (FHIR)
