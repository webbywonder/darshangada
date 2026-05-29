/* ============================================================
   dr5hn OS — engine.js
   Vanilla terminal game. No frameworks, no backend.
   ============================================================ */
(function () {
  "use strict";
  var D = window.DATA;

  // ---- elements ------------------------------------------------
  var out = document.getElementById("out");
  var viewport = document.getElementById("viewport");
  var input = document.getElementById("cmdline");
  var suggestEl = document.getElementById("suggest");
  var barsEl = document.getElementById("bars");
  var meterTxt = document.getElementById("meterTxt");

  // ---- state ---------------------------------------------------
  var discovered = {};
  var history = [];
  var histIdx = -1;
  var booted = false;
  var finaleShown = false;
  var gameActive = false;

  try {
    var saved = JSON.parse(localStorage.getItem("dr5hn_state") || "{}");
    discovered = saved.discovered || {};
    if (saved.theme) document.body.setAttribute("data-theme", saved.theme);
    finaleShown = !!saved.finaleShown;
  } catch (e) {}

  function persist() {
    try {
      localStorage.setItem("dr5hn_state", JSON.stringify({
        discovered: discovered,
        theme: document.body.getAttribute("data-theme") || "",
        finaleShown: finaleShown,
      }));
    } catch (e) {}
  }

  // ---- helpers -------------------------------------------------
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function scrollDown() {
    requestAnimationFrame(function () { viewport.scrollTop = viewport.scrollHeight; });
  }
  // WAAPI entrance — transform-only (no opacity), so html-to-image captures
  // never catch a faded frame; resting state is fully visible.
  function animIn(node, dy) {
    if (!node || !node.animate || reduceMotion) return;
    try {
      node.animate(
        [{ transform: "translateY(" + (dy == null ? 5 : dy) + "px)" }, { transform: "none" }],
        { duration: 260, easing: "cubic-bezier(.2,.7,.3,1)" }
      );
    } catch (e) {}
  }
  function linkOut(url, label) {
    return '<a href="' + url + '" target="_blank" rel="noopener">' + esc(label || url) + "</a>";
  }

  // honor reduced-motion: skip typewriter, entrance transforms, ambient motion
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  // type a plain-text string into a node, char by char. cb when done.
  function typewriter(node, text, speed, cb) {
    if (reduceMotion) { node.textContent = text; if (cb) cb(); return; }
    var i = 0, n = text.length;
    node.textContent = "";
    (function step() {
      if (i >= n) { if (cb) cb(); return; }
      var chunk = text.length > 90 ? 2 : 1; // type longer answers a touch faster
      node.textContent += text.slice(i, i + chunk);
      i += chunk;
      if (i % 2 === 0 && window.SFX) SFX.key();
      scrollDown();
      setTimeout(step, speed || 16);
    })();
  }

  // print a block (DOM node or html string) into the output
  function print(node, opts) {
    var wrap = el("div", "reveal");
    if (typeof node === "string") wrap.innerHTML = node;
    else wrap.appendChild(node);
    if (opts && opts.noReveal) wrap.className = "";
    out.appendChild(wrap);
    if (!(opts && opts.noReveal)) animIn(wrap);
    scrollDown();
    return wrap;
  }
  function line(html, cls) { return print(el("div", "ln " + (cls || ""), html)); }
  function spacer() { out.appendChild(el("div", "spacer")); }

  function echo(cmd) {
    var n = el("div", "ln cmd-echo");
    n.innerHTML = '<span class="prompt">visitor@dr5hn</span>:<span class="cyan">~</span>$ <span class="cmd">' + esc(cmd) + "</span>";
    out.appendChild(n);
  }
  // echo that types itself out (used for tapped chips / refs)
  function echoType(cmd, cb) {
    var n = el("div", "ln cmd-echo");
    n.innerHTML = '<span class="prompt">visitor@dr5hn</span>:<span class="cyan">~</span>$ <span class="cmd"></span>';
    out.appendChild(n);
    var span = n.querySelector(".cmd");
    var i = 0;
    (function step() {
      if (i >= cmd.length) { if (window.SFX) SFX.blip(); if (cb) cb(); return; }
      span.textContent += cmd[i++];
      if (window.SFX) SFX.key();
      scrollDown();
      setTimeout(step, 30);
    })();
  }

  // ---- discovery meter ----------------------------------------
  function markDiscovered(key) {
    if (D.coreCommands.indexOf(key) === -1) return;
    if (discovered[key]) { renderMeter(); return; }
    discovered[key] = true;
    persist();
    renderMeter();
    renderSuggest();
    checkFinale();
  }
  function discoveredCount() {
    return D.coreCommands.filter(function (k) { return discovered[k]; }).length;
  }
  function renderMeter() {
    var total = D.coreCommands.length;
    var n = discoveredCount();
    var s = "";
    for (var i = 0; i < total; i++) {
      s += i < n ? "▰" : '<span class="off">▱</span>';
    }
    barsEl.innerHTML = s;
    meterTxt.textContent = n + "/" + total + " explored";
  }

  function checkFinale() {
    if (finaleShown) return;
    if (discoveredCount() >= D.coreCommands.length) {
      finaleShown = true;
      persist();
      setTimeout(function () {
        spacer();
        renderFinale();
      }, 350);
    }
  }

  // ============================================================
  //  COMMAND IMPLEMENTATIONS
  // ============================================================
  var commands = {};

  commands.help = function () {
    var c = el("div");
    c.innerHTML =
      '<div class="h">Available commands</div>' +
      '<div class="ln muted">Type one and hit <kbd>enter</kbd>, or just tap a chip below. ' +
      "Use <kbd>tab</kbd> to autocomplete and <kbd>↑</kbd>/<kbd>↓</kbd> for history.</div>";
    var rows = [
      ["whoami", "who is this guy?"],
      ["work", "career timeline"],
      ["projects", "things I've built"],
      ["open <name>", "open a project (e.g. open csc)"],
      ["csc", "★ my open-source geo-data platform"],
      ["skills", "the toolbox"],
      ["contact", "let's talk"],
      ["resume", "just the facts (plain view)"],
      ["ask <q>", "✦ ask my scripted AI assistant"],
      ["play snake", "▶ a mini-game — collect cities"],
      ["neofetch", "system info"],
      ["theme", "switch colours"],
      ["clear", "clear the screen"],
    ];
    var grid = el("div", "card");
    grid.style.cssText = "display:grid;grid-template-columns:max-content 1fr;gap:4px 18px;margin-top:8px;";
    rows.forEach(function (r) {
      grid.appendChild(el("div", "amber", esc(r[0])));
      grid.appendChild(el("div", "muted", esc(r[1])));
    });
    c.appendChild(grid);
    c.appendChild(el("div", "ln faint", "Tip: tap any command below, or type it and hit enter."));
    print(c);
  };

  commands.whoami = commands.about = function () {
    var c = el("div");
    c.innerHTML =
      '<div class="h">' + esc(D.identity.name) + '  <span class="faint">(@' + esc(D.identity.handle) + ")</span></div>" +
      '<div class="ln cyan">' + esc(D.identity.title) + "</div>" +
      '<div class="ln faint">📍 ' + esc(D.identity.location) + "  ·  " + esc(D.identity.years) + "</div>";
    var body = el("div", "card");
    D.about.forEach(function (l) {
      body.appendChild(el("div", "ln " + (l === "" ? "" : "muted"), l === "" ? "&nbsp;" : esc(l)));
    });
    c.appendChild(body);
    print(c);
    markDiscovered("whoami");
  };

  commands.work = commands.experience = function () {
    var c = el("div");
    c.appendChild(el("div", "h", "Career // a decade of shipping"));
    D.work.forEach(function (j) {
      var job = el("div", "job");
      var head =
        '<span class="role">' + esc(j.role) + "</span>" +
        (j.company ? ' <span class="muted">@</span> ' +
          (j.url ? linkOut(j.url, j.company) : '<span class="at">' + esc(j.company) + "</span>") : "") +
        '<span class="when">' + esc(j.period) + "</span>";
      job.appendChild(el("div", "", head));
      if (j.note) job.appendChild(el("div", "note", esc(j.note)));
      var ul = el("ul");
      j.bullets.forEach(function (b) { ul.appendChild(el("li", "", esc(b))); });
      job.appendChild(ul);
      c.appendChild(job);
    });
    print(c);
    markDiscovered("work");
  };

  commands.projects = commands.ls = function () {
    var c = el("div");
    c.appendChild(el("div", "h", "Selected projects"));
    c.appendChild(el("div", "ln muted", 'Run <span class="amber">open &lt;name&gt;</span> for detail — e.g. <span class="amber">open ilovejson</span>.'));
    D.projects.forEach(function (p) {
      var row = el("div", "proj");
      row.innerHTML =
        '<div class="top"><span class="pname">' + esc(p.name) + '</span>' +
        '<span class="ptag">' + esc(p.tag) + '</span>' +
        '<span class="open-hint">open ' + esc(p.id) + '</span></div>' +
        '<div class="pdesc">' + esc(p.desc) + "</div>" +
        '<div class="ptech">' + p.tech.map(esc).join("  ·  ") + "</div>";
      c.appendChild(row);
    });
    print(c);
    markDiscovered("projects");
  };

  commands.open = function (args) {
    var key = (args[0] || "").toLowerCase();
    if (!key) { line('usage: <span class="amber">open &lt;name&gt;</span> — try <span class="amber">open csc</span>', "muted"); return; }
    if (key === "csc") { commands.csc(); return; }
    var p = D.projects.filter(function (x) { return x.id === key || x.name.toLowerCase() === key; })[0];
    if (!p) { line('no project "<span class="red">' + esc(key) + '</span>". run <span class="amber">projects</span> to list them.', "muted"); return; }
    var c = el("div", "card");
    c.innerHTML =
      '<div class="h">' + esc(p.name) + '  <span class="magenta" style="font-size:13px">' + esc(p.tag) + "</span></div>" +
      '<div class="ln">' + esc(p.desc) + "</div>" +
      '<div class="chips">' + p.tech.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("") + "</div>" +
      (p.url ? '<div class="ln">→ ' + linkOut(p.url) + "</div>" : "");
    print(c);
    markDiscovered("projects");
  };

  commands.csc = function () {
    var s = D.csc;
    var c = el("div");
    c.innerHTML =
      '<div class="h">★ ' + esc(s.name) + "</div>" +
      '<div class="ln muted">' + esc(s.blurb) + "</div>";
    var grid = el("div", "stats");
    s.stats.forEach(function (st) {
      var box = el("div", "stat");
      var num = el("div", "num");
      num.setAttribute("data-suffix", st.suffix);
      if (st.key) num.setAttribute("data-key", st.key);
      if (st.gh) num.setAttribute("data-gh", st.gh);
      num.setAttribute("data-target", st.value);
      num.textContent = "0" + st.suffix;
      box.appendChild(num);
      box.appendChild(el("div", "lab", esc(st.label)));
      grid.appendChild(box);
    });
    c.appendChild(grid);
    var live = el("div", "ln faint");
    live.id = "liveNote";
    live.innerHTML = "Available in 11 formats:";
    var fch = el("div", "chips");
    s.formats.forEach(function (f) { fch.appendChild(el("span", "chip", esc(f))); });
    var pieces = el("div"); pieces.style.marginTop = "8px";
    s.pieces.forEach(function (p) { pieces.appendChild(el("div", "ln muted", "› " + esc(p))); });
    c.appendChild(live);
    c.appendChild(fch);
    c.appendChild(pieces);
    c.appendChild(el("div", "ln", "→ " + linkOut(s.url)));
    print(c);
    // pull live numbers (CSC API + GitHub API in parallel), then animate to targets
    loadAllStats(function (data, gh) {
      if (data) {
        c.querySelectorAll(".num[data-key]").forEach(function (n) {
          var k = n.getAttribute("data-key");
          if (data[k] == null) return;
          if (k === "totalRequests") {
            n.setAttribute("data-target", (data[k] / 1e9).toFixed(1));
            n.setAttribute("data-suffix", "B+");
          } else {
            n.setAttribute("data-target", data[k]);
            n.setAttribute("data-suffix", "");
          }
        });
      }
      if (gh) {
        c.querySelectorAll(".num[data-gh]").forEach(function (n) {
          var k = n.getAttribute("data-gh");
          if (gh[k] == null) return;
          n.setAttribute("data-target", gh[k]);
          n.setAttribute("data-suffix", "");
        });
      }
      if (data || gh) {
        var note = c.querySelector("#liveNote");
        if (note) note.innerHTML = '<span class="green">●</span> pulled live from the CSC + GitHub APIs · available in 11 formats:';
      }
      animateCounters(c);
    });
    markDiscovered("csc");
  };

  // ---- live stats: CSC API + GitHub API, hard timeout + evergreen fallback ----
  var _stats = null, _gh = null;

  function getStats(cb) {
    if (_stats !== null) { cb(_stats || null); return; }
    var done = false;
    var to = setTimeout(function () { if (!done) { done = true; cb(null); } }, 3500);
    try {
      fetch(D.csc.statsApi, { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (done) return; done = true; clearTimeout(to); _stats = j; cb(j); })
        .catch(function () { if (done) return; done = true; clearTimeout(to); _stats = false; cb(null); });
    } catch (e) { if (!done) { done = true; clearTimeout(to); cb(null); } }
  }

  function getGitHubStats(cb) {
    if (_gh !== null) { cb(_gh || null); return; }
    var done = false;
    var to = setTimeout(function () { if (!done) { done = true; cb(null); } }, 3500);
    function finish(out) { if (done) return; done = true; clearTimeout(to); _gh = out || false; cb(out || null); }
    try {
      fetch("https://api.github.com/repos/" + D.csc.ghRepo, { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (done) return;
          var out = { stars: j.stargazers_count, forks: j.forks_count };
          // contributor count via the Link header's last-page number
          fetch("https://api.github.com/repos/" + D.csc.ghRepo + "/contributors?per_page=1&anon=1", { cache: "no-store" })
            .then(function (r2) {
              var link = r2.headers.get("Link");
              if (link) { var m = link.match(/[?&]page=(\d+)>;\s*rel="last"/); if (m) out.contributors = parseInt(m[1], 10); }
              finish(out);
            })
            .catch(function () { finish(out); });
        })
        .catch(function () { finish(null); });
    } catch (e) { finish(null); }
  }

  // resolve both sources (each already self-times-out), then render once
  function loadAllStats(cb) {
    var got = { api: undefined, gh: undefined }, fired = false;
    function maybe() {
      if (fired) return;
      if (got.api !== undefined && got.gh !== undefined) { fired = true; cb(got.api, got.gh); }
    }
    getStats(function (a) { got.api = a; maybe(); });
    getGitHubStats(function (g) { got.gh = g; maybe(); });
  }

  function animateCounters(scope) {
    var nums = scope.querySelectorAll(".num[data-target]");
    nums.forEach(function (n) {
      var target = parseFloat(n.getAttribute("data-target"));
      var suffix = n.getAttribute("data-suffix") || "";
      var isFloat = target % 1 !== 0;
      var dur = 1100, start = performance.now();
      function fmt(v) {
        if (isFloat) return v.toFixed(1);
        return Math.round(v).toLocaleString("en-US");
      }
      function step(now) {
        var t = Math.min(1, (now - start) / dur);
        var e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        n.textContent = fmt(target * e) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else n.textContent = fmt(target) + suffix;
      }
      requestAnimationFrame(step);
    });
  }

  commands.skills = commands.stack = function () {
    var c = el("div");
    c.appendChild(el("div", "h", "The toolbox"));
    Object.keys(D.skills).forEach(function (g) {
      var grp = el("div", "skillgroup");
      grp.appendChild(el("div", "gname", g));
      var ch = el("div", "chips");
      D.skills[g].forEach(function (t) { ch.appendChild(el("span", "chip", esc(t))); });
      grp.appendChild(ch);
      c.appendChild(grp);
    });
    print(c);
    markDiscovered("skills");
  };

  commands.education = function () {
    var c = el("div");
    c.appendChild(el("div", "h", "Education"));
    D.education.forEach(function (e) {
      c.appendChild(el("div", "ln", '<span class="b">' + esc(e.degree) + '</span> <span class="faint">— ' + esc(e.school) + " · " + esc(e.period) + "</span>"));
    });
    print(c);
  };
  commands.contact = commands.hire = function () {
    var L = D.links;
    var c = el("div");
    c.appendChild(el("div", "h", "Let's build something"));
    c.appendChild(el("div", "ln muted", D.availability.blurb));
    var av = el("div", "avail");
    av.appendChild(el("div", "avail-label", "available for"));
    var ach = el("div", "chips");
    D.availability.fractional.forEach(function (f) { ach.appendChild(el("span", "chip avail-chip", esc(f))); });
    av.appendChild(ach);
    c.appendChild(av);
    var box = el("div", "card");
    var rows = [
      ["github", L.github, "github.com/dr5hn"],
      ["linkedin", L.linkedin, "linkedin.com/in/dr5hn"],
      ["twitter", L.twitter, "twitter.com/dr5hn"],
    ];
    rows.forEach(function (r) {
      box.appendChild(el("div", "ln",
        '<span class="amber" style="display:inline-block;min-width:90px">' + r[0] + "</span>" + linkOut(r[1], r[2])));
    });
    c.appendChild(box);
    print(c);
    markDiscovered("contact");
  };

  commands.resume = function () {
    var c = el("div", "card");
    var L = D.links;
    c.innerHTML =
      '<div class="h">Plain resume — the TL;DR</div>' +
      '<div class="ln"><span class="b">' + esc(D.identity.name) + '</span> — ' + esc(D.identity.title) + "</div>" +
      '<div class="ln faint">' + esc(D.identity.location) + " · " + esc(D.identity.years) + " · " + linkOut(D.links.github, "github.com/dr5hn") + "</div>" +
      '<div class="spacer"></div>' +
      '<div class="ln muted">' + esc(D.identity.tagline) + "</div>" +
      '<div class="spacer"></div>' +
      '<div class="gname cyan" style="font-size:12.5px">NOW</div>' +
      '<div class="ln">Head of AI &amp; Innovations @ ' + linkOut("https://sozodesign.co.uk/", "SOZO Design") + " (2025–present)</div>" +
      '<div class="gname cyan" style="font-size:12.5px;margin-top:8px">SIGNATURE WORK</div>' +
      '<div class="ln">Maintainer, ' + linkOut("https://countrystatecity.in", "Country-State-City") + " — " + D.metrics.requests + " API requests served, " + D.metrics.developers + " developers.</div>" +
      '<div class="spacer"></div>' +
      '<div class="ln faint">Full resume → ' + linkOut("https://github.com/dr5hn/resume", "github.com/dr5hn/resume") + "</div>";
    print(c);
    // resume satisfies whoami discovery too
    markDiscovered("whoami");
  };

  // ---- ask: the scripted AI assistant -------------------------
  function formatAnswer(t) {
    return esc(t).replace(/`([^`]+)`/g, function (_, c) {
      var cmd = c.trim().replace(/[^a-z0-9 <>-]/gi, "");
      return '<span class="cmd-ref" data-cmd="' + cmd + '">' + c + "</span>";
    });
  }
  function bindCmdRefs(scope) {
    scope.querySelectorAll(".cmd-ref").forEach(function (s) {
      s.addEventListener("click", function () {
        var cmd = s.getAttribute("data-cmd");
        if (cmd) { run(cmd.split(" ")[0] === "open" ? cmd : cmd.split(" ")[0], true); input.focus(); }
      });
    });
  }

  commands.ask = function (args) {
    var q = (args || []).join(" ").trim();
    if (!q) {
      var c = el("div");
      c.appendChild(el("div", "h", "✦ Ask dr5hn-ai"));
      c.appendChild(el("div", "ln muted", "A tiny scripted agent — no live model, just curated answers. Ask in plain English (e.g. <span class='amber'>ask are you open to work?</span>) or tap one:"));
      var sg = el("div", "ask-suggest");
      (window.ASK ? window.ASK.suggestions : []).forEach(function (s) {
        var b = el("button", "ask-chip", "“" + esc(s) + "”");
        b.addEventListener("click", function () { run("ask " + s, true); input.focus(); });
        sg.appendChild(b);
      });
      c.appendChild(sg);
      print(c);
      return;
    }
    var res = window.ASK ? window.ASK.match(q) : { answer: "(assistant unavailable)" };
    var block = el("div", "ask-answer");
    block.innerHTML = '<div class="ask-who"><span class="ask-orb" aria-hidden="true"></span> dr5hn-ai</div>';
    var body = el("div", "ask-body");
    body.innerHTML = '<span class="ask-think">thinking<span class="ask-dots"><i>.</i><i>.</i><i>.</i></span></span>';
    block.appendChild(body);
    print(block);
    if (window.SFX) SFX.blip();
    var wait = reduceMotion ? 220 : (560 + Math.random() * 520);
    setTimeout(function () {
      body.innerHTML = "";
      var ans = el("span", "ask-text");
      body.appendChild(ans);
      typewriter(ans, res.answer.replace(/`/g, ""), 14, function () {
        body.innerHTML = '<span class="ask-text">' + formatAnswer(res.answer) + "</span>";
        bindCmdRefs(body);
        scrollDown();
      });
    }, wait);
  };

  commands.neofetch = function () {
    var nf = D.neofetch;
    var keys = [
      ["host", nf.host], ["os", nf.os], ["kernel", nf.kernel],
      ["uptime", nf.uptime], ["shell", nf.shell],
      ["packages", nf.packages], ["cpu", nf.cpu], ["memory", nf.memory],
      ["open source", nf.open_source],
    ];
    var c = el("div", "neofetch-card");

    // left: a logo tile with a real, visible background
    var left = el("div", "nf-logo");
    left.innerHTML =
      '<div class="nf-glyph">&rsaquo;<span class="nf-cursor">_</span></div>' +
      '<div class="nf-mark">dr5hn</div>' +
      '<div class="nf-sub">~ Mumbai</div>';

    // right: header + divider + a grid of specs (values wrap in their own cell)
    var right = el("div", "nf-info");
    right.appendChild(el("div", "nf-head", '<span class="amber b">visitor</span><span class="faint">@</span><span class="cyan b">dr5hn</span>'));
    right.appendChild(el("div", "nf-rule"));
    var grid = el("div", "nf-grid");
    keys.forEach(function (k) {
      grid.appendChild(el("div", "nf-k", esc(k[0])));
      grid.appendChild(el("div", "nf-v", esc(k[1])));
    });
    right.appendChild(grid);

    c.appendChild(left);
    c.appendChild(right);
    print(c);
  };

  commands.theme = function (args) {
    var order = ["", "green", "ice"];
    var names = { "": "amber", green: "green", ice: "ice" };
    var cur = document.body.getAttribute("data-theme") || "";
    var pick = args[0];
    var next;
    if (pick && names[pick === "amber" ? "" : pick] !== undefined) {
      next = pick === "amber" ? "" : pick;
    } else {
      next = order[(order.indexOf(cur) + 1) % order.length];
    }
    if (next) document.body.setAttribute("data-theme", next);
    else document.body.removeAttribute("data-theme");
    persist();
    line('theme → <span class="amber">' + names[next] + "</span> <span class='faint'>(run `theme` again to cycle: amber · green · ice)</span>", "muted");
  };

  commands.clear = commands.cls = function () {
    out.innerHTML = "";
  };

  commands.play = function (args) {
    var which = (args[0] || "").toLowerCase();
    if (which === "snake") { launchSnake(); return; }
    var c = el("div");
    c.appendChild(el("div", "h", "Arcade"));
    c.appendChild(el("div", "ln muted", 'A little something. Run <span class="amber">play snake</span> to play.'));
    var box = el("div", "card");
    box.innerHTML = '<div class="ln"><span class="amber b">▶ snake</span> <span class="muted">— classic Snake, but you collect cities from the CSC database. Arrows / WASD / swipe.</span></div>';
    c.appendChild(box);
    print(c);
  };

  function launchSnake() {
    if (typeof window.startSnake !== "function") { line("snake failed to load — try refreshing.", "muted"); return; }
    var mount = el("div", "game-mount");
    print(mount);
    gameActive = true;
    input.blur();
    input.setAttribute("placeholder", "playing snake… press Q to quit");
    window.startSnake({
      mount: mount,
      onExit: function (summary) {
        gameActive = false;
        input.setAttribute("placeholder", "type a command — or tap one above");
        var sib = el("div", "spacer"); mount.parentNode.insertBefore(sib, mount.nextSibling);
        line(summary, "muted");
        spacer();
        input.focus();
        scrollDown();
      },
    });
    scrollDown();
  }

  // ---- finale --------------------------------------------------
  function renderFinale() {
    var c = el("div", "finale");
    c.innerHTML =
      '<div class="h">🎉 You explored the whole system.</div>' +
      '<div class="ln muted">Thanks for actually playing — most people skim. You didn\'t.</div>' +
      '<div class="spacer"></div>' +
      '<div class="ln">If you got this far, we\'d probably get along. I like people who poke at things to see how they work.</div>' +
      '<div class="spacer"></div>' +
      '<div class="ln muted">Darshan is open to full-time and fractional work — Fractional Lead, Architect, or Code Reviewer.</div>' +
      '<div class="spacer"></div>' +
      '<div class="ln"><span class="amber b">→ </span>' + linkOut(D.links.linkedin, "Connect: linkedin.com/in/dr5hn") + "</div>" +
      '<div class="ln"><span class="amber b">→ </span>' + linkOut(D.links.github, "See the code: github.com/dr5hn") + "</div>";
    out.appendChild(c);
    animIn(c);
    scrollDown();
  }

  // ============================================================
  //  PARSER / RUNNER
  // ============================================================
  var aliases = { "?": "help", h: "help", info: "whoami", about: "whoami", who: "whoami", proj: "projects", jobs: "work", career: "work" };

  function run(raw, animated) {
    var str = raw.trim();
    if (!str) return;
    // ignore commands (e.g. from chips) while a mini-game owns the screen
    if (gameActive) return;
    // if the user fires a command mid-boot, finish the boot cleanly first
    if (!booted) finishBootNow();
    history.push(str); histIdx = history.length;
    if (animated && !reduceMotion) {
      echoType(str, function () { execBody(str); });
    } else {
      echo(str);
      if (window.SFX) SFX.blip();
      execBody(str);
    }
  }

  function execBody(str) {
    var parts = str.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);
    if (aliases[name]) name = aliases[name];
    var fn = commands[name];
    if (fn) {
      try { fn(args); } catch (e) { line('<span class="red">runtime error.</span> sorry — try another command.', "muted"); }
    } else {
      if (window.SFX) SFX.error();
      line('command not found: <span class="red">' + esc(parts[0]) + '</span> — type <span class="amber">help</span> or tap a chip below.', "muted");
    }
    spacer();
    scrollDown();
  }

  // ---- suggestion chips ---------------------------------------
  var chipDefs = [
    { cmd: "whoami", label: "whoami" },
    { cmd: "work", label: "work" },
    { cmd: "projects", label: "projects" },
    { cmd: "csc", label: "★ csc" },
    { cmd: "skills", label: "skills" },
    { cmd: "contact", label: "contact" },
    { cmd: "ask", label: "✦ ask" },
    { cmd: "neofetch", label: "neofetch" },
    { cmd: "play snake", label: "▶ snake" },
    { cmd: "theme", label: "theme" },
    { cmd: "help", label: "help" },
  ];
  function renderSuggest() {
    suggestEl.innerHTML = "";
    chipDefs.forEach(function (c) {
      var b = el("button", "scmd");
      var core = D.coreCommands.indexOf(c.cmd) !== -1;
      if (core && discovered[c.cmd]) b.className += " done";
      b.innerHTML = '<span class="k">$</span> ' + esc(c.label);
      b.addEventListener("click", function () {
        run(c.cmd, true);
        input.focus();
      });
      suggestEl.appendChild(b);
    });
  }

  // ---- input handling -----------------------------------------
  var ghost = document.getElementById("ghost");

  function bestCompletion(v) {
    var cur = v.toLowerCase();
    if (!cur || cur.indexOf(" ") !== -1) return ""; // only complete the command token
    var all = Object.keys(commands).concat(Object.keys(aliases));
    var seen = {}, uniq = [];
    all.forEach(function (k) { if (!seen[k]) { seen[k] = 1; uniq.push(k); } });
    var m = uniq.filter(function (k) { return k.indexOf(cur) === 0 && k !== cur; }).sort();
    return m[0] || "";
  }
  function updateGhost() {
    var v = input.value;
    var comp = bestCompletion(v);
    if (comp && comp.length > v.length) {
      ghost.innerHTML = '<span class="g-typed">' + esc(v) + '</span><span class="g-rest">' + esc(comp.slice(v.length)) + "</span>";
    } else {
      ghost.textContent = "";
    }
  }
  function acceptGhost() {
    var comp = bestCompletion(input.value);
    if (comp && comp.length > input.value.length) { input.value = comp; updateGhost(); return true; }
    return false;
  }

  input.addEventListener("input", function () {
    if (window.SFX) SFX.key();
    updateGhost();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var v = input.value; input.value = ""; updateGhost();
      run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ""; updateGhost(); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx] || ""; }
      else { histIdx = history.length; input.value = ""; }
      updateGhost();
    } else if (e.key === "Tab") {
      e.preventDefault();
      acceptGhost();
    } else if (e.key === "ArrowRight") {
      // accept ghost only when caret is at the very end
      if (input.selectionStart === input.value.length && input.selectionEnd === input.value.length) {
        if (acceptGhost()) e.preventDefault();
      }
    }
  });

  // ---- sound toggle -------------------------------------------
  var sndBtn = document.getElementById("sndToggle");
  function renderSnd() {
    var on = window.SFX && SFX.enabled;
    if (!sndBtn) return;
    sndBtn.textContent = on ? "♪ on" : "♪ off";
    sndBtn.classList.toggle("on", !!on);
    sndBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  if (sndBtn) {
    sndBtn.addEventListener("click", function () {
      if (!window.SFX) return;
      SFX.setEnabled(!SFX.enabled);
      renderSnd();
    });
    renderSnd();
  }

  // keep focus on the input when tapping the terminal body (not links/buttons)
  document.querySelector(".window").addEventListener("click", function (e) {
    var t = e.target;
    if (gameActive) return;
    if (t.closest("a") || t.closest("button") || t.closest(".resume-link")) return;
    if (window.getSelection && String(window.getSelection())) return; // allow text selection
    input.focus();
  });

  // resume escape-hatch in HUD
  var hatch = document.getElementById("resumeHatch");
  if (hatch) hatch.addEventListener("click", function () { run("resume", true); input.focus(); });

  // ============================================================
  //  BOOT SEQUENCE
  // ============================================================
  var bootLines = [
    { t: '<span class="faint">dr5hn OS v2026.5 — POST</span>', d: 60 },
    { t: '<span class="green">[ ok ]</span> <span class="muted">mounting /career ............ a decade of builds</span>', d: 70 },
    { t: '<span class="green">[ ok ]</span> <span class="muted">loading AI subsystems ........ agents, RAG, MCP</span>', d: 70 },
    { t: '<span class="green">[ ok ]</span> <span class="muted">syncing geo-data ............. ' + D.metrics.cities + ' cities</span>', d: 70 },
    { t: '<span class="green">[ ok ]</span> <span class="muted">spawning shell ............... ready</span>', d: 90 },
    { t: "&nbsp;", d: 30 },
  ];
  var logoArt = [
    "   D A R S H A N   G A D A",
    "   dr5hn · AI Engineer · Mumbai",
    "   ───────────────────────────────",
  ];

  function typeLine(html, cb) {
    var n = el("div", "ln bootline");
    n.innerHTML = html;
    out.appendChild(n);
    animIn(n, 3);
    scrollDown();
    setTimeout(cb, 0);
  }

  var bootTimer = null;
  var bootIdx = 0;
  function finishBootNow() {
    if (booted) return;
    clearTimeout(bootTimer);
    // render any remaining boot lines instantly
    while (bootIdx < bootLines.length) {
      var n = el("div", "ln bootline");
      n.innerHTML = bootLines[bootIdx].t;
      out.appendChild(n);
      bootIdx++;
    }
    finishBootTail();
  }
  function finishBootTail() {
    var logo = el("div", "amber bootline");
    logo.style.cssText = "white-space:pre;line-height:1.25;text-shadow:var(--glow-amber);font-size:clamp(10px,2.4vw,14px);";
    logo.textContent = logoArt.join("\n");
    out.appendChild(logo);
    spacer();
    line('Welcome. This is a playable résumé — <span class="amber">explore by running commands</span> or tapping the chips below.', "");
    line('New here? Try <span class="amber">whoami</span>, then <span class="amber">csc</span>. Type <span class="amber">help</span> anytime.', "muted");
    if (discoveredCount() > 0) {
      line('<span class="faint">welcome back — your exploration progress is saved.</span>', "");
    }
    spacer();
    booted = true;
    scrollDown();
    input.focus();
  }

  function boot() {
    bootIdx = 0;
    function next() {
      if (booted) return;
      if (bootIdx < bootLines.length) {
        typeLine(bootLines[bootIdx].t, function () {});
        var d = bootLines[bootIdx].d; bootIdx++;
        bootTimer = setTimeout(next, d);
      } else {
        finishBootTail();
      }
    }
    next();
  }

  // allow skipping the boot animation
  function skipBoot() {
    if (booted) return;
    finishBootNow();
    input.focus();
  }
  document.addEventListener("keydown", function (e) { if (!booted && e.key === "Enter") skipBoot(); });

  // ---- init ----------------------------------------------------
  renderMeter();
  renderSuggest();
  boot();
  setTimeout(function () { input.focus(); }, 200);

  // ---- console greeting: for the curious devs who open DevTools -----
  (function consoleGreeting() {
    try {
      var art = [
        "      _      ____  _     ",
        "   __| |_ __| ___|| |__  _ __  ",
        "  / _` | '__|___ \\| '_ \\| '_ \\ ",
        " | (_| | |   ___) | | | | | | |",
        "  \\__,_|_|  |____/|_| |_|_| |_|",
      ].join("\n");
      var amber = "color:#f3b94d;font-weight:bold;font-family:monospace;font-size:12px;line-height:1.2;text-shadow:0 0 8px rgba(243,185,77,.5)";
      var cyan = "color:#5ad1c4;font-family:monospace;font-size:13px";
      var dim = "color:#8a8f9a;font-family:monospace;font-size:12px";
      var amberTxt = "color:#f3b94d;font-family:monospace;font-size:12px";

      console.log("%c" + art, amber);
      console.log("%cWelcome to darshangada.com 👋", cyan);
      console.log(
        "%cYou found the console — of course you did. This whole site is a playable résumé,\n" +
        "hand-built as static HTML/CSS/JS. No framework, no backend, no tracking. Build once, runs forever.",
        dim
      );
      console.log("%cThe live numbers come straight from the CSC + GitHub APIs. Peek at the source — it's all here.", dim);
      console.log(
        "%c\n› Darshan is open to full-time and fractional work — Lead, Architect, Code Reviewer & AI advisory.",
        amberTxt
      );
      console.log("%c› Say hi:  https://www.linkedin.com/in/dr5hn/   ·   https://github.com/dr5hn/", amberTxt);
      console.log("%c\nTip: in the terminal above, type  ask  — there's a tiny AI agent in here too. 🤖", cyan);
    } catch (e) {}
  })();
})();
