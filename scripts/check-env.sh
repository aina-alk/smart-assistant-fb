#!/bin/bash
set -e

REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "FIREBASE_ADMIN_PROJECT_ID"
    "FIREBASE_ADMIN_CLIENT_EMAIL"
    "FIREBASE_ADMIN_PRIVATE_KEY"
    "GOOGLE_CLOUD_PROJECT"
    "HEALTHCARE_DATASET_ID"
    "HEALTHCARE_FHIR_STORE_ID"
    "HEALTHCARE_LOCATION"
    "ANTHROPIC_API_KEY"
    "ASSEMBLYAI_API_KEY"
    "RESEND_API_KEY"
)

echo "Vérification des variables d'environnement..."
echo ""

MISSING=0

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "  $VAR manquante"
        MISSING=$((MISSING + 1))
    else
        echo "  $VAR configurée"
    fi
done

echo ""

if [ -z "$SCALINGO_REDIS_URL" ] && [ -z "$REDIS_URL" ]; then
    echo "  Aucune URL Redis configurée (SCALINGO_REDIS_URL ou REDIS_URL)"
    echo "   Le rate-limiting sera désactivé"
    echo ""
fi

if [ $MISSING -gt 0 ]; then
    echo "$MISSING variable(s) manquante(s)"
    exit 1
else
    echo "Toutes les variables requises sont configurées"
fi
