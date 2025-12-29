# FHIR Playbook (projet)

Ce mémo décrit **comment on fait du FHIR R4 dans ce repo**, en restant aligné avec:
- `src/lib/api/fhir-client.ts` (client Google Healthcare)
- `src/types/fhir.ts` (types FHIR R4)
- `src/lib/utils/fhir-helpers.ts` (helpers / références)

## 1) Invariants FHIR à respecter ici

- Toute ressource a un `resourceType` correct.
- Les références inter-ressources utilisent `Reference.reference = "ResourceType/id"`.
- Dates:
  - `birthDate` → `YYYY-MM-DD`
  - `dateTime` / `instant` → ISO 8601
- Les réponses d’erreur de l’API FHIR sont souvent des `OperationOutcome`.

## 2) CRUD avec `FHIRClient`

Créer / Lire / Mettre à jour / Supprimer:

```ts
import type { Patient } from '@/types/fhir';
import { fhirClient } from '@/lib/api/fhir-client';

if (!fhirClient) throw new Error('FHIR non configuré');

// CREATE
const created = await fhirClient.create<Patient>('Patient', {
  resourceType: 'Patient',
  name: [{ use: 'official', family: 'Martin', given: ['Alice'] }],
});

// READ
const patient = await fhirClient.read<Patient>('Patient', created.id!);

// UPDATE (PUT)
const updated = await fhirClient.update<Patient>('Patient', patient.id!, {
  ...patient,
  active: true,
});

// DELETE
await fhirClient.delete('Patient', updated.id!);
```

Notes:
- Ici, on évite de forcer un `id` au `POST` sauf besoin; on utilise l’ID renvoyé.
- `update` = `PUT` “full replace”: fournir une ressource cohérente.

## 3) Search + pagination

Search renvoie un `Bundle` (souvent `type: "searchset"`), dont `entry` peut être absent.

```ts
import type { Bundle, Patient } from '@/types/fhir';
import { fhirClient } from '@/lib/api/fhir-client';

if (!fhirClient) throw new Error('FHIR non configuré');

const bundle = await fhirClient.search<Patient>('Patient', {
  name: 'Martin',
  _count: '20',
});

const patients: Patient[] =
  bundle.entry?.flatMap((e) => (e.resource ? [e.resource] : [])) ?? [];
```

### Pagination (lien `next`)

Le standard FHIR fournit `Bundle.link[]` avec `relation: "next"`.

Limitation actuelle: `FHIRClient` **n’expose pas** de méthode publique pour “suivre” un `next.url` (car `request()` est `private`).
Si vous avez besoin de pagination dans l’app, la bonne approche est:
- ajouter à `FHIRClient` une méthode publique dédiée (ex: `getByUrl<T>(url: string): Promise<T>`),
- qui réutilise la même auth / headers / retry logic,
- puis consommer `next.url` via cette méthode.

## 4) Références (Reference)

Ne concaténez pas “à la main”. Utilisez `createReference()`:

```ts
import { createReference } from '@/lib/utils/fhir-helpers';

const patientRef = createReference('Patient', '123');
// { reference: "Patient/123", type: "Patient" }
```

## 5) Batch vs Transaction (Bundle)

Quand vous devez créer/mettre à jour plusieurs ressources en une fois:

- **transaction**: all-or-nothing (recommandé quand les ressources doivent rester cohérentes entre elles)
- **batch**: best-effort (chaque entry peut réussir/échouer indépendamment)

Exemple (transaction):

```ts
import type { Bundle, Encounter, Patient } from '@/types/fhir';
import { fhirClient } from '@/lib/api/fhir-client';

if (!fhirClient) throw new Error('FHIR non configuré');

const tx: Bundle = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: { resourceType: 'Patient', name: [{ family: 'Martin' }] } as Patient,
      request: { method: 'POST', url: 'Patient' },
    },
    {
      resource: {
        resourceType: 'Encounter',
        status: 'planned',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' },
      } as Encounter,
      request: { method: 'POST', url: 'Encounter' },
    },
  ],
};

const txResult = await fhirClient.batch(tx);
```

## 6) Erreurs: `FHIRError` / `OperationOutcome`

Le client lève `FHIRError` avec `statusCode` et `outcome` (si l’API renvoie un `OperationOutcome`).
Dans les API routes, renvoyer une erreur “safe” (message court) et éviter toute fuite de PHI.

## 7) Checklist rapide avant d’envoyer une ressource

- `resourceType` OK
- Références: `ResourceType/id`
- Champs “date” au bon format
- Pas de champs inventés (respecter `src/types/fhir.ts` / FHIR R4)
- Pas de logs contenant la ressource brute

## Sources (officielles)

- HL7 FHIR R4 — REST API: `https://hl7.org/fhir/R4/http.html`
- HL7 FHIR R4 — Search: `https://hl7.org/fhir/R4/search.html`
- HL7 FHIR R4 — Bundle (batch/transaction): `https://hl7.org/fhir/R4/bundle.html`
- HL7 FHIR R4 — OperationOutcome: `https://hl7.org/fhir/R4/operationoutcome.html`
- HL7 FHIR R4 — References: `https://hl7.org/fhir/R4/references.html`
- Google Cloud Healthcare API — FHIR: `https://cloud.google.com/healthcare-api/docs/how-tos/fhir`

