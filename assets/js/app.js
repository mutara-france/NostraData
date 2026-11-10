/* NostraData — logique du site (sans dépendance).
   Démo : les pronostics, le pseudonyme et les tournois rejoints sont gardés dans le navigateur (localStorage).
   Rien n'est envoyé à un serveur. */
(function () {
  "use strict";
  var ND = window.ND || {};
  var NNBSP = " ";
  var STORE = "nostradata.v1";
  var TYPES = { binaire: "Oui ou non", choix: "Choix multiple", nombre: "Chiffre", date: "Date" };
  var THEMES = [["politique", "Politique"], ["sport", "Sport"], ["culture", "Culture"], ["economie", "Économie"], ["sciences", "Sciences"]];

  // ---------- Outils ----------
  function $(id) { return document.getElementById(id); }
  function pct(n) { return n + NNBSP + "%"; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  // Évite les coupures de ligne au milieu de « sera-t-il » ou « week-end » (trait d'union insécable).
  function typo(s) { return String(s).replace(/-t-(il|elle|on)\b/g, "‑t‑$1").replace(/week-end/g, "week‑end"); }
  function param(name) { return new URLSearchParams(window.location.search).get(name); }
  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function writeStore(data) {
    try { window.localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) { /* stockage indisponible : la démo marche quand même */ }
  }
  function user() { return readStore().user || null; }
  function findQuestion(id) { return (ND.questions || []).filter(function (q) { return q.id === id; })[0] || null; }
  function findTournament(id) { return (ND.tournaments || []).filter(function (t) { return t.id === id; })[0] || null; }
  function moodFor(p) { return p >= 85 ? "sur" : p >= 60 ? "confiant" : p >= 40 ? "partage" : "sceptique"; }
  function count(n) { return n.toLocaleString("fr-FR"); }

  // Valeur lisible d'une question « nombre » ou « date ».
  function fmt(q, v) {
    if (q.type === "date") { return q.scale[v]; }
    return v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + (q.unit ? (q.unit === "%" ? NNBSP : " ") + q.unit : "");
  }
  function range(q) { return q.type === "date" ? { min: 0, max: q.scale.length - 1, step: 1 } : { min: q.min, max: q.max, step: q.step }; }
  function topOption(q) { return q.options.slice().sort(function (a, b) { return b.index - a.index; })[0]; }
  // Ce que dit l'indice, en une ligne, pour les cartes.
  function summary(q) {
    if (q.type === "binaire") { return pct(q.index); }
    if (q.type === "choix") { return topOption(q).label + " · " + pct(topOption(q).index); }
    return fmt(q, q.index);
  }

  // ---------- L'anneau vivant : l'anneau du logo, avec une tête selon la probabilité ----------
  var FACES = {
    sur: '<path d="M12.6 19.4 Q15.2 15.6 17.8 19.4"/><path d="M22.2 19.4 Q24.8 15.6 27.4 19.4"/><path d="M15.4 23.6 Q20 28.4 24.6 23.6"/>',
    confiant: '<circle class="dot" cx="15.4" cy="18.2" r="1.9"/><circle class="dot" cx="24.6" cy="18.2" r="1.9"/><path d="M16.2 24 Q20 26.8 23.8 24"/>',
    partage: '<circle class="dot" cx="16.6" cy="18.4" r="1.9"/><circle class="dot" cx="25.8" cy="18.4" r="1.9"/><path d="M16.6 24.6 H23.4"/>',
    sceptique: '<circle class="dot" cx="15.4" cy="19" r="1.9"/><circle class="dot" cx="24.6" cy="19" r="1.9"/><path d="M22 14.6 L27.4 13.2"/><path d="M12.8 15 H18"/><path d="M16.4 25.2 L23.6 23.6"/>',
    surpris: '<circle cx="15.2" cy="18" r="2.5"/><circle cx="24.8" cy="18" r="2.5"/><circle cx="20" cy="25" r="1.9"/>'
  };
  function face(frac, mood, color) {
    color = color || "currentColor";
    var arc = (100.53 * Math.max(0, Math.min(1, frac))).toFixed(2);
    return '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true" stroke="' + color + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="20" cy="20" r="16" stroke-width="1.4"/>' +
      '<circle class="arc" cx="20" cy="20" r="16" stroke-width="5" stroke-linecap="butt" transform="rotate(-90 20 20)" stroke-dasharray="' + arc + ' 100.53"/>' +
      '<g>' + FACES[mood].replace(/class="dot"/g, 'stroke="none" fill="' + color + '"') + '</g></svg>';
  }
  function fillFaces(root) {
    (root || document).querySelectorAll("[data-face]").forEach(function (el) {
      var parts = el.getAttribute("data-face").split(",");
      el.innerHTML = face(parseFloat(parts[0]) / 100, parts[1] || "confiant", parts[2]);
    });
  }

  // ---------- En-tête : connexion, compteur de réponses, catégories ----------
  function initHeader() {
    var link = $("auth-link"), u = user();
    if (link && u) {
      link.textContent = u.pseudo;
      link.setAttribute("aria-label", "Mon compte : " + u.pseudo);
    }
    var cats = $("cats");
    if (cats) {
      var current = /questions\.html$/.test(window.location.pathname) ? param("theme") : null;
      cats.innerHTML = THEMES.map(function (t) {
        return '<a class="cat t-' + t[0] + (current === t[0] ? " is-active" : "") + '" href="questions.html?theme=' + t[0] + '"' +
          (current === t[0] ? ' aria-current="true"' : "") + ">" + t[1] + "</a>";
      }).join("");
    }
    showStreak();
  }
  function showStreak() {
    var el = $("streak");
    if (!el) { return; }
    var n = Object.keys(readStore().answers || {}).length;
    if (n < 1) { return; }
    el.innerHTML = '<span class="face">' + face(Math.min(1, n / 7), "sur") + "</span><span>" + n + " réponse" + (n > 1 ? "s" : "") + "</span>";
    el.hidden = false;
  }

  // ---------- Jouer une question (les quatre types) ----------
  function playForm(q) {
    var r, mid, html = '<form id="play-form" class="play-form">';
    if (q.type === "choix") {
      html += '<fieldset class="options"><legend class="play-label">Ton favori' + NNBSP + "?</legend>" +
        q.options.map(function (o, i) {
          return '<label class="option"><input type="radio" name="opt" value="' + i + '" required><span>' + esc(o.label) + "</span></label>";
        }).join("") + "</fieldset>";
    }
    if (q.type === "binaire" || q.type === "choix") {
      html += '<label class="play-label" for="gauge">' + (q.type === "choix" ? "Tu y crois à combien" : "Tu dis combien") + NNBSP + "?</label>" +
        '<div class="gauge"><span class="gauge-face face" id="gauge-face"></span><output class="num" id="gauge-num" for="gauge"></output></div>' +
        '<input class="slider" id="gauge" type="range" min="0" max="100" step="1" value="50">' +
        '<p class="small muted">Glisse pour régler. L\'anneau change de tête.</p>';
    } else {
      r = range(q);
      mid = r.min + Math.round((r.max - r.min) / 2 / r.step) * r.step;
      html += '<label class="play-label" for="gauge">Ton estimation' + NNBSP + "?</label>" +
        '<div class="gauge"><span class="gauge-face face" id="gauge-face"></span><output class="num num--texte" id="gauge-num" for="gauge"></output></div>' +
        '<input class="slider" id="gauge" type="range" min="' + r.min + '" max="' + r.max + '" step="' + r.step + '" value="' + mid + '">' +
        '<p class="small muted">De ' + esc(fmt(q, r.min)) + " à " + esc(fmt(q, r.max)) + ".</p>";
    }
    return html + '<button class="btn btn--plein" type="submit">Valider et voir l\'indice</button>' +
      '<p class="small muted">Sans inscription. Ton pronostic reste dans ton navigateur.</p></form>' +
      '<div class="reveal" id="reveal" tabindex="-1" aria-live="polite" hidden></div>';
  }

  function row(label, value) { return "<div><span>" + esc(label) + "</span><span>" + esc(value) + "</span></div>"; }
  function stampFoule(on) { return '<div class="reveal-stamp">' + (on ? '<span class="stamp stamp--foule">Contre la foule</span>' : "") + "</div>"; }
  function revealBody(q, ans, friend) {
    var html = "", gap, against, msg, r, pos, top, mine;
    if (q.type === "binaire") {
      gap = Math.abs(ans.v - q.index);
      against = gap >= 15;
      msg = gap < 5 ? "Pile sur l'indice." : ans.v < q.index ? "Tu es plus prudent que la foule." : "Tu es plus confiant que la foule.";
      html += '<div class="duo">' +
        '<div><span class="face">' + face(ans.v / 100, moodFor(ans.v), "#E0458A") + '</span><span class="num moi">' + pct(ans.v) + '</span><span class="small strong moi">Toi</span></div>' +
        '<div><span class="face">' + face(q.index / 100, moodFor(q.index)) + '</span><span class="num">' + pct(q.index) + '</span><span class="small strong">L\'indice</span></div></div>' +
        stampFoule(against) +
        '<p class="strong">' + msg + (against ? " Si tu as raison, tes points comptent double." : "") + "</p>" +
        '<div class="rows">' + row("Écart avec l'indice", gap + " point" + (gap > 1 ? "s" : "")) + row("Les joueurs", pct(q.sources.joueurs)) + row("Les marchés", pct(q.sources.marches)) +
        (friend !== null ? row("Ton ami", pct(friend)) : "") + "</div>";
    } else if (q.type === "choix") {
      top = topOption(q);
      mine = q.options[ans.o];
      against = mine !== top;
      html += '<div class="bars">' + q.options.map(function (o, i) {
        return '<div class="bar' + (i === ans.o ? " is-me" : "") + '"><div class="bar-top"><span>' + esc(o.label) + (i === ans.o ? " · ton favori" : "") + "</span><span>" + pct(o.index) + "</span></div>" +
          '<div class="bar-track"><div class="bar-fill" style="width: ' + o.index + '%"></div></div></div>';
      }).join("") + "</div>" +
        stampFoule(against) +
        '<p class="strong">' + (against ? "Tu joues l'outsider. Si tu as raison, tes points comptent double." : "Tu suis le favori de l'indice.") + "</p>" +
        '<div class="rows">' + row("Ta confiance", pct(ans.v)) + row("L'indice sur ton favori", pct(mine.index)) + "</div>";
    } else {
      r = range(q);
      pos = function (v) { return (v - r.min) / (r.max - r.min) * 100; };
      against = ans.v < q.low || ans.v > q.high;
      html += '<div class="scale" role="img" aria-label="Ton estimation et la fourchette de l\'indice">' +
        '<div class="scale-range" style="left: ' + pos(q.low).toFixed(1) + "%; width: " + (pos(q.high) - pos(q.low)).toFixed(1) + '%"></div>' +
        '<div class="scale-mark scale-index" style="left: ' + pos(q.index).toFixed(1) + '%"></div>' +
        '<div class="scale-mark scale-me" style="left: ' + pos(ans.v).toFixed(1) + '%"></div></div>' +
        '<div class="scale-ends small muted"><span>' + esc(fmt(q, r.min)) + "</span><span>" + esc(fmt(q, r.max)) + "</span></div>" +
        '<div class="scale-legend small"><span><i class="lg lg-me"></i>Toi</span><span><i class="lg lg-index"></i>L\'indice</span><span><i class="lg lg-range"></i>Sa fourchette</span></div>' +
        stampFoule(against) +
        '<p class="strong">' + (against ? "Tu es hors de la fourchette. Si tu as raison, tes points comptent double." : ans.v === q.index ? "Pile sur l'indice." : "Tu es dans la fourchette de l'indice.") + "</p>" +
        '<div class="rows">' + row("Ton estimation", fmt(q, ans.v)) + row("L'indice", fmt(q, q.index)) + row("Sa fourchette, 8 chances sur 10", "de " + fmt(q, q.low) + " à " + fmt(q, q.high)) + "</div>";
    }
    return html + '<p class="small">' + esc(q.verdictLabel) + ". " + esc(q.rule) + "</p>" +
      '<button class="btn btn--plein" type="button" id="share">Défier un ami</button>' +
      '<p class="small muted share-status" id="share-status" role="status"></p>' +
      '<button class="link-btn small" type="button" id="replay">Rejouer (démo)</button>';
  }

  function initPlay() {
    var root = $("play");
    if (!root) { return; }
    var isToday = root.dataset.question === "today";
    var q = findQuestion(isToday ? ND.todayId : param("id"));
    if (!q) {
      $("q-text").textContent = "Cette question n'existe pas.";
      root.innerHTML = '<p>Retourne aux <a href="questions.html">questions ouvertes</a>.</p>';
      return;
    }
    var t = q.tournament ? findTournament(q.tournament) : null;
    if (!isToday) { document.title = q.text + " — NostraData"; }
    $("hero").className = "hero t-" + q.theme;
    $("q-text").textContent = typo(q.text);
    $("q-pills").innerHTML = '<span class="pill">' + (isToday ? "Question du jour" : TYPES[q.type]) + "</span>" +
      '<span class="pill pill--blanc">' + esc(q.themeLabel) + "</span>" +
      (t ? '<a class="pill pill--contour" href="tournoi.html?id=' + t.id + '">Tournoi · ' + esc(t.name) + "</a>" : "");
    $("q-verdict").textContent = q.verdictLabel;
    $("q-players").textContent = count(q.players) + " joueurs ont répondu";

    // Défi reçu d'un ami (questions oui ou non) : ?defi=40
    var friend = parseInt(param("defi"), 10);
    if (q.type !== "binaire" || !(friend >= 0 && friend <= 100)) { friend = null; }
    if (friend !== null) {
      $("defi-banner").textContent = "Un ami dit " + pct(friend) + ". Et toi" + NNBSP + "?";
      $("defi-banner").hidden = false;
    }

    root.innerHTML = playForm(q);
    var slider = $("gauge"), faceEl = $("gauge-face"), numEl = $("gauge-num"), form = $("play-form"), reveal = $("reveal");
    var r = range(q);

    function draw() {
      var v = parseFloat(slider.value);
      if (q.type === "binaire" || q.type === "choix") {
        faceEl.innerHTML = face(v / 100, moodFor(v));
        numEl.textContent = pct(v);
        slider.style.setProperty("--val", v + "%");
        slider.setAttribute("aria-valuetext", v + " pour cent");
      } else {
        faceEl.innerHTML = face((v - r.min) / (r.max - r.min), "confiant");
        numEl.textContent = fmt(q, v);
        slider.style.setProperty("--val", ((v - r.min) / (r.max - r.min) * 100) + "%");
        slider.setAttribute("aria-valuetext", fmt(q, v));
      }
    }
    slider.addEventListener("input", draw);
    draw();

    function show(ans) {
      reveal.innerHTML = revealBody(q, ans, friend);
      form.hidden = true;
      reveal.hidden = false;
      $("replay").addEventListener("click", function () {
        var data = readStore();
        if (data.answers) { delete data.answers[q.id]; writeStore(data); }
        reveal.hidden = true;
        form.hidden = false;
        slider.focus();
      });
      $("share").addEventListener("click", function () {
        var said = q.type === "binaire" ? pct(ans.v) : q.type === "choix" ? q.options[ans.o].label : fmt(q, ans.v);
        var link = new URL("question.html", window.location.href);
        link.searchParams.set("id", q.id);
        if (q.type === "binaire") { link.searchParams.set("defi", ans.v); }
        var url = link.toString();
        var text = "Moi, je dis " + said + ". Et toi" + NNBSP + "? " + q.text;
        var status = $("share-status");
        if (navigator.share) {
          navigator.share({ title: "NostraData", text: text, url: url }).catch(function () { /* partage annulé */ });
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text + " " + url).then(
            function () { status.textContent = "Lien du défi copié."; },
            function () { status.textContent = "Lien du défi : " + url; }
          );
        } else {
          status.textContent = "Lien du défi : " + url;
        }
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ans = { v: parseFloat(slider.value) };
      if (q.type === "choix") { ans.o = parseInt(form.elements.opt.value, 10); }
      var data = readStore();
      data.answers = data.answers || {};
      data.answers[q.id] = ans;
      writeStore(data);
      show(ans);
      showStreak();
      reveal.focus();
    });

    var saved = (readStore().answers || {})[q.id];
    if (typeof saved === "number") { saved = { v: saved }; }   // ancien format
    if (saved && (q.type !== "choix" || q.options[saved.o])) {
      slider.value = saved.v;
      draw();
      show(saved);
    }

    var rule = $("q-rule");
    if (rule) { rule.textContent = q.rule; }
    var others = $("q-others");
    if (others) {
      others.innerHTML = ND.questions.filter(function (o) { return o.id !== q.id && ((q.tournament && o.tournament === q.tournament) || o.theme === q.theme); })
        .concat(ND.questions.filter(function (o) { return o.id !== q.id && o.theme !== q.theme && !(q.tournament && o.tournament === q.tournament); }))
        .slice(0, 3).map(questionCard).join("");
    }
  }

  // ---------- Cartes de question ----------
  function questionCard(q) {
    var played = (readStore().answers || {})[q.id] !== undefined;
    var frac = q.type === "binaire" ? q.index / 100 : q.type === "choix" ? topOption(q).index / 100 : 0.62;
    return '<a class="qcard t-' + q.theme + '" href="question.html?id=' + q.id + '">' +
      '<div class="qcard-top"><span class="pill pill--inverse">' + esc(q.themeLabel) + '</span><span class="small strong">' + TYPES[q.type] + "</span></div>" +
      '<h3 class="q">' + esc(typo(q.text)) + "</h3>" +
      '<div class="spacer"></div>' +
      '<div class="qcard-index"><span class="face">' + face(frac, q.type === "binaire" ? moodFor(q.index) : "confiant") + '</span><span class="num' + (q.type === "binaire" ? "" : " num--texte") + '">' + esc(summary(q)) + "</span></div>" +
      '<div class="qcard-foot small"><span>' + esc(q.verdictLabel) + '</span><span class="strong">' + (played ? "Déjà joué" : "Jouer") + "</span></div></a>";
  }
  function initQuestions() {
    document.querySelectorAll("[data-questions]").forEach(function (el) {
      var items = ND.questions.filter(function (q) { return q.id !== ND.todayId; });
      // Un aperçu varié : une question de chaque type d'abord.
      var seen = {}, varied = items.filter(function (q) { if (seen[q.type]) { return false; } seen[q.type] = true; return true; });
      el.innerHTML = varied.concat(items.filter(function (q) { return varied.indexOf(q) < 0; })).slice(0, parseInt(el.dataset.limit, 10) || 4).map(questionCard).join("");
    });
    var list = $("questions-list"), filters = $("type-filters");
    if (!list) { return; }
    var theme = param("theme"), type = "tous";
    var themeLabel = (THEMES.filter(function (t) { return t[0] === theme; })[0] || [])[1];
    if (themeLabel) {
      $("questions-title").textContent = "Questions · " + themeLabel;
      $("questions-reset").hidden = false;
    } else { theme = null; }
    function render() {
      var items = ND.questions.filter(function (q) { return (!theme || q.theme === theme) && (type === "tous" || q.type === type); });
      list.innerHTML = items.length ? items.map(questionCard).join("") : '<p class="muted">Aucune question ouverte ici pour le moment.</p>';
      filters.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.type === type)); });
    }
    filters.innerHTML = [["tous", "Tous les types"]].concat(Object.keys(TYPES).map(function (k) { return [k, TYPES[k]]; })).map(function (t) {
      return '<button type="button" class="filter" data-type="' + t[0] + '">' + t[1] + "</button>";
    }).join("");
    filters.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (b) { type = b.dataset.type; render(); }
    });
    render();
  }

  // ---------- Tournois ----------
  function tournamentQuestions(t) { return ND.questions.filter(function (q) { return q.tournament === t.id; }); }
  function tournamentCard(t) {
    var open = tournamentQuestions(t).length;
    var joined = (readStore().tournaments || []).indexOf(t.id) >= 0;
    return '<a class="tcard t-' + t.theme + (t.status === "a-venir" ? " tcard--avenir" : "") + '" href="tournoi.html?id=' + t.id + '">' +
      '<div class="qcard-top"><span class="pill pill--inverse">' + esc(t.statusLabel) + "</span>" + (joined ? '<span class="small strong">Tu participes</span>' : "") + "</div>" +
      "<h3>" + esc(t.name) + "</h3><p>" + esc(t.description) + "</p>" +
      '<div class="spacer"></div>' +
      '<div class="tcard-meta small"><span><span class="strong">' + open + "</span> sur " + t.total + " questions ouvertes</span>" +
      (t.players ? '<span><span class="strong">' + count(t.players) + "</span> joueurs</span>" : "") + "</div>" +
      '<div class="qcard-foot small"><span>' + esc(t.ends) + '</span><span class="strong">Voir</span></div></a>';
  }
  function initTournaments() {
    document.querySelectorAll("[data-tournaments]").forEach(function (el) {
      el.innerHTML = ND.tournaments.slice(0, parseInt(el.dataset.limit, 10) || ND.tournaments.length).map(tournamentCard).join("");
    });
    var page = $("tournament");
    if (!page) { return; }
    var t = findTournament(param("id"));
    if (!t) {
      $("t-name").textContent = "Ce tournoi n'existe pas.";
      return;
    }
    var qs = tournamentQuestions(t);
    document.title = t.name + " — Tournoi NostraData";
    $("hero").className = "hero t-" + t.theme;
    $("t-status").textContent = t.statusLabel;
    $("t-name").textContent = t.name;
    $("t-desc").textContent = t.description;
    $("t-meta").innerHTML = '<span class="strong">' + esc(t.ends) + "</span>" + (t.players ? "<span>" + count(t.players) + " joueurs</span>" : "");
    $("t-reward").textContent = t.reward;
    $("t-progress").innerHTML = Array.apply(null, Array(t.total)).map(function (_, i) { return '<span class="' + (i < qs.length ? "is-open" : "") + '"></span>'; }).join("");
    $("t-progress-label").textContent = qs.length + " question" + (qs.length > 1 ? "s" : "") + " ouverte" + (qs.length > 1 ? "s" : "") + " sur " + t.total;
    $("t-questions").innerHTML = qs.length ? qs.map(questionCard).join("") : '<p class="muted">Les questions arrivent à l\'ouverture du tournoi.</p>';

    var join = $("t-join"), note = $("t-join-note");
    function drawBoard(me) {
      var list = $("t-board");
      if (!t.leaderboard.length) { list.innerHTML = '<li><span class="who"><span class="title">Le classement s\'ouvrira avec le tournoi.</span></span></li>'; return; }
      list.innerHTML = t.leaderboard.map(function (r) { return rankRow(r, false); }).join("") +
        (me ? rankRow({ rank: "–", name: me.pseudo, title: "Tu viens d'arriver · réponds aux questions", score: "–" }, true) : "");
    }
    function drawJoin() {
      var u = user(), joined = (readStore().tournaments || []).indexOf(t.id) >= 0;
      if (!u) {
        join.textContent = "Se connecter pour participer";
        join.href = "connexion.html?retour=" + encodeURIComponent("tournoi.html?id=" + t.id);
        note.textContent = "Le classement d'un tournoi demande un compte.";
      } else {
        join.textContent = joined ? "Tu participes · quitter" : "Rejoindre le tournoi";
        join.href = "#";
        note.textContent = joined ? "Tes réponses aux questions du tournoi comptent pour son classement." : "Gratuit et sans mise.";
      }
      drawBoard(joined ? u : null);
    }
    join.addEventListener("click", function (ev) {
      if (!user()) { return; }
      ev.preventDefault();
      var data = readStore(), list = data.tournaments || [], i = list.indexOf(t.id);
      if (i >= 0) { list.splice(i, 1); } else { list.push(t.id); }
      data.tournaments = list;
      writeStore(data);
      drawJoin();
    });
    drawJoin();
  }

  // ---------- Verdicts ----------
  function sawRight(v) { return (v.said >= 50) === (v.result === "Oui"); }
  function verdictCard(v) {
    var ok = sawRight(v);
    return '<article class="card t-' + v.theme + '">' +
      '<div><span class="pill pill--theme">' + esc(v.themeLabel) + "</span></div>" +
      '<h3 class="q">' + esc(typo(v.text)) + "</h3>" +
      '<div class="spacer"></div>' +
      '<div><span class="stamp ' + (ok ? "stamp--juste" : "stamp--rate") + '">' + (ok ? "Vu juste" : "Raté, assumé") + "</span></div>" +
      '<div class="result"><span class="face">' + face(1, ok ? "sur" : "surpris") + '</span><span class="num">' + esc(v.result) + "</span></div>" +
      '<div class="said"><span class="strong">On avait dit ' + pct(v.said) + '</span><span class="muted">Verdict du ' + esc(v.date) + "</span></div>" +
      "</article>";
  }
  function calibCard() {
    var dots = (ND.calibration || []).map(function (p) {
      return '<circle cx="' + (20 + p.said * 2) + '" cy="' + (220 - p.happened * 2) + '" r="8" fill="#FFFFFF"/>';
    }).join("");
    return '<aside class="calib"><div class="kicker">Notre carnet de notes</div>' +
      "<h3>Quand on dit 70" + NNBSP + "%, ça arrive 7 fois sur 10.</h3>" +
      '<svg viewBox="0 0 240 240" role="img" aria-label="Les probabilités annoncées suivent de près ce qui est arrivé">' +
      '<path d="M20 20 V220 H220" stroke="#D9E0FF" stroke-width="2" fill="none"/>' +
      '<path d="M20 220 L220 20" stroke="#D9E0FF" stroke-width="2" stroke-dasharray="5 7" fill="none"/>' + dots + "</svg>" +
      "<p>" + (ND.resolvedCount || 0) + " questions tranchées, ratés compris.</p></aside>";
  }
  function initVerdicts() {
    var preview = $("verdicts-preview");
    if (preview) {
      preview.innerHTML = ND.verdicts.slice(0, 3).map(verdictCard).join("") + calibCard();
    }
    var list = $("verdicts-list"), filters = $("verdicts-filters");
    if (!list) { return; }
    var themes = [{ id: "tous", label: "Tous" }];
    ND.verdicts.forEach(function (v) {
      if (!themes.some(function (t) { return t.id === v.theme; })) { themes.push({ id: v.theme, label: v.themeLabel }); }
    });
    function render(theme) {
      var items = ND.verdicts.filter(function (v) { return theme === "tous" || v.theme === theme; });
      list.innerHTML = items.map(verdictCard).join("");
      filters.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === theme)); });
    }
    filters.innerHTML = themes.map(function (t) {
      return '<button type="button" class="filter" data-theme="' + t.id + '">' + esc(t.label) + "</button>";
    }).join("");
    filters.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (b) { render(b.dataset.theme); }
    });
    var right = ND.verdicts.filter(sawRight).length;
    $("verdicts-summary").textContent = right + " vus juste sur " + ND.verdicts.length + " derniers verdicts.";
    $("verdicts-calib").innerHTML = calibCard();
    render("tous");
  }

  // ---------- Classement ----------
  function podium(rows) {
    function spot(r, cls) {
      return '<div class="' + cls + '"><span class="face">' + face(r.score / 100, r.rank === 1 ? "sur" : "confiant") + '</span><span class="name">' + esc(r.name) + "</span>" +
        '<div class="plinth"><span class="num">' + r.rank + "</span><span>" + r.score + "</span></div></div>";
    }
    return spot(rows[1], "p2") + spot(rows[0], "p1") + spot(rows[2], "p3");
  }
  function rankRow(r, me) {
    return "<li" + (me ? ' class="me"' : "") + '><span class="rank">' + esc(r.rank) + '</span><span class="who"><span class="name">' + esc(r.name) +
      '</span><br><span class="title">' + esc(r.title) + '</span></span><span class="score">' + esc(r.score) + "</span></li>";
  }
  function initBoard() {
    var pod = $("podium"), list = $("rank-list");
    if (!pod || !list) { return; }
    var rows = ND.leaderboard, limit = parseInt(list.dataset.limit, 10) || rows.length, u = user();
    pod.innerHTML = podium(rows);
    var played = Object.keys(readStore().answers || {}).length;
    var me = { rank: "–", name: u ? u.pseudo : "Toi", score: "–",
      title: played ? "Non classé · encore " + ND.minResolved + " questions tranchées" : "Réponds à la question du jour pour commencer" };
    list.innerHTML = rows.slice(3, Math.max(4, limit)).map(function (r) { return rankRow(r, false); }).join("") + rankRow(me, true);
  }

  // ---------- Connexion (démo : rien n'est envoyé, le mot de passe n'est ni vérifié ni gardé) ----------
  function safeReturn() {
    var back = param("retour") || "";
    return /^[a-z-]+\.html(\?[\w=&-]*)?$/.test(back) ? back : "index.html";
  }
  function initAuth() {
    var form = $("auth-form");
    if (!form) { return; }
    var mode = "connexion", tabs = document.querySelectorAll("[data-auth-tab]"), pseudoField = $("field-pseudo"), pseudo = $("pseudo");
    var u = user();
    function setMode(m) {
      mode = m;
      tabs.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.authTab === m)); });
      pseudoField.hidden = m !== "inscription";
      pseudo.required = m === "inscription";
      $("auth-title").textContent = m === "inscription" ? "Créer un compte" : "Connexion";
      $("auth-submit").textContent = m === "inscription" ? "Créer mon compte" : "Me connecter";
      $("password").autocomplete = m === "inscription" ? "new-password" : "current-password";
    }
    tabs.forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.authTab); }); });
    setMode(param("mode") === "inscription" ? "inscription" : "connexion");

    if (u) {
      $("auth-panel").hidden = true;
      $("auth-account").hidden = false;
      $("account-pseudo").textContent = u.pseudo;
      var n = Object.keys(readStore().answers || {}).length;
      $("account-count").textContent = n + " réponse" + (n > 1 ? "s" : "") + " enregistrée" + (n > 1 ? "s" : "") + " dans ce navigateur.";
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = mode === "inscription" ? pseudo.value.trim() : $("email").value.trim().split("@")[0];
      name = name.replace(/[^\wÀ-ÿ.-]/g, "").slice(0, 20) || "Joueur";
      var data = readStore();
      data.user = { pseudo: name };          // on ne garde que le pseudonyme : ni e-mail, ni mot de passe
      writeStore(data);
      window.location.href = safeReturn();
    });
    $("logout").addEventListener("click", function () {
      var data = readStore();
      delete data.user;
      writeStore(data);
      window.location.href = "connexion.html";
    });
  }

  // ---------- Espace pro ----------
  function initPro() {
    var b = $("pro-contact");
    if (!b) { return; }
    if (ND.contactEmail) {
      b.href = "mailto:" + ND.contactEmail + "?subject=" + encodeURIComponent("Démo NostraData");
    } else {
      b.textContent = "Démo bientôt disponible";
      b.setAttribute("aria-disabled", "true");
      b.removeAttribute("href");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillFaces();
    initHeader();
    initPlay();
    initQuestions();
    initTournaments();
    initVerdicts();
    initBoard();
    initAuth();
    initPro();
  });
})();
