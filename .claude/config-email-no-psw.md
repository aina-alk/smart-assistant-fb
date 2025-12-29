Authentifiez-vous avec Firebase à l'aide d'Email Link en JavaScript
Vous pouvez utiliser Firebase Authentication pour connecter un utilisateur en lui envoyant un e-mail contenant un lien sur lequel il peut cliquer pour se connecter. Au cours de ce processus, l'adresse e-mail de l'utilisateur est également validée.
Se connecter par e-mail présente de nombreux avantages :

Inscription et connexion fluides
Risque réduit de réutilisation de mots de passe dans les applications, ce qui peut compromettre la sécurité même des mots de passe bien sélectionnés
Capacité à authentifier un utilisateur tout en vérifiant qu'il est le propriétaire légitime d'une adresse e-mail
Pour se connecter, un utilisateur n'a besoin que d'un compte de messagerie accessible. Il n'est pas nécessaire d'être propriétaire d'un numéro de téléphone ou d'un compte de réseau social
Un utilisateur peut se connecter de manière sécurisée sans avoir à fournir (ni à mémoriser) de mot de passe
Un utilisateur existant qui se connectait auparavant avec un identifiant d'adresse e-mail (mot de passe ou fédération) peut passer à la connexion avec l'adresse e-mail uniquement

Avant de commencer
Si vous ne l'avez pas déjà fait, copiez l'extrait d'initialisation de la console Firebase dans votre projet, comme décrit dans la section Ajouter Firebase à votre projet JavaScript.
Activer la connexion par lien d'adresse e-mail pour votre projet Firebase
Pour permettre aux utilisateurs de se connecter à l'aide d'un lien e-mail, vous devez d'abord activer le fournisseur de messagerie et la méthode de connexion par lien e-mail pour votre projet Firebase :

Dans la console Firebase, ouvrez la section Authentification
Dans l'onglet Mode de connexion, activez le fournisseur Adresse e-mail/Mot de passe
Dans la même section, activez la méthode de connexion Lien envoyé par e-mail (connexion sans mot de passe)
Cliquez sur Enregistrer

Envoyer un lien d'authentification à l'adresse e-mail de l'utilisateur
Pour lancer le flux d'authentification, présentez à l'utilisateur une interface qui l'invite à indiquer son adresse e-mail, puis appelez sendSignInLinkToEmail pour demander à Firebase d'envoyer le lien d'authentification.
Créez l'objet ActionCodeSettings
javascriptconst actionCodeSettings = {
url: 'https://www.example.com/finishSignUp?cartId=1234',
handleCodeInApp: true,
iOS: {
bundleId: 'com.example.ios'
},
android: {
packageName: 'com.example.android',
installApp: true,
minimumVersion: '12'
},
linkDomain: 'custom-domain.com'
};
Paramètres importants :

url : lien profond à intégrer et état supplémentaire à transmettre
android et ios : aide Firebase Authentication à déterminer s'il doit créer un lien Web uniquement ou un lien mobile
handleCodeInApp : défini sur true. L'opération de connexion doit toujours être effectuée dans l'application
linkDomain : domaine de lien Hosting personnalisé

Envoyer le lien d'authentification
javascriptimport { getAuth, sendSignInLinkToEmail } from "firebase/auth";

const auth = getAuth();
sendSignInLinkToEmail(auth, email, actionCodeSettings)
.then(() => {
window.localStorage.setItem('emailForSignIn', email);
})
.catch((error) => {
const errorCode = error.code;
const errorMessage = error.message;
});
Finaliser la connexion avec le lien fourni par e-mail
Problèmes de sécurité
Pour éviter qu'un lien de connexion ne soit utilisé pour se connecter en tant qu'utilisateur non autorisé, Firebase Authentication exige que l'adresse e-mail de l'utilisateur soit fournie lors du parcours de connexion.
Finaliser la connexion sur une page Web
javascriptimport { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

const auth = getAuth();
if (isSignInWithEmailLink(auth, window.location.href)) {
let email = window.localStorage.getItem('emailForSignIn');
if (!email) {
email = window.prompt('Please provide your email for confirmation');
}

signInWithEmailLink(auth, email, window.location.href)
.then((result) => {
window.localStorage.removeItem('emailForSignIn');
})
.catch((error) => {
// Erreurs courantes : email invalide, OTP invalide ou expiré
});
}
Se connecter dans une application mobile

Avertissement : Les fonctionnalités Firebase Authentication suivantes sont affectées par l'arrêt de Firebase Dynamic Links le 25 août 2025 : l'authentification via un lien envoyé par e-mail pour les applications mobiles, les flux OAuth pour les applications Android utilisant des versions antérieures du SDK Authentication et la compatibilité de Cordova OAuth avec les applications Web.

Firebase Authentication utilise Firebase Hosting pour envoyer le lien par e-mail à un appareil mobile.
Association/Réauthentification avec le lien par e-mail
Associer à un compte existant
javascriptimport { getAuth, linkWithCredential, EmailAuthProvider } from "firebase/auth";

const credential = EmailAuthProvider.credentialWithLink(
email, window.location.href);

const auth = getAuth();
linkWithCredential(auth.currentUser, credential)
.then((usercred) => {
// Le fournisseur est maintenant lié avec succès
})
.catch((error) => {
// Une erreur s'est produite
});
Réauthentifier un utilisateur
javascriptimport { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const credential = EmailAuthProvider.credentialWithLink(
email, window.location.href);

const auth = getAuth();
reauthenticateWithCredential(auth.currentUser, credential)
.then((usercred) => {
// L'utilisateur peut maintenant exécuter des opérations sensibles
})
.catch((error) => {
// Une erreur s'est produite
});
Modèle d'e-mail par défaut pour la connexion par lien
Le modèle d'e-mail par défaut inclut un code temporel dans l'objet et le corps de l'e-mail afin que les e-mails suivants ne soient pas regroupés dans un seul fil de discussion.
Langues supportées : Arabe, Chinois (simplifié/traditionnel), Néerlandais, Anglais, Français, Allemand, Indonésien, Italien, Japonais, Coréen, Polonais, Portugais (Brésil/Portugal), Russe, Espagnol, Thaï.
Étapes suivantes

Un compte utilisateur est créé à la première connexion et associé aux identifiants
Définir un observateur sur l'objet Auth pour connaître l'état d'authentification
Utiliser les règles de sécurité Firebase pour contrôler l'accès aux données
Possibilité d'associer plusieurs fournisseurs d'authentification

Déconnecter un utilisateur
javascriptimport { getAuth, signOut } from "firebase/auth";

const auth = getAuth();
signOut(auth).then(() => {
// Déconnexion réussie
}).catch((error) => {
// Une erreur s'est produite
});
