/* NostraData — l'outil d'analyse : courbe d'une question, voix, répartition, arguments, suivi,
   export, widget, vue tableau, test de calibration, proposition de question.
   Démo : les courbes, les répartitions et les voix « Cercle » et « IA » sont dérivées des données
   par un calcul fixe (toujours le même résultat pour une même question). Rien n'est envoyé à un serveur. */
(function () {
  "use strict";
  var A = window.NDApp, ND = window.ND || {};
  if (!A) { return; }
  var $ = A.$, esc = A.esc, pct = A.pct, NNBSP = A.NNBSP, DAY = 86400000, DAYS = 60;

  // ---------- Séries (démo) ----------
  function isPct(q) { return q.type === "binaire" || q.type === "choix"; }
  function bounds(q) { var r = A.range(q); return isPct(q) ? { min: 0, max: 100 } : { min: r.min, max: r.max }; }
  function endValue(q) { return q.type === "choix" ? A.topOption(q).index : q.index; }
  function series(q) {
    var b = bounds(q), span = b.max - b.min, end = endValue(q), out = [], v = end, i, step;
    var drift = ((A.hash(q.id) % 21) - 10) / 10 * span * 0.004;
    out[DAYS - 1] = end;
    for (i = DAYS - 2; i >= 0; i--) {
      step = ((A.hash(q.id + ":" + i) % 13) - 6) / 6 * span * 0.018 + drift;
      v = A.clamp(v - step, b.min + span * 0.03, b.max - span * 0.03);
      out[i] = v;
    }
    return out;
  }
  function change7(q) { var s = series(q); return s[DAYS - 1] - s[DAYS - 8]; }
  function changeLabel(q) {
    var d = change7(q), sign = d > 0 ? "+" : d < 0 ? "−" : "";
    if (isPct(q)) { d = Math.round(d); return d === 0 ? "stable" : sign + Math.abs(d) + " pt" + (Math.abs(d) > 1 ? "s" : ""); }
    if (q.type === "date") { return Math.abs(d) < 0.25 ? "stable" : d > 0 ? "plus tard" : "plus tôt"; }
    d = Math.round(d / q.step) * q.step;
    return d === 0 ? "stable" : sign + Math.abs(d).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + (q.unit === "%" ? " pt" : " " + (q.unit || ""));
  }
  function label(q, v) {
    if (isPct(q)) { return pct(Math.round(v)); }
    if (q.type === "date") { return q.scale[A.clamp(Math.round(v), 0, q.scale.length - 1)]; }
    return A.fmt(q, Math.round(v / q.step) * q.step);
  }
  function voices(q) {   // les quatre voix d'une question oui ou non
    var cercle = A.clamp(Math.round((q.sources.joueurs + q.sources.marches) / 2) + (A.hash(q.id + "cercle") % 9) - 4, 1, 99);
    var ia = A.clamp(q.index + (A.hash(q.id + "ia") % 11) - 5, 1, 99);
    return [["Les marchés", q.sources.marches], ["Les joueurs", q.sources.joueurs], ["Le Cercle", cercle], ["L'IA", ia]];
  }
  function dayLabel(daysAgo) {
    if (daysAgo === 0) { return "Aujourd'hui"; }
    return new Date(Date.now() - daysAgo * DAY).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  // ---------- Courbe ----------
  function chart(q, days, answer) {
    var all = series(q), s = all.slice(-days), n = s.length, b = bounds(q), span = b.max - b.min;
    var band = !isPct(q), lo = band ? q.index - q.low : 0, hi = band ? q.high - q.index : 0;
    var min = Math.min.apply(null, s) - lo, max = Math.max.apply(null, s) + hi, pad = Math.max((max - min) * 0.25, span * 0.04);
    var y0 = Math.max(b.min, min - pad), y1 = Math.min(b.max, max + pad), W = 600, H = 220;
    function x(i) { return i / (n - 1) * W; }
    function y(v) { return H - (v - y0) / (y1 - y0) * H; }
    var line = s.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
    var area = "";
    if (band) {
      area = '<path d="' + s.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(Math.min(b.max, v + hi)).toFixed(1); }).join(" ") + " " +
        s.slice().reverse().map(function (v, i) { return "L" + x(n - 1 - i).toFixed(1) + " " + y(Math.max(b.min, v - lo)).toFixed(1); }).join(" ") + ' Z" fill="#EEE8FF" stroke="none"/>';
    }
    var marks = "";
    if (answer && answer.h && q.type !== "choix") {
      answer.h.forEach(function (h) {
        var ago = Math.floor((Date.now() - h.t) / DAY), i = n - 1 - ago;
        if (i < 0 || h.v < y0 || h.v > y1) { return; }
        marks += '<span class="chart-mark" style="left: ' + (x(i) / W * 100).toFixed(1) + "%; top: " + (y(h.v) / H * 100).toFixed(1) + '%"></span>';
      });
    }
    return '<div class="chart"><div class="chart-y"><span>' + esc(label(q, y1)) + "</span><span>" + esc(label(q, (y0 + y1) / 2)) + "</span><span>" + esc(label(q, y0)) + "</span></div>" +
      '<div class="chart-plot"><svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img" aria-label="Évolution de l\'indice sur ' + days + ' jours">' +
      '<path d="M0 ' + (H / 2) + " H" + W + '" stroke="#E4E4E2" stroke-width="1" stroke-dasharray="4 6" vector-effect="non-scaling-stroke" fill="none"/>' + area +
      '<path d="' + line + '" stroke="#0B0B0B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" fill="none"/></svg>' +
      '<span class="chart-end" style="top: ' + (y(s[n - 1]) / H * 100).toFixed(1) + '%"></span>' + marks + "</div></div>" +
      '<div class="chart-x"><span>' + dayLabel(days - 1) + "</span><span>" + dayLabel(Math.round((days - 1) / 2)) + "</span><span>Aujourd'hui</span></div>" +
      '<div class="chart-legend small"><span><i class="lg lg-line"></i>' + (q.type === "choix" ? "Favori de l'indice : " + esc(A.topOption(q).label) : "Indice NostraData") + "</span>" +
      (band ? '<span><i class="lg lg-range"></i>Fourchette</span>' : "") + (marks ? '<span><i class="lg lg-me"></i>Tes pronostics</span>' : "") + "</div>";
  }

  // ---------- Répartition des pronostics (démo) ----------
  function distribution(q, answer) {
    var b = bounds(q), n = 10, mu, sd, bars = [], max = 0, i, c, w, mine = -1;
    if (q.type === "choix") { return ""; }
    mu = q.type === "binaire" ? q.sources.joueurs : q.index;
    sd = q.type === "binaire" ? 17 : Math.max((q.high - q.low) / 2.2, (b.max - b.min) / 14);
    for (i = 0; i < n; i++) {
      c = b.min + (i + 0.5) * (b.max - b.min) / n;
      w = Math.exp(-Math.pow(c - mu, 2) / (2 * sd * sd)) + (A.hash(q.id + "d" + i) % 10) / 90;
      bars.push(w); max = Math.max(max, w);
    }
    if (answer) { mine = A.clamp(Math.floor((answer.v - b.min) / (b.max - b.min) * n), 0, n - 1); }
    return '<h2 class="h3">Répartition des pronostics</h2><div class="histo" role="img" aria-label="Répartition des pronostics des joueurs">' +
      bars.map(function (v, k) { return '<span class="' + (k === mine ? "is-me" : "") + '" style="height: ' + Math.max(6, Math.round(v / max * 100)) + '%"></span>'; }).join("") + "</div>" +
      '<div class="chart-x"><span>' + esc(label(q, b.min)) + "</span><span>" + esc(label(q, b.max)) + "</span></div>" +
      '<p class="small muted">' + A.count(q.players) + " joueurs" + (mine >= 0 ? " · ta réponse est dans la barre rose" : "") + ".</p>";
  }

  // ---------- Les voix ----------
  function sources(q) {
    var html = '<h2 class="h3">' + (q.type === "binaire" ? "Ce que disent les voix" : "L'indice en détail") + "</h2>";
    if (q.type === "binaire") {
      html += '<div class="voices">' + voices(q).map(function (v) {
        return '<div class="voice"><div class="bar-top"><span>' + v[0] + "</span><span>" + pct(v[1]) + '</span></div><div class="bar-track"><div class="bar-fill" style="width: ' + v[1] + '%"></div></div></div>';
      }).join("") + '<div class="voice voice--index"><div class="bar-top"><span>Indice NostraData</span><span>' + pct(q.index) + '</span></div><div class="bar-track"><div class="bar-fill" style="width: ' + q.index + '%"></div></div></div></div>' +
        '<p class="small muted">L\'indice pondère chaque voix par sa fiabilité passée. <a href="methode.html">Voir la méthode</a></p>';
    } else if (q.type === "choix") {
      html += '<div class="rows">' + q.options.map(function (o) { return A.row(o.label, pct(o.index)); }).join("") + '</div><p class="small muted">Probabilité de chaque réponse selon l\'indice. <a href="methode.html">Voir la méthode</a></p>';
    } else {
      html += '<div class="rows">' + A.row("Borne basse", A.fmt(q, q.low)) + A.row("Indice (médiane)", A.fmt(q, q.index)) + A.row("Borne haute", A.fmt(q, q.high)) + "</div>" +
        '<p class="small muted">La fourchette contient la réponse 8 fois sur 10. <a href="methode.html">Voir la méthode</a></p>';
    }
    return html;
  }

  // ---------- Suivi et alertes ----------
  var ALERTS = [["verdict", "Le verdict tombe"], ["move", "L'indice bouge de 5 points ou plus"], ["close", "La question ferme bientôt"]];
  function renderFollow(q) {
    var el = $("x-follow"), f = (A.readStore().follows || {})[q.id];
    el.innerHTML = '<h2 class="h3">Suivre cette question</h2>' +
      '<button class="btn ' + (f ? "btn--contour " : "") + 'btn--plein" type="button" id="x-follow-btn" aria-pressed="' + (f ? "true" : "false") + '">' + (f ? "Question suivie · ne plus suivre" : "Suivre") + "</button>" +
      (f ? '<div class="checks">' + ALERTS.map(function (a) {
        return '<label class="check"><input type="checkbox" data-alert="' + a[0] + '"' + (f[a[0]] ? " checked" : "") + "><span>" + a[1] + "</span></label>";
      }).join("") + '</div><p class="small muted">Tes questions suivies sont sur ton profil. L\'envoi des alertes ouvrira avec les comptes.</p>' : "");
    $("x-follow-btn").addEventListener("click", function () {
      var data = A.readStore();
      data.follows = data.follows || {};
      if (data.follows[q.id]) { delete data.follows[q.id]; } else { data.follows[q.id] = { verdict: true, move: true, close: false }; }
      A.writeStore(data);
      renderFollow(q);
    });
    el.querySelectorAll("[data-alert]").forEach(function (box) {
      box.addEventListener("change", function () {
        var data = A.readStore();
        data.follows[q.id][box.dataset.alert] = box.checked;
        A.writeStore(data);
      });
    });
  }

  // ---------- Arguments ----------
  function argsOf(q) {
    var base = (ND.args || {})[q.id] || [
      { by: "LeVate", side: "haut", votes: 12 + A.hash(q.id + "a") % 20, text: "Les précédents comparables vont plutôt dans ce sens. Je me place un peu au-dessus de l'indice." },
      { by: "Tirésias", side: "bas", votes: 6 + A.hash(q.id + "b") % 14, text: "L'indice a beaucoup bougé sur peu d'informations nouvelles. Je reste en dessous en attendant mieux." }
    ];
    var store = A.readStore(), mine = (store.args || {})[q.id] || [], votes = store.votes || {}, u = A.user();
    return base.map(function (a, i) { return { id: q.id + ":" + i, by: a.by, side: a.side, text: a.text, votes: a.votes + (votes[q.id + ":" + i] ? 1 : 0), voted: !!votes[q.id + ":" + i], link: true }; })
      .concat(mine.map(function (a, i) { return { id: q.id + ":me" + i, by: u ? u.pseudo : "Toi", side: a.side, text: a.text, votes: 0, mine: true }; }))
      .sort(function (a, b) { return b.votes - a.votes; });
  }
  function renderArgs(q) {
    var el = $("x-args"), list = argsOf(q);
    el.innerHTML = '<div class="args">' + list.map(function (a, i) {
      return '<article class="arg"><div class="arg-head"><span class="strong">' + (a.link ? '<a href="' + A.profileLink(a.by) + '">' + esc(a.by) + "</a>" : esc(a.by)) + "</span>" +
        '<span class="pill pill--gris">' + (a.side === "haut" ? "Au-dessus de l'indice" : "En dessous de l'indice") + "</span>" +
        (i === 0 && !a.mine ? '<span class="pill">Meilleur argument</span>' : "") + "</div><p>" + esc(a.text) + "</p>" +
        (a.mine ? '<p class="small muted">Enregistré dans ce navigateur. La publication ouvrira avec les comptes.</p>'
          : '<button class="filter" type="button" data-vote="' + a.id + '" aria-pressed="' + (a.voted ? "true" : "false") + '">Convaincant · ' + a.votes + "</button>") + "</article>";
    }).join("") + "</div>" +
      '<form class="fields" id="x-arg-form"><div class="field"><label for="x-arg-text">Ton raisonnement</label>' +
      '<textarea id="x-arg-text" rows="3" maxlength="400" required placeholder="En deux ou trois phrases : pourquoi es-tu au-dessus ou en dessous de l\'indice ?"></textarea></div>' +
      '<div class="arg-actions"><label class="check"><input type="radio" name="side" value="haut" checked><span>Au-dessus de l\'indice</span></label>' +
      '<label class="check"><input type="radio" name="side" value="bas"><span>En dessous</span></label>' +
      '<button class="btn" type="submit">Ajouter mon argument</button></div></form>';
    el.querySelectorAll("[data-vote]").forEach(function (b) {
      b.addEventListener("click", function () {
        var data = A.readStore();
        data.votes = data.votes || {};
        if (data.votes[b.dataset.vote]) { delete data.votes[b.dataset.vote]; } else { data.votes[b.dataset.vote] = true; }
        A.writeStore(data);
        renderArgs(q);
      });
    });
    $("x-arg-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var text = $("x-arg-text").value.trim(), data = A.readStore();
      if (!text) { return; }
      data.args = data.args || {};
      data.args[q.id] = (data.args[q.id] || []).concat([{ text: text.slice(0, 400), side: ev.target.elements.side.value, t: Date.now() }]);
      A.writeStore(data);
      renderArgs(q);
    });
  }

  // ---------- Export et widget ----------
  function csv(q) {
    var s = series(q), band = !isPct(q), lines = ["date;indice" + (band ? ";borne_basse;borne_haute" : "")];
    s.forEach(function (v, i) {
      var d = new Date(Date.now() - (DAYS - 1 - i) * DAY).toISOString().slice(0, 10);
      function num(x) { return (isPct(q) || q.type === "date" ? Math.round(x * 10) / 10 : Math.round(x / q.step) * q.step).toString().replace(".", ","); }
      lines.push(d + ";" + num(v) + (band ? ";" + num(v - (q.index - q.low)) + ";" + num(v + (q.high - q.index)) : ""));
    });
    return lines.join("\n");
  }
  function renderTools(q) {
    var el = $("x-tools"), src = new URL("widget.html?id=" + q.id, window.location.href).toString();
    var code = '<iframe src="' + src + '" width="360" height="330" style="border:0" title="' + q.text.replace(/"/g, "&quot;") + '"></iframe>';
    el.innerHTML = '<h2 class="h3">Données et intégration</h2>' +
      '<button class="btn btn--contour btn--plein" type="button" id="x-csv">Télécharger la courbe (CSV)</button>' +
      '<div class="field"><label for="x-embed">Code du widget, à coller dans un article</label><textarea id="x-embed" rows="4" readonly>' + esc(code) + "</textarea></div>" +
      '<button class="btn btn--contour btn--plein" type="button" id="x-copy">Copier le code</button><p class="small muted" id="x-copy-status" role="status"></p>';
    $("x-csv").addEventListener("click", function () {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["﻿" + csv(q)], { type: "text/csv;charset=utf-8" }));
      a.download = "nostradata-" + q.id + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    $("x-copy").addEventListener("click", function () {
      var status = $("x-copy-status");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () { status.textContent = "Code copié."; }, function () { $("x-embed").select(); status.textContent = "Sélectionné : copie-le à la main."; });
      } else { $("x-embed").select(); status.textContent = "Sélectionné : copie-le à la main."; }
    });
  }

  // ---------- Page question : panneau d'analyse ----------
  var current = null, days = 30;
  function myAnswer(q) { var a = (A.readStore().answers || {})[q.id]; return a && typeof a === "object" ? a : null; }
  function renderChart() {
    $("x-chart").innerHTML = chart(current, days, myAnswer(current));
    $("x-range").querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(parseInt(b.dataset.days, 10) === days)); });
    $("x-dist").innerHTML = distribution(current, myAnswer(current));
    $("x-dist").hidden = current.type === "choix";
  }
  function tile(lbl, value, sub) { return '<div class="tile"><p class="kicker">' + esc(lbl) + '</p><p class="num">' + esc(value) + '</p><p class="small muted">' + esc(sub) + "</p></div>"; }
  document.addEventListener("nd:question", function (ev) {
    var q = ev.detail.q, full = $("q-full");
    if (full && ev.detail.today) { full.href = "question.html?id=" + q.id; full.hidden = false; }
    if (!$("x-chart")) { return; }
    current = q;
    $("x-stats").innerHTML = tile("Indice", A.summary(q), A.TYPES[q.type]) + tile("Sur 7 jours", changeLabel(q), "variation de l'indice") +
      tile("Prévisionnistes", A.count(q.players), "ont répondu") + tile("Verdict", q.verdictLabel.replace(/^Verdict\s+/, "").replace(/^./, function (c) { return c.toUpperCase(); }), "règle écrite à l'avance");
    $("x-range").innerHTML = [[7, "7 jours"], [30, "30 jours"], [60, "60 jours"]].map(function (r) { return '<button type="button" class="filter" data-days="' + r[0] + '">' + r[1] + "</button>"; }).join("");
    $("x-range").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { days = parseInt(b.dataset.days, 10); renderChart(); } });
    $("x-sources").innerHTML = sources(q);
    renderChart(); renderFollow(q); renderArgs(q); renderTools(q);
  });
  document.addEventListener("nd:answer", function () { if (current && $("x-chart")) { renderChart(); } });

  // ---------- Questions : vue tableau, recherche, tri ----------
  function initTable() {
    var wrap = $("questions-table");
    if (!wrap) { return; }
    var theme = A.param("theme"), view = "cartes", sort = "suivies", search = $("q-search");
    function draw() {
      var term = search.value.trim().toLowerCase();
      var items = ND.questions.filter(function (q) { return (!theme || q.theme === theme) && (!term || q.text.toLowerCase().indexOf(term) >= 0); });
      items.sort(function (a, b) {
        if (sort === "bouge") { return Math.abs(change7(b)) / (bounds(b).max - bounds(b).min) - Math.abs(change7(a)) / (bounds(a).max - bounds(a).min); }
        if (sort === "theme") { return a.themeLabel.localeCompare(b.themeLabel); }
        return b.players - a.players;
      });
      wrap.innerHTML = '<table class="qtable"><thead><tr><th scope="col">Question</th><th scope="col">Indice</th><th scope="col">7 jours</th><th scope="col" class="col-wide">Type</th><th scope="col" class="col-wide">Prévisionnistes</th></tr></thead><tbody>' +
        (items.length ? items.map(function (q) {
          return '<tr class="t-' + q.theme + '"><td><a href="question.html?id=' + q.id + '">' + esc(A.typo(q.text)) + '</a><br><span class="pill pill--theme">' + esc(q.themeLabel) + "</span></td>" +
            '<td class="strong">' + esc(A.summary(q)) + "</td><td>" + esc(changeLabel(q)) + '</td><td class="col-wide">' + A.TYPES[q.type] + '</td><td class="col-wide">' + A.count(q.players) + "</td></tr>";
        }).join("") : '<tr><td colspan="5">Aucune question ne correspond.</td></tr>') + "</tbody></table>";
    }
    document.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        view = b.dataset.view;
        document.querySelectorAll("[data-view]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.view === view)); });
        $("view-cartes").hidden = view !== "cartes";
        $("view-tableau").hidden = view !== "tableau";
        if (view === "tableau") { draw(); }
      });
    });
    search.addEventListener("input", draw);
    $("q-sort").addEventListener("change", function (e) { sort = e.target.value; draw(); });
  }

  // ---------- Proposer une question ----------
  function initPropose() {
    var form = $("propose-form");
    if (!form) { return; }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = A.readStore();
      data.proposals = (data.proposals || []).concat([{ text: $("propose-text").value.trim().slice(0, 200), rule: $("propose-rule").value.trim().slice(0, 300), type: $("propose-type").value, t: Date.now() }]);
      A.writeStore(data);
      form.reset();
      $("propose-status").textContent = "Proposition enregistrée dans ce navigateur (" + data.proposals.length + "). La relecture par l'équipe ouvrira avec les comptes.";
    });
  }

  // ---------- Test de calibration (réponses réelles) ----------
  function initCalibration() {
    var root = $("calib");
    if (!root) { return; }
    var quiz = ND.calibrationQuiz || [], answers = [], i = 0;
    function step() {
      var s = quiz[i];
      root.innerHTML = '<p class="kicker">Affirmation ' + (i + 1) + " sur " + quiz.length + '</p><div class="progress">' + quiz.map(function (_, k) { return '<span class="' + (k <= i ? "is-open" : "") + '"></span>'; }).join("") + "</div>" +
        '<h2 class="h2">' + esc(s.text) + "</h2>" +
        '<form id="calib-form" class="play-form"><label class="play-label" for="calib-slider">À combien es-tu sûr que c\'est vrai' + NNBSP + "?</label>" +
        '<div class="gauge"><span class="gauge-face face" id="calib-face"></span><output class="num" id="calib-num" for="calib-slider"></output></div>' +
        '<input class="slider" id="calib-slider" type="range" min="0" max="100" step="5" value="50">' +
        '<div class="chart-x"><span>Sûrement faux</span><span>Aucune idée</span><span>Sûrement vrai</span></div>' +
        '<button class="btn btn--plein" type="submit">' + (i === quiz.length - 1 ? "Voir mon résultat" : "Suivante") + "</button></form>";
      var slider = $("calib-slider");
      function draw() { var v = parseInt(slider.value, 10); $("calib-face").innerHTML = A.face(v / 100, A.moodFor(v)); $("calib-num").textContent = pct(v); slider.style.setProperty("--val", v + "%"); }
      slider.addEventListener("input", draw); draw();
      $("calib-form").addEventListener("submit", function (ev) {
        ev.preventDefault();
        answers.push(parseInt(slider.value, 10));
        i++;
        if (i < quiz.length) { step(); } else { result(); }
      });
    }
    function result() {
      var brier = 0, conf = 0, right = 0;
      quiz.forEach(function (s, k) {
        var p = answers[k] / 100, t = s.truth ? 1 : 0;
        brier += Math.pow(p - t, 2);
        conf += Math.max(p, 1 - p);
        if (answers[k] !== 50 && (answers[k] > 50) === s.truth) { right++; } else if (answers[k] === 50) { right += 0.5; }
      });
      brier /= quiz.length; conf = conf / quiz.length * 100; right = right / quiz.length * 100;
      var score = A.clamp(Math.round(100 * (1 - 2 * brier)), 0, 100), gap = conf - right;
      var profile = gap > 10 ? "Trop sûr de toi" : gap < -10 ? "Trop prudent" : "Bien calibré";
      var advice = gap > 10 ? "Tu annonces plus de certitude que tes résultats n'en justifient. Rapproche tes réponses de 50" + NNBSP + "% quand tu hésites."
        : gap < -10 ? "Tu en sais plus que tu ne le dis. Ose t'éloigner de 50" + NNBSP + "% quand tu connais la réponse."
        : "Ta confiance colle à tes résultats. C'est exactement ce que mesure l'indice de fiabilité.";
      var data = A.readStore();
      data.calibration = { score: score, profile: profile, t: Date.now() };
      A.writeStore(data);
      root.innerHTML = '<p class="kicker">Ton résultat</p><div class="profile-head"><span class="face profile-face">' + A.face(score / 100, score >= 75 ? "sur" : score >= 55 ? "confiant" : "partage") + "</span>" +
        '<div class="profile-id"><h2 class="h2">' + profile + '</h2><p>' + advice + "</p></div></div>" +
        '<div class="tiles">' + tile("Score de calibration", String(score), "sur 100") + tile("Ta confiance moyenne", pct(Math.round(conf)), "ce que tu annonces") + tile("Tes bonnes réponses", pct(Math.round(right)), "ce qui est arrivé") + "</div>" +
        '<div class="rows">' + quiz.map(function (s, k) {
          var ok = answers[k] !== 50 && (answers[k] > 50) === s.truth;
          return "<div><span>" + esc(s.text) + " <strong>" + (s.truth ? "Vrai." : "Faux.") + "</strong> " + esc(s.note) + "</span><span>" + pct(answers[k]) + (answers[k] === 50 ? "" : ok ? " · juste" : " · raté") + "</span></div>";
        }).join("") + "</div>" +
        '<div class="arg-actions"><a class="btn" href="index.html">Jouer la question du jour</a><a class="btn btn--contour" href="calibration.html">Refaire le test</a></div>' +
        '<p class="small muted">Le résultat est gardé dans ce navigateur et affiché sur ton profil.</p>';
    }
    $("calib-start").addEventListener("click", step);
  }

  // ---------- Widget à intégrer ----------
  function initWidget() {
    var root = $("widget");
    if (!root) { return; }
    var q = A.findQuestion(A.param("id")) || A.findQuestion(ND.todayId), s = series(q).slice(-30), min = Math.min.apply(null, s), max = Math.max.apply(null, s);
    var pts = s.map(function (v, i) { return (i ? "L" : "M") + (i / (s.length - 1) * 300).toFixed(1) + " " + (56 - (v - min) / ((max - min) || 1) * 52).toFixed(1); }).join(" ");
    var url = new URL("question.html?id=" + q.id, window.location.href).toString();
    root.className = "widget t-" + q.theme;
    root.innerHTML = '<div class="qcard-top"><img src="assets/img/logo.svg" alt="NostraData" width="109" height="24"><span class="pill pill--theme">' + esc(q.themeLabel) + "</span></div>" +
      '<h1 class="q">' + esc(A.typo(q.text)) + "</h1>" +
      '<div class="qcard-index"><span class="face">' + A.face(isPct(q) ? endValue(q) / 100 : 0.62, q.type === "binaire" ? A.moodFor(q.index) : "confiant") + '</span><span class="num' + (q.type === "binaire" ? "" : " num--texte") + '">' + esc(A.summary(q)) + "</span></div>" +
      '<svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"><path d="' + pts + '" stroke="#0B0B0B" stroke-width="2.5" fill="none" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      '<p class="small"><a href="' + url + '" target="_blank" rel="noopener">Indice NostraData</a> · ' + changeLabel(q) + " sur 7 jours</p>" +
      '<p class="small muted">Version de présentation · contenu d\'exemple</p>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTable();
    initPropose();
    initCalibration();
    initWidget();
  });
})();
