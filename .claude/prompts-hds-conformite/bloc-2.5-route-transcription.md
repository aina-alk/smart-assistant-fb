# [BLOC 2.5] — Route /api/transcription (Métadonnées Audio)

## Contexte

La route `/api/transcription` envoie des fichiers audio à AssemblyAI pour transcription. L'audio lui-même peut contenir des données identifiantes (le patient dit son nom, son numéro de sécu, etc.) que nous ne pouvons pas anonymiser avant envoi.

Ce bloc documente les limitations et met en place des mesures d'atténuation.

## Objectif de ce bloc

1. Documenter le risque résiduel pour les données vocales
2. Ajouter une anonymisation de la transcription APRÈS réception
3. Ajouter des métadonnées de traçabilité

## Pré-requis

- [ ] Bloc 1.4 terminé (module anonymisation)

## Spécifications

### 1. Fichier à modifier

**Fichier** : `src/app/api/transcription/route.ts`

### 2. Analyse du risque

| Donnée | Avant envoi | Risque | Mitigation |
|--------|-------------|--------|------------|
| Fichier audio | Non anonymisable | ⚠️ Moyen | Voir ci-dessous |
| Transcription retournée | Anonymisable | ✅ Faible | Anonymisation post-réception |

**Mitigations pour l'audio** :
1. **Contractuel** : AssemblyAI a une politique de confidentialité et HIPAA BAA disponible
2. **Technique** : Activer `redact_pii` d'AssemblyAI (si disponible)
3. **Procédural** : Informer le médecin du risque dans les CGU

### 3. Modifications à apporter

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { anonymize, deanonymize, containsSensitiveData } from '@/lib/anonymization';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Auth
    const authResult = await verifyMedecinAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authResult.userId, 'transcription');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Extraire le fichier audio
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Fichier audio requis' },
        { status: 400 }
      );
    }

    // Convertir en buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // ====== Appel AssemblyAI avec options de confidentialité ======
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    // Upload et transcription
    const transcript = await client.transcripts.transcribe({
      audio: audioBuffer,
      language_code: 'fr',
      // Options de confidentialité AssemblyAI (si disponibles)
      // redact_pii: true,
      // redact_pii_policies: ['person_name', 'phone_number', 'email_address'],
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    let transcriptionText = transcript.text || '';

    // ====== Post-traitement : Détection de données sensibles ======
    const hasSensitiveData = containsSensitiveData(transcriptionText);
    
    if (hasSensitiveData) {
      console.warn(
        '[Transcription] ⚠️ Données sensibles détectées dans la transcription. ' +
        'L\'audio source contenait probablement des informations identifiantes.'
      );
    }

    // ====== Métadonnées de traçabilité ======
    const metadata = {
      transcriptionId: transcript.id,
      durationSeconds: transcript.audio_duration || 0,
      wordCount: transcript.words?.length || 0,
      confidence: transcript.confidence || 0,
      sensitiveDataDetected: hasSensitiveData,
      processedAt: new Date().toISOString(),
      // Ne PAS inclure userId pour éviter corrélation
    };

    console.log(
      `[Transcription] Terminée: ${metadata.wordCount} mots, ` +
      `confiance: ${(metadata.confidence * 100).toFixed(1)}%, ` +
      `données sensibles: ${hasSensitiveData ? 'OUI' : 'non'}`
    );

    return NextResponse.json({
      success: true,
      transcription: transcriptionText,
      metadata,
      // Avertissement si données sensibles détectées
      warnings: hasSensitiveData ? [
        'Des données potentiellement identifiantes ont été détectées dans la transcription. ' +
        'Vérifiez le contenu avant de le partager.'
      ] : [],
    });

  } catch (error) {
    console.error('[Transcription] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la transcription' },
      { status: 500 }
    );
  }
}
```

### 4. Option avancée : Anonymisation automatique de la transcription

Si le workflow l'exige, on peut anonymiser la transcription avant de la retourner :

```typescript
// Option : Retourner la transcription déjà anonymisée
// (utile si elle est stockée ou affichée directement)

const { anonymizedText, context, hasAnonymizedData } = anonymize(transcriptionText);

return NextResponse.json({
  success: true,
  transcription: transcriptionText,  // Version originale (pour le médecin)
  anonymizedTranscription: hasAnonymizedData ? anonymizedText : null,  // Version anonymisée
  anonymizationContext: hasAnonymizedData ? {
    // Ne PAS retourner le contexte complet, juste les stats
    tokensCreated: context.stats.totalTokens,
    byType: context.stats.byType,
  } : null,
  metadata,
});
```

### 5. Documentation du risque résiduel

Créer une note dans la documentation :

**Fichier** : `docs/security-notes.md` (NOUVEAU ou à compléter)

```markdown
## Risque résiduel : Transcription audio

### Contexte
Les fichiers audio envoyés à AssemblyAI peuvent contenir des données vocales identifiantes 
(le patient dit son nom, son numéro de sécurité sociale, etc.).

### Limitations techniques
- Impossible d'anonymiser un flux audio avant transcription
- La détection de mots-clés dans l'audio nécessiterait une pré-transcription

### Mitigations en place
1. **Détection post-transcription** : Le système détecte les données sensibles dans la 
   transcription et avertit le médecin
2. **Options AssemblyAI** : `redact_pii` activé si disponible dans le plan
3. **Contractuel** : AssemblyAI propose un HIPAA BAA pour les données de santé US
4. **Formation** : Les médecins sont informés de ne pas faire prononcer de données 
   sensibles pendant l'enregistrement

### Recommandation
Pour une conformité HDS stricte, envisager un service de transcription hébergé en France 
ou on-premise (ex: Whisper self-hosted).
```

## Validation

Ce bloc est terminé quand :

- [ ] Import `containsSensitiveData` ajouté
- [ ] Détection post-transcription implémentée
- [ ] Métadonnées de traçabilité ajoutées
- [ ] Warnings retournés si données sensibles détectées
- [ ] Documentation du risque résiduel créée
- [ ] `pnpm build` réussit

## Test manuel

```bash
# Test avec un fichier audio
curl -X POST http://localhost:3000/api/transcription \
  -H "Authorization: Bearer <token>" \
  -F "audio=@test-consultation.mp3"

# Vérifier :
# - La transcription est retournée
# - Les metadata incluent sensitiveDataDetected
# - Un warning apparaît si données sensibles détectées
```

## Notes importantes

> ⚠️ **Risque résiduel** : L'audio ne peut pas être anonymisé. C'est une limitation technique documentée.

> ℹ️ **Alternative HDS** : Pour une conformité totale, utiliser un service de transcription certifié HDS ou auto-hébergé (Whisper).

> ℹ️ **redact_pii** : L'option AssemblyAI `redact_pii` peut masquer certaines données dans la transcription, mais nécessite un plan Enterprise.

---
**Prochain bloc** : 3.1 — Types et service d'audit FHIR
