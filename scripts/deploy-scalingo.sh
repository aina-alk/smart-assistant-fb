#!/bin/bash
set -e

APP_NAME="selav-med-assist"

echo "Déploiement de $APP_NAME sur Scalingo"

if ! command -v scalingo &> /dev/null; then
    echo "Scalingo CLI non installé. Installer avec:"
    echo "   brew install scalingo"
    exit 1
fi

echo "Vérification de la connexion Scalingo..."
scalingo -a $APP_NAME apps-info || {
    echo "Impossible de se connecter à l'app $APP_NAME"
    echo "   Vérifier: scalingo login"
    exit 1
}

echo "Déploiement en cours..."
git push scalingo-deploy main

echo "Déploiement terminé!"
echo "URL: https://$APP_NAME.osc-fr1.scalingo.io"
