# Démonstration de Stripe Checkout

## Membres du groupe

- Kerim Kaplaner
- Wassim Naai
- Ibrahim Yahia
- Nabil Sarii El Mouchik
- Yassir Amrani

## Présentation du projet

Ce projet a été réalisé dans le cadre du cours de Web 3 afin de découvrir et de présenter **Stripe**, une plateforme de paiement en ligne.


Nous avons créé une mini-boutique qui vend un produit fictif : un costume rouge à 49,99 €. L'utilisateur peut cliquer sur un bouton de paiement, être redirigé vers la page sécurisée de Stripe Checkout, effectuer un paiement de test, puis revenir sur une page de réussite ou d'annulation.

Le projet fonctionne uniquement avec le **mode test de Stripe**. Aucun paiement réel n'est effectué.

## Contexte réaliste

Stripe est utilisé par de nombreux commerces en ligne pour accepter des paiements sans devoir développer eux-mêmes un formulaire bancaire complet. Notre projet reproduit un cas simple et réaliste : un visiteur consulte un produit dans une boutique, clique sur le bouton de paiement et finalise sa commande sur Stripe Checkout.

## Technologies utilisées

- React
- Vite
- TypeScript
- Node.js
- Express
- Stripe Checkout
- CSS

## Structure du projet

```text
stripe-checkout-demo/
├── frontend/        Application React et Vite — port 5173
├── backend/         Serveur Express et SDK Stripe — port 4242
├── package.json     Commandes générales du projet
└── README.md        Documentation
```

Le produit et son prix sont définis dans `backend/src/product.ts`. Le frontend ne transmet jamais le montant du paiement. Cela évite qu'un utilisateur puisse modifier le prix depuis son navigateur. La clé secrète Stripe est également conservée uniquement dans le backend.

## Démarrer de zéro

Pour utiliser ce projet sans avoir déjà configuré Stripe :

1. Créez gratuitement un compte sur [stripe.com](https://stripe.com/).
2. Connectez-vous au [Dashboard Stripe](https://dashboard.stripe.com/).
3. Vérifiez que le Dashboard est en **mode test**. Il n'est pas nécessaire d'activer le compte ni de fournir des informations bancaires pour effectuer cette démonstration.
4. Dans le menu, ouvrez **Développeurs**, puis **Clés API**. Vous pouvez aussi accéder directement à la page [Clés API en mode test](https://dashboard.stripe.com/test/apikeys).
5. Affichez et copiez la **clé secrète** commençant par `sk_test_`.
6. Placez cette clé dans le fichier `backend/.env` :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
PORT=4242
FRONTEND_URL=http://localhost:5173
```

La clé secrète permet au backend de demander à Stripe de créer une session de paiement. Elle ne doit jamais être placée dans le frontend, publiée sur Git ou montrée dans la vidéo.

Stripe fournit également une clé publique commençant par `pk_test_`. Elle est utile lorsque le frontend utilise directement Stripe.js ou Stripe Elements. **Notre projet utilise Stripe Checkout avec une redirection créée par le backend : la clé publique n'est donc pas nécessaire ici.** Seule la clé secrète de test est utilisée par Express.

## Prérequis

- Node.js 20.19 ou une version plus récente
- npm
- un compte Stripe
- une clé secrète Stripe de test commençant par `sk_test_`

## Installation

Ouvrez un terminal dans le dossier du projet et installez les dépendances :

```bash
npm install
```

## Configuration

Créez les fichiers d'environnement à partir des exemples fournis :

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Ouvrez ensuite `backend/.env` et ajoutez votre clé secrète Stripe de test :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
PORT=4242
FRONTEND_URL=http://localhost:5173
```

Le fichier `frontend/.env` doit contenir :

```env
VITE_API_URL=http://localhost:4242
```

> Ne publiez jamais votre clé secrète et n'utilisez jamais une clé réelle `sk_live_` pour cette démonstration. Les fichiers `.env` sont ignorés par Git et ne doivent pas être placés dans le ZIP remis au professeur.

## Lancement

Lancez le frontend et le backend avec une seule commande :

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:5173](http://localhost:5173).

La route de vérification du backend est disponible sur [http://localhost:4242/api/health](http://localhost:4242/api/health).

## Tester le paiement

1. Ouvrez la boutique sur `http://localhost:5173`.
2. Cliquez sur **Payer en mode test**.
3. Utilisez l'une des cartes Stripe de test indiquées ci-dessous.
4. Saisissez une date future, un CVC fictif à trois chiffres et un code postal valide.
5. Validez le paiement.
6. Observez le résultat correspondant au scénario choisi.

| Scénario | Numéro de carte de test | Résultat attendu |
| --- | --- | --- |
| Paiement accepté | `4242 4242 4242 4242` | Le paiement réussit et Stripe redirige vers la page de succès. |
| Paiement refusé | `4000 0000 0000 0002` | Stripe refuse la carte et affiche un message d'erreur. |
| Authentification 3D Secure | `4000 0027 6000 3184` | Stripe affiche une étape d'authentification 3D Secure avant de terminer le paiement. |

Ces trois scénarios seront montrés pendant la démonstration vidéo afin d'illustrer le mode test et les différents comportements possibles d'un paiement.

Après un paiement accepté, Stripe ajoute un `session_id` à l'adresse de la page de succès. Le frontend envoie cet identifiant à `GET /api/session/:id`. Le backend récupère alors la session directement auprès de Stripe et la page affiche **« Paiement confirmé par Stripe : paid »**. Cette vérification montre que le statut vient bien de Stripe et pas uniquement de la redirection du navigateur.

Pour tester l'annulation, utilisez le bouton de retour présent sur Stripe Checkout. L'utilisateur sera redirigé vers la page d'annulation.

Ces opérations sont entièrement fictives et ne débitent aucune carte bancaire.

## Fonctionnement technique

1. L'utilisateur clique sur le bouton de paiement dans l'application React.
2. React envoie une requête `POST` au backend Express.
3. Le backend récupère le produit et le prix définis sur le serveur.
4. Le SDK Stripe crée une nouvelle session Checkout en mode `payment`.
5. Le backend renvoie l'adresse temporaire de la session Stripe.
6. Le navigateur redirige l'utilisateur vers Stripe Checkout.
7. Après le paiement ou l'annulation, Stripe redirige l'utilisateur vers la page React correspondante.
8. Sur la page de succès, React transmet le `session_id` au backend.
9. Le backend appelle `stripe.checkout.sessions.retrieve(id)` et renvoie le `payment_status` affiché à l'écran.

## Commandes disponibles

```bash
npm run dev        # démarrer le frontend et le backend
npm run build      # compiler le projet
npm run typecheck  # vérifier le code TypeScript
```

## Notre retour personnel

Avant de réaliser ce projet, nous pensions que l'intégration d'un paiement en ligne consistait principalement à ajouter un formulaire bancaire dans une page. Nous avons découvert que Stripe Checkout permet au contraire de rediriger l'utilisateur vers une page de paiement déjà sécurisée et maintenue par Stripe.

Nous aurions aimé savoir dès le départ qu'une intégration Stripe nécessite tout de même un backend. Celui-ci est indispensable pour protéger la clé secrète et empêcher les utilisateurs de modifier le prix depuis leur navigateur. Nous avons également appris la différence entre la clé publique et la clé secrète. Une clé publique peut être utilisée avec Stripe.js ou Stripe Elements dans le frontend, tandis que la clé secrète ne doit jamais quitter le serveur. Dans notre démonstration Stripe Checkout, le frontend n'utilise pas Stripe.js : la clé publique n'est donc pas nécessaire.

Le mode test est particulièrement pratique : il permet de reproduire tout le parcours d'un paiement sans utiliser d'argent réel. Stripe Checkout nous semble donc être une bonne solution pour intégrer rapidement un paiement sécurisé dans un petit projet. En contrepartie, il faut comprendre la communication entre le frontend, le backend et Stripe.

## Limites de notre démonstration

Ce projet est volontairement simple afin de se concentrer sur la découverte de Stripe :

- un seul produit ;
- aucun panier ni compte utilisateur ;
- aucune base de données ;
- aucun remboursement ;
- aucun webhook Stripe ;
- fonctionnement uniquement en mode test.

La page de succès vérifie maintenant le statut de la session directement auprès de Stripe grâce à son `session_id`. Cela convient pour informer l'utilisateur pendant cette démonstration. Dans une véritable boutique, il faudrait toutefois ajouter une base de données et un webhook `checkout.session.completed`. Le webhook permettrait au serveur de confirmer le paiement de manière fiable même si l'utilisateur ferme la page avant la redirection, puis de préparer ou de livrer la commande. La simple visite de la page de réussite ne constitue pas une preuve suffisante de paiement.

## Sécurité

- Le prix est défini uniquement dans le backend.
- La clé secrète est stockée dans un fichier `.env` non partagé.
- Le backend refuse les clés Stripe réelles commençant par `sk_live_`.
- Le projet utilise uniquement Stripe en mode test.
