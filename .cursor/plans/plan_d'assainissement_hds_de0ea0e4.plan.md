---
name: Plan d'assainissement HDS
overview: ""
todos:
  - id: apply-anonymization-ia
    content: Appliquer anonymize/deanonymize sur routes IA et clients
    status: pending
  - id: add-fhir-audit
    content: Créer audit FHIR et brancher routes patients/consults
    status: pending
  - id: harden-rate-limit
    content: Renforcer rate-limit fail-secure et logs
    status: pending
  - id: complete-routes-docs
    content: Ajouter routes ordonnances/bilans et docs HDS
    status: pending
---

# Plan d'assainissement HDS

Objectif : combler les écarts HDS (anonymisation IA, audit FHIR, rate-limit fail-secure, routes manquantes, docs) avant revue finale.

- Intégrer l’anonymisation dans les flux IA (`src/app/api/consultations/[id]/generate/route.ts`, `src/app/api/codage/suggest/route.ts`, `src/app/api/transcription/route.ts`, `src/lib/api/claude-client.ts`, `src/lib/api/assemblyai-client.ts`) en appliquant `anonymize/deanonymize` et en purgeant le contexte après usage.
- Ajouter un audit nominatif FHIR en créant `src/lib/audit/` et en wrappant `src/lib/api/fhir-client.ts` + enrichir `src/lib/api/auth-helpers.ts`, puis brancher les routes patients/consultations pour tracer userId/email/IP/User-Agent.