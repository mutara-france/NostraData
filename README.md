# NostraData

L'avenir, en probabilités. Chaque jour, une question : tu donnes ta probabilité, on te montre l'indice, et le verdict dit qui avait raison.

Ce dépôt contient la première version du site : une **démo statique**, sans serveur ni base de données.

> **Tout est fictif dans cette démo** : questions, probabilités, verdicts, pseudonymes et scores. Un bandeau le rappelle en haut de chaque page.

## Ce que fait le site

| Page | Fichier | Contenu |
| --- | --- | --- |
| Aujourd'hui | `index.html` | La question du jour jouable (« Tu dis combien ? »), la révélation de l'indice, les trois temps du jeu, un aperçu des verdicts et du classement |
| Verdicts | `verdicts.html` | Le carnet de notes : ce qu'on avait dit, ce qui est arrivé, avec un filtre par thème |
| Classement | `classement.html` | Le podium, le classement de la saison et les règles du jeu |

Ce qui marche déjà :

- le curseur de pronostic, avec l'anneau qui change de tête selon la probabilité ;
- la révélation « toi contre l'indice », avec l'écart et le tampon « Contre la foule » ;
- le défi à un ami : le bouton partage un lien `?defi=40`, et l'ami voit « Un ami dit 40 %. Et toi ? » ;
- le pronostic gardé dans le navigateur (`localStorage`). Rien n'est envoyé à un serveur.

Ce qui n'existe pas encore : les comptes, les vraies questions, le calcul de l'indice, les données de marché, le vrai classement.

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
index.html, verdicts.html, classement.html   les trois pages
assets/css/style.css                         la charte (couleurs, typographie, composants)
assets/js/data.js                            les données de démonstration et les réglages
assets/js/app.js                             l'anneau vivant, le pronostic, les verdicts, le classement
assets/img/                                  le logo et le favicon
assets/fonts/                                la police Inter, hébergée sur place
```

## Modifier le contenu

Tout le contenu de démonstration est dans `assets/js/data.js` :

- `today` : la question du jour, son thème, l'indice et sa règle de verdict ;
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

## Crédits

La police Inter est distribuée sous licence SIL Open Font License 1.1 (voir `assets/fonts/LICENCE-Inter.txt`).
