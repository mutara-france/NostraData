/* NostraData — données de démonstration.
   TOUT est fictif : questions, probabilités, verdicts, tournois, pseudonymes et scores.
   Ce fichier sera remplacé par une vraie source de données (API) quand le produit existera. */
window.ND = {
  // Adresse de contact de l'espace pro. Laisser vide tant qu'elle n'existe pas : le bouton reste inactif.
  contactEmail: "",

  // Nombre de questions tranchées qu'il faut pour entrer au classement.
  minResolved: 30,

  // Identifiant de la question du jour (voir « questions » plus bas).
  todayId: "film-week-end",

  /* Quatre types de questions :
     - "binaire" : oui ou non. Le joueur donne une probabilité. « index » = probabilité de l'indice.
     - "choix"   : plusieurs réponses possibles. Le joueur choisit son favori et sa confiance. « options[].index » = probabilité de chaque réponse.
     - "nombre"  : un chiffre. Le joueur donne son estimation. « index » = médiane de l'indice, « low » et « high » = fourchette à 80 %.
     - "date"    : une date. Comme "nombre", mais les valeurs sont des positions dans « scale ». */
  questions: [
    { id: "film-week-end", type: "binaire", theme: "culture", themeLabel: "Culture", tournament: "coupe-culture",
      text: "Le film numéro 1 du week-end dépassera-t-il 500 000 entrées ?",
      verdictLabel: "Verdict dimanche soir", players: 2318, rule: "Chiffres du box-office publiés lundi matin.",
      index: 62, sources: { joueurs: 66, marches: 58 } },

    { id: "palme-or", type: "choix", theme: "culture", themeLabel: "Culture", tournament: "coupe-culture",
      text: "De quel continent viendra la Palme d'or 2027 ?",
      verdictLabel: "Verdict le soir du palmarès", players: 964, rule: "Nationalité principale du film primé, selon le palmarès officiel.",
      options: [ { label: "Europe", index: 46 }, { label: "Asie", index: 27 }, { label: "Amériques", index: 21 }, { label: "Afrique ou Océanie", index: 6 } ] },

    { id: "participation-75", type: "binaire", theme: "politique", themeLabel: "Politique", tournament: "presidentielle-2027",
      text: "La participation au premier tour de la présidentielle dépassera-t-elle 75 % ?",
      verdictLabel: "Verdict le soir du premier tour", players: 3120, rule: "Chiffre officiel du ministère de l'Intérieur, publié le soir du vote.",
      index: 51, sources: { joueurs: 41, marches: 58 } },

    { id: "nombre-candidats", type: "nombre", theme: "politique", themeLabel: "Politique", tournament: "presidentielle-2027",
      text: "Combien de candidats seront sur la ligne de départ du premier tour ?",
      verdictLabel: "Verdict à la publication de la liste officielle", players: 1475, rule: "Liste officielle publiée par le Conseil constitutionnel.",
      min: 6, max: 18, step: 1, unit: "candidats", index: 11, low: 9, high: 13 },

    { id: "theme-debat", type: "choix", theme: "politique", themeLabel: "Politique", tournament: "presidentielle-2027",
      text: "Quel thème occupera le plus de temps dans le débat d'entre-deux-tours ?",
      verdictLabel: "Verdict le lendemain du débat", players: 1203, rule: "Temps de parole par thème, mesuré sur la retranscription du débat.",
      options: [ { label: "Pouvoir d'achat", index: 38 }, { label: "Sécurité", index: 24 }, { label: "Santé", index: 16 }, { label: "Écologie", index: 12 }, { label: "Autre", index: 10 } ] },

    { id: "livret-a", type: "nombre", theme: "economie", themeLabel: "Économie", tournament: null,
      text: "Quel sera le taux du Livret A au 1er février 2027 ?",
      verdictLabel: "Verdict le 1er février", players: 1890, rule: "Taux en vigueur publié au Journal officiel.",
      min: 0.5, max: 3, step: 0.25, unit: "%", index: 1.5, low: 1.25, high: 1.75 },

    { id: "baisse-taux", type: "date", theme: "economie", themeLabel: "Économie", tournament: null,
      text: "Quand la prochaine baisse des taux de la banque centrale sera-t-elle annoncée ?",
      verdictLabel: "Verdict le jour de l'annonce", players: 742, rule: "Communiqué officiel de la banque centrale.",
      scale: ["décembre 2026", "janvier 2027", "mars 2027", "avril 2027", "juin 2027", "juillet 2027", "septembre 2027", "plus tard"],
      index: 3, low: 2, high: 5 },

    { id: "six-nations", type: "choix", theme: "sport", themeLabel: "Sport", tournament: null,
      text: "Qui gagnera le Tournoi des Six Nations 2027 ?",
      verdictLabel: "Verdict après la dernière journée", players: 2760, rule: "Classement final officiel du Tournoi.",
      options: [ { label: "France", index: 34 }, { label: "Irlande", index: 29 }, { label: "Angleterre", index: 19 }, { label: "Une autre nation", index: 18 } ] },

    { id: "vol-habite", type: "date", theme: "sciences", themeLabel: "Sciences", tournament: null,
      text: "Quand aura lieu le prochain vol habité autour de la Lune ?",
      verdictLabel: "Verdict le jour du décollage", players: 1318, rule: "Date du décollage confirmée par l'agence spatiale.",
      scale: ["1er trimestre 2027", "2e trimestre 2027", "3e trimestre 2027", "4e trimestre 2027", "2028", "plus tard"],
      index: 2, low: 1, high: 4 },

    { id: "mission-date", type: "binaire", theme: "sciences", themeLabel: "Sciences", tournament: null,
      text: "La mission décollera-t-elle à la date prévue ?",
      verdictLabel: "Verdict dans 4 jours", players: 890, rule: "Décollage constaté avant la fin de la fenêtre annoncée.",
      index: 24, sources: { joueurs: 30, marches: 19 } }
,

    { id: "part-electrique", type: "nombre", theme: "sciences", themeLabel: "Sciences", tournament: "mobilites-2030",
      text: "Quelle part des voitures neuves vendues en France en 2027 sera électrique\u202f?",
      verdictLabel: "Verdict en janvier 2028", players: 640, rule: "Immatriculations de l'année, selon les chiffres officiels du secteur.",
      min: 10, max: 50, step: 1, unit: "%", index: 27, low: 23, high: 32 },

    { id: "velo-travail", type: "binaire", theme: "sciences", themeLabel: "Sciences", tournament: "mobilites-2030",
      text: "Le vélo dépassera-t-il 5\u202f% des trajets domicile-travail en 2027\u202f?",
      verdictLabel: "Verdict à la publication de l'enquête annuelle", players: 512, rule: "Enquête nationale sur les déplacements, édition 2027.",
      index: 34, sources: { joueurs: 39, marches: 29 } },

    { id: "tarif-electricite", type: "binaire", theme: "economie", themeLabel: "Économie", tournament: "energie-2027",
      text: "Le tarif réglementé de l'électricité baissera-t-il au 1er février 2027\u202f?",
      verdictLabel: "Verdict le 1er février", players: 88, rule: "Tarif publié au Journal officiel.",
      index: 57, sources: { joueurs: 61, marches: 53 } },

    { id: "prix-megawattheure", type: "nombre", theme: "economie", themeLabel: "Économie", tournament: "energie-2027",
      text: "Quel sera le prix moyen du mégawattheure sur le marché de gros au premier trimestre 2027\u202f?",
      verdictLabel: "Verdict début avril", players: 74, rule: "Moyenne trimestrielle du marché de gros français.",
      min: 30, max: 150, step: 5, unit: "€", index: 75, low: 60, high: 95 }
  ],

  /* Tournois : une série de questions, un classement dédié, un titre ou une dotation à gagner.
     Un tournoi d'entreprise (NostraData Business) ajoute :
     - sponsor  : { name, visible, about }. Si « visible » est faux, l'entreprise reste anonyme.
     - dotation : { amount, mode }. mode = "meilleur" (le premier), "trois" (les 3 premiers) ou "tous" (tous les répondants).
     - audience : { label, titles }. Si « titles » est présent, seuls ces titres peuvent participer. */
  tournaments: [
    { id: "presidentielle-2027", name: "Présidentielle 2027", theme: "politique", status: "en-cours", statusLabel: "En cours",
      description: "Douze questions suivies jusqu'au soir du second tour. Le baromètre de la campagne, question par question.",
      total: 12, ends: "Jusqu'au soir du second tour", players: 4210, reward: "Titre « Oracle de la présidentielle »",
      leaderboard: [ { rank: 1, name: "Cassandre", title: "Oracle", score: 86 }, { rank: 2, name: "Pythie33", title: "Augure", score: 83 }, { rank: 3, name: "LeVate", title: "Oracle", score: 80 }, { rank: 4, name: "Zénon", title: "Devin", score: 78 }, { rank: 5, name: "Mox", title: "Augure", score: 77 } ] },
    { id: "coupe-culture", name: "Coupe Culture", theme: "culture", status: "en-cours", statusLabel: "En cours",
      description: "Cinéma, livres, musique : huit questions jusqu'au palmarès de mai.",
      total: 8, ends: "Jusqu'au palmarès de mai", players: 1630, reward: "Titre « Œil du public »",
      leaderboard: [ { rank: 1, name: "Sibylle_K", title: "Augure", score: 82 }, { rank: 2, name: "Alea", title: "Devin", score: 79 }, { rank: 3, name: "PeuOuProu", title: "Augure", score: 78 }, { rank: 4, name: "Cassandre", title: "Oracle", score: 75 }, { rank: 5, name: "LaBoussole", title: "Devin", score: 73 } ] },
    { id: "economie-2027", name: "Économie 2027", theme: "economie", status: "a-venir", statusLabel: "Ouvre en janvier",
      description: "Taux, inflation, emploi : dix questions pour toute l'année 2027.",
      total: 10, ends: "Jusqu'au 31 décembre 2027", players: 0, reward: "Titre « Boussole de l'année »",
      leaderboard: [] },
    { id: "mobilites-2030", name: "Mobilités 2030", theme: "sciences", status: "en-cours", statusLabel: "En cours",
      description: "Voiture électrique, train, vélo : six questions sur la façon dont on se déplacera.",
      total: 6, ends: "Jusqu'au 30 juin 2027", players: 870, reward: "5\u202f000\u00a0€ de dotation",
      sponsor: { name: "Boréal Mobilités", visible: true, about: "" },
      dotation: { amount: 5000, mode: "trois" },
      audience: { label: "Ouvert à tous les joueurs" },
      leaderboard: [ { rank: 1, name: "LeVate", title: "Oracle", score: 83 }, { rank: 2, name: "Tirésias", title: "Devin", score: 80 }, { rank: 3, name: "Mox", title: "Augure", score: 78 }, { rank: 4, name: "Alea", title: "Devin", score: 74 }, { rank: 5, name: "Zénon", title: "Devin", score: 72 } ] },
    { id: "energie-2027", name: "Prix de l'énergie 2027", theme: "economie", status: "en-cours", statusLabel: "En cours",
      description: "Quatre questions sur les prix de l'électricité et du gaz en 2027.",
      total: 4, ends: "Jusqu'au 31 mars 2027", players: 96, reward: "3\u202f000\u00a0€ de dotation",
      sponsor: { name: "", visible: false, about: "" },
      dotation: { amount: 3000, mode: "tous" },
      audience: { label: "Réservé aux Augures et aux Oracles", titles: ["Augure", "Oracle"] },
      leaderboard: [ { rank: 1, name: "Cassandre", title: "Oracle", score: 85 }, { rank: 2, name: "Sibylle_K", title: "Augure", score: 81 }, { rank: 3, name: "PeuOuProu", title: "Augure", score: 79 }, { rank: 4, name: "Pythie33", title: "Augure", score: 76 }, { rank: 5, name: "LeVate", title: "Oracle", score: 75 } ] }
  ],

  // Répartition par défaut d'une dotation entre les 3 meilleurs (en %). À régler.
  sharesTopThree: [50, 30, 20],

  // Verdicts déjà tombés. « said » est la probabilité annoncée pour « Oui ».
  verdicts: [
    { theme: "sport", themeLabel: "Sport", text: "Le record du monde du marathon tombera-t-il à Valence ?", said: 23, result: "Non", date: "9 novembre" },
    { theme: "economie", themeLabel: "Économie", text: "L'inflation d'octobre passera-t-elle sous 1 % ?", said: 64, result: "Non", date: "8 novembre" },
    { theme: "sciences", themeLabel: "Sciences", text: "Le lancement de la fusée aura-t-il lieu avant vendredi ?", said: 71, result: "Oui", date: "7 novembre" },
    { theme: "politique", themeLabel: "Politique", text: "Le texte sera-t-il voté avant jeudi soir ?", said: 81, result: "Oui", date: "6 novembre" },
    { theme: "culture", themeLabel: "Culture", text: "Le prix littéraire ira-t-il à un premier roman ?", said: 18, result: "Non", date: "4 novembre" },
    { theme: "sport", themeLabel: "Sport", text: "Le leader du championnat gagnera-t-il samedi ?", said: 68, result: "Oui", date: "2 novembre" },
    { theme: "economie", themeLabel: "Économie", text: "Le CAC 40 finira-t-il la semaine en hausse ?", said: 47, result: "Oui", date: "31 octobre" },
    { theme: "sciences", themeLabel: "Sciences", text: "La sonde enverra-t-elle ses premières images avant la fin du mois ?", said: 24, result: "Non", date: "29 octobre" }
  ],

  // Carnet de notes : probabilité annoncée, fréquence observée.
  resolvedCount: 214,
  calibration: [
    { said: 10, happened: 12 }, { said: 30, happened: 27 }, { said: 50, happened: 53 },
    { said: 70, happened: 69 }, { said: 90, happened: 88 }
  ],

  /* Classement général de la saison (indice de fiabilité sur 100).
     « resolved » = questions tranchées, « since » = date d'arrivée.
     Les scores par catégorie, la calibration et l'historique des profils publics sont dérivés
     de ces lignes par app.js, de façon fixe, uniquement pour la démonstration. */
  leaderboard: [
    { rank: 1, name: "Cassandre", title: "Oracle", score: 84, resolved: 162, since: "janvier 2026" },
    { rank: 2, name: "LeVate", title: "Oracle", score: 81, resolved: 148, since: "février 2026" },
    { rank: 3, name: "Mox", title: "Augure", score: 79, resolved: 97, since: "mars 2026" },
    { rank: 4, name: "PeuOuProu", title: "Augure", score: 77, resolved: 121, since: "janvier 2026" },
    { rank: 5, name: "Sibylle_K", title: "Augure", score: 76, resolved: 88, since: "avril 2026" },
    { rank: 6, name: "Pythie33", title: "Augure", score: 75, resolved: 104, since: "mars 2026" },
    { rank: 7, name: "Tirésias", title: "Devin", score: 73, resolved: 64, since: "mai 2026" },
    { rank: 8, name: "LaBoussole", title: "Devin", score: 72, resolved: 59, since: "juin 2026" },
    { rank: 9, name: "Zénon", title: "Devin", score: 71, resolved: 71, since: "avril 2026" },
    { rank: 10, name: "Alea", title: "Devin", score: 70, resolved: 46, since: "juillet 2026" }
  ],

  // NostraData Intelligence : exemples de rapports (fictifs).
  reports: [
    { theme: "politique", themeLabel: "Politique", title: "Présidentielle 2027", rhythm: "Chaque mois, puis chaque semaine en avril", summary: "Participation, qualifiés, écarts entre marchés et opinion, et ce que disent les meilleurs prévisionnistes." },
    { theme: "economie", themeLabel: "Économie", title: "Taux, inflation, énergie", rhythm: "Chaque mois", summary: "Les probabilités clés pour les décisions de budget et d'achat, avec leurs fourchettes." },
    { theme: "sciences", themeLabel: "Sciences", title: "Mobilités et transition", rhythm: "Chaque trimestre", summary: "Les jalons à venir, datés et chiffrés, avec l'historique de fiabilité sur le thème." }
  ]
};
