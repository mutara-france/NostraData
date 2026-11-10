/* NostraData — logique du site (sans dépendance).
   Le pronostic du joueur est gardé dans le navigateur (localStorage) : rien n'est envoyé à un serveur. */
(function () {
  "use strict";
  var ND = window.ND || {};
  var NNBSP = " ";
  var STORE = "nostradata.v1";

  // ---------- Outils ----------
  function $(id) { return document.getElementById(id); }
  function pct(n) { return n + NNBSP + "%"; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function writeStore(data) {
    try { window.localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) { /* stockage indisponible : la démo marche quand même */ }
  }
  // Évite les coupures de ligne au milieu de « sera-t-il » ou « week-end » (trait d'union insécable).
  function typo(s) { return String(s).replace(/-t-(il|elle|on)\b/g, "\u2011t\u2011$1").replace(/week-end/g, "week\u2011end"); }
  function moodFor(p) { return p >= 85 ? "sur" : p >= 60 ? "confiant" : p >= 40 ? "partage" : "sceptique"; }

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

  // ---------- Série de jours ----------
  function showStreak() {
    var el = $("streak");
    if (!el) { return; }
    var days = Object.keys(readStore().answers || {}).length;
    if (days < 1) { return; }
    el.innerHTML = '<span class="face">' + face(Math.min(1, days / 7), "sur") + "</span><span>Série de " + days + " jour" + (days > 1 ? "s" : "") + "</span>";
    el.hidden = false;
  }

  // ---------- Question du jour ----------
  function initToday() {
    var q = ND.today;
    var slider = $("gauge");
    if (!q || !slider) { return; }
    var faceEl = $("gauge-face"), numEl = $("gauge-num"), playForm = $("play-form"), reveal = $("reveal");

    $("q-text").textContent = typo(q.text);
    $("q-theme").textContent = q.themeLabel;
    $("q-verdict").textContent = q.verdictLabel;
    $("q-players").textContent = q.players.toLocaleString("fr-FR") + " joueurs ont répondu";
    $("hero").className = "hero t-" + q.theme;

    // Défi reçu d'un ami : ?defi=40
    var friend = parseInt(new URLSearchParams(window.location.search).get("defi"), 10);
    if (!(friend >= 0 && friend <= 100)) { friend = null; }
    if (friend !== null) {
      $("defi-banner").textContent = "Un ami dit " + pct(friend) + ". Et toi" + NNBSP + "?";
      $("defi-banner").hidden = false;
    }

    function draw(v) {
      faceEl.innerHTML = face(v / 100, moodFor(v));
      numEl.textContent = pct(v);
      slider.style.setProperty("--val", v + "%");
      slider.setAttribute("aria-valuetext", v + " pour cent");
    }
    slider.addEventListener("input", function () { draw(parseInt(slider.value, 10)); });
    draw(parseInt(slider.value, 10));

    function showReveal(v) {
      var gap = Math.abs(v - q.index);
      var verdict = gap < 5 ? "Pile sur l'indice." : v < q.index ? "Tu es plus prudent que la foule." : "Tu es plus confiant que la foule.";
      $("r-me-face").innerHTML = face(v / 100, moodFor(v), "#E0458A");
      $("r-me").textContent = pct(v);
      $("r-index-face").innerHTML = face(q.index / 100, moodFor(q.index));
      $("r-index").textContent = pct(q.index);
      $("r-stamp").innerHTML = gap >= 15 ? '<span class="stamp stamp--foule">Contre la foule</span>' : "";
      $("r-message").textContent = verdict + (gap >= 15 ? " Si tu as raison, tes points comptent double." : "");
      $("r-gap").textContent = gap + " point" + (gap > 1 ? "s" : "");
      $("r-joueurs").textContent = pct(q.sources.joueurs);
      $("r-marches").textContent = pct(q.sources.marches);
      $("r-friend-row").hidden = friend === null;
      if (friend !== null) { $("r-friend").textContent = pct(friend); }
      $("r-when").textContent = q.verdictLabel + ". " + q.rule;
      playForm.hidden = true;
      reveal.hidden = false;
    }

    playForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = parseInt(slider.value, 10);
      var data = readStore();
      data.answers = data.answers || {};
      data.answers[q.id] = v;
      writeStore(data);
      showReveal(v);
      showStreak();
      reveal.focus();
    });

    $("replay").addEventListener("click", function () {
      var data = readStore();
      if (data.answers) { delete data.answers[q.id]; writeStore(data); }
      reveal.hidden = true;
      playForm.hidden = false;
      slider.focus();
    });

    $("share").addEventListener("click", function () {
      var v = (readStore().answers || {})[q.id];
      if (v === undefined) { v = parseInt(slider.value, 10); }
      var url = window.location.origin + window.location.pathname + "?defi=" + v;
      var text = "Moi, je dis " + pct(v) + ". Et toi" + NNBSP + "? " + q.text;
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

    var saved = (readStore().answers || {})[q.id];
    if (saved !== undefined) {
      slider.value = saved;
      draw(saved);
      showReveal(saved);
    }
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
    var rows = ND.leaderboard, limit = parseInt(list.dataset.limit, 10) || rows.length;
    pod.innerHTML = podium(rows);
    var played = Object.keys(readStore().answers || {}).length;
    var me = { rank: "–", name: "Toi", score: "–",
      title: played ? "Non classé · encore " + ND.minResolved + " questions tranchées" : "Réponds à la question du jour pour commencer" };
    list.innerHTML = rows.slice(3, Math.max(4, limit)).map(function (r) { return rankRow(r, false); }).join("") + rankRow(me, true);
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
    initToday();
    initVerdicts();
    initBoard();
    initPro();
    showStreak();
  });
})();
