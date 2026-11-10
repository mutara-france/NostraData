/* NostraData — données de démonstration.
   TOUT est fictif : questions, probabilités, verdicts, pseudonymes et scores.
   Ce fichier sera remplacé par une vraie source de données (API) quand le produit existera. */
window.ND = {
  // Adresse de contact de l'espace pro. Laisser vide tant qu'elle n'existe pas : le bouton reste inactif.
  contactEmail: "",

  // Nombre de questions tranchées qu'il faut pour entrer au classement.
  minResolved: 30,

  // La question du jour.
  today: {
    id: "demo-2026-11-10",
    theme: "culture",
    themeLabel: "Culture",
    text: "Le film numéro 1 du week-end dépassera-t-il 500 000 entrées ?",
    verdictLabel: "Verdict dimanche soir",
    players: 2318,
    index: 62,
    sources: { joueurs: 66, marches: 58 },
    rule: "Chiffres du box-office publiés lundi matin."
  },

  // Verdicts déjà tombés. « said » est la probabilité annoncée pour « Oui ».
  verdicts: [
    { theme: "sport", themeLabel: "Sport", text: "Le record du monde du marathon tombera-t-il à Valence ?", said: 23, result: "Non", date: "9 novembre" },
    { theme: "economie", themeLabel: "Économie", text: "L'inflation d'octobre passera-t-elle sous 1 % ?", said: 64, result: "Non", date: "8 novembre" },
    { theme: "sciences", themeLabel: "Sciences", text: "Le lancement de la fusée aura-t-il lieu avant vendredi ?", said: 71, result: "Oui", date: "7 novembre" },
    { theme: "politique", themeLabel: "Politique", text: "Le texte sera-t-il voté avant jeudi soir ?", said: 81, result: "Oui", date: "6 novembre" },
    { theme: "culture", themeLabel: "Culture", text: "Le prix littéraire ira-t-il à un premier roman ?", said: 18, result: "Non", date: "4 novembre" },
    { theme: "sport", themeLabel: "Sport", text: "Le leader du championnat gagnera-t-il samedi ?", said: 68, result: "Oui", date: "2 novembre" },
    { theme: "economie", themeLabel: "Économie", text: "Le CAC 40 finira-t-il la semaine en hausse ?", said: 47, result: "Oui", date: "31 octobre" },
    { theme: "sciences", themeLabel: "Sciences", text: "La mission décollera-t-elle à la date prévue ?", said: 24, result: "Non", date: "29 octobre" }
  ],

  // Carnet de notes : probabilité annoncée, fréquence observée.
  resolvedCount: 214,
  calibration: [
    { said: 10, happened: 12 }, { said: 30, happened: 27 }, { said: 50, happened: 53 },
    { said: 70, happened: 69 }, { said: 90, happened: 88 }
  ],

  // Classement de la saison (indice de fiabilité sur 100).
  leaderboard: [
    { rank: 1, name: "Cassandre", title: "Oracle", score: 84 },
    { rank: 2, name: "LeVate", title: "Oracle", score: 81 },
    { rank: 3, name: "Mox", title: "Augure", score: 79 },
    { rank: 4, name: "PeuOuProu", title: "Augure", score: 77 },
    { rank: 5, name: "Sibylle_K", title: "Augure", score: 76 },
    { rank: 6, name: "Pythie33", title: "Augure", score: 75 },
    { rank: 7, name: "Tirésias", title: "Devin", score: 73 },
    { rank: 8, name: "LaBoussole", title: "Devin", score: 72 },
    { rank: 9, name: "Zénon", title: "Devin", score: 71 },
    { rank: 10, name: "Alea", title: "Devin", score: 70 }
  ]
};
