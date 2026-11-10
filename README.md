# NostraData

L'avenir, en probabilités. Chaque jour, une question : tu donnes ta probabilité, on te montre l'indice, et le verdict dit qui avait raison.

Ce dépôt contient la première version du site : une **démo statique**, sans serveur ni base de données.

> **Tout est fictif dans cette démo** : questions, probabilités, verdicts, pseudonymes et scores. Un bandeau le rappelle en haut de chaque page.

## Ce que fait le site

| Page | Fichier | Contenu |
| --- | --- | --- |
| Aujourd'hui | `index.html` | La question du jour jouable, les trois temps du jeu, un aperçu des questions, des tournois et des verdicts |
| Questions | `questions.html` | Toutes les questions ouvertes, filtrées par catégorie (barre du haut) et par type |
| Une question | `question.html?id=…` | Le pronostic, la révélation de l'indice et la règle du verdict |
| Tournois | `tournois.html` | La liste des tournois |
| Un tournoi | `tournoi.html?id=…` | Ses questions, son classement, le bouton pour le rejoindre |
| Verdicts | `verdicts.html` | Le carnet de notes : ce qu'on avait dit, ce qui est arrivé |
| Classement | `classement.html` | Le classement général et par catégorie, avec le podium |
| Profil public | `profil.html?u=…` | L'indice de fiabilité d'un joueur, sa calibration, ses scores par catégorie, ses verdicts et ses tournois |
| Intelligence | `intelligence.html` | NostraData Intelligence : les rapports par thème, sur abonnement |
| Business | `business.html` | NostraData Business : la plateforme interne, les tournois dotés et le simulateur de dotation |
| Connexion | `connexion.html` | Connexion et création de compte (démo) |

### Quatre types de questions

| Type | Ce que donne le joueur | Ce que montre la révélation |
| --- | --- | --- |
| Oui ou non (`binaire`) | Une probabilité de 0 à 100 | Toi contre l'indice, l'écart, les joueurs et les marchés |
| Choix multiple (`choix`) | Son favori et sa confiance | La répartition de l'indice entre les réponses |
| Chiffre (`nombre`) | Son estimation | L'indice et sa fourchette, sur une échelle |
| Date (`date`) | Quand ça arrivera | L'indice et sa fourchette, sur une échelle |

### Ce qui marche déjà

- le curseur de pronostic, avec l'anneau qui change de tête ;
- la révélation pour chaque type de question, avec le tampon « Contre la foule » ;
- le défi à un ami par lien (`question.html?id=…&defi=40` pour les questions oui ou non) ;
- les catégories dans la barre du haut, et les filtres par type ;
- les tournois : on se connecte, on rejoint, on apparaît au classement du tournoi ;
- les tournois d'entreprise : nom visible ou anonyme, accès ouvert ou réservé à certains titres, dotation et répartition affichées ;
- le simulateur de dotation de la page Business : meilleur prévisionniste, 3 meilleurs, ou tous les répondants ;
- le classement général et par catégorie, avec un lien vers le profil public de chaque joueur ;
- la connexion **en mode démo** : rien n'est envoyé, l'e-mail et le mot de passe ne sont ni vérifiés ni enregistrés, seul le pseudonyme est gardé dans le navigateur.

Tout l'état du joueur (pronostics, pseudonyme, tournois rejoints) est dans le `localStorage` du navigateur. Rien n'est envoyé à un serveur.

### Les règles de dotation (proposition de démonstration)

| Mode | Répartition |
| --- | --- |
| Le meilleur prévisionniste | 100 % au premier du classement du tournoi |
| Les 3 meilleurs | 50 %, 30 %, 20 % (réglable dans `sharesTopThree`, fichier `data.js`) |
| Tous les répondants | Au prorata de la justesse ; le site affiche la moyenne par répondant |

Aucun paiement n'existe dans la démo, et les frais de service de NostraData ne sont pas encore définis.

### Les profils publics dans la démo

Les dix joueurs du classement ont un profil. Leurs scores par catégorie, leur calibration et leur historique sont **dérivés du classement par un calcul fixe** dans `app.js` : ce ne sont pas de vraies mesures. Le joueur connecté a un profil sans indice, qui liste ses réponses en attente.

### Ce qui n'existe pas encore

Les vrais comptes (il faudra un serveur et une vraie authentification avant d'ouvrir l'inscription), les vraies questions, le calcul de l'indice, les données de marché, les vrais classements.

## Lancer le site en local

Aucune installation. Depuis la racine du dépôt :

```bash
python3 -m http.server 8000
```

Puis ouvrir <http://localhost:8000>.

## Mettre en ligne avec GitHub Pages

1. Dans le dépôt GitHub : **Settings → Pages**.
2. Source : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Le site est publié quelques minutes plus tard à l'adresse indiquée par GitHub.

## Organisation des fichiers

```
index.html, questions.html, question.html    le jeu
tournois.html, tournoi.html                  les tournois
verdicts.html, classement.html               le carnet de notes et le classement
profil.html                                  le profil public d'un joueur
intelligence.html, business.html             les offres professionnelles
connexion.html                               la connexion (démo)
assets/css/style.css                         la charte (couleurs, typographie, composants)
assets/js/data.js                            les données de démonstration et les réglages
assets/js/app.js                             l'anneau vivant, le jeu, les tournois, la connexion
assets/img/                                  le logo et le favicon
assets/fonts/                                la police Inter, hébergée sur place
```

## Modifier le contenu

Tout le contenu de démonstration est dans `assets/js/data.js` :

- `todayId` : l'identifiant de la question du jour ;
- `questions` : les questions ouvertes, avec leur type, leur thème, leur tournoi et l'indice ;
- `tournaments` : les tournois, leur titre ou leur dotation, leur entreprise (visible ou anonyme) et leur classement ;
- `reports` : les exemples de rapports de la page Intelligence ;
- `verdicts` : les questions tranchées (`said` est la probabilité annoncée pour « Oui ») ;
- `leaderboard` : le classement ;
- `contactEmail` : l'adresse de l'espace pro. Tant qu'elle est vide, le bouton « Demander une démo » reste inactif.

## Charte

- **Logo** : l'anneau et le nom, « Nostra » en gras.
- **Police** : Inter, en trois graisses (400, 500, 600). Aucun texte sous 15 px.
- **Couleurs de thème** : Politique `#2B50FF`, Sport `#2FD68B`, Culture `#FF7EB6`, Économie `#FF9A3D`, Sciences `#A98BFF`. Texte noir sur la couleur, blanc uniquement sur le bleu.
- **Deux registres** : le jeu est en couleur, l'espace pro reste en noir et blanc.

## Points à valider avant un vrai lancement

- Le cadre juridique : jeu gratuit sans mise, aucun lien vers un site de paris, et jamais le mot « sondage ».
- La marque : une société australienne s'appelle déjà NostraData.
- Les droits d'utilisation des données de marché.
- Les données personnelles : comptes, pseudonymes, consentement.
- Les dotations des tournois d'entreprise : rémunérer des joueurs en argent demande un cadre juridique et fiscal précis, à valider avant tout versement.
- Les prix de NostraData Intelligence et les frais de service de NostraData Business.

## Crédits

La police Inter est distribuée sous licence SIL Open Font License 1.1 (voir `assets/fonts/LICENCE-Inter.txt`).
