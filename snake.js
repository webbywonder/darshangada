/* ============================================================
   dr5hn OS — snake.js
   A self-contained ASCII Snake. You collect cities from the
   CSC database (+ a few tech tokens). No deps.

   window.startSnake({ mount, onExit })  -> returns a stop() fn
   ============================================================ */
(function () {
  "use strict";

  var COLS = 22, ROWS = 14;
  var CITIES = [
    "Tokyo", "Mumbai", "London", "New York", "Paris", "Cairo", "Sydney",
    "Toronto", "Berlin", "Dubai", "Lagos", "São Paulo", "Singapore", "Seoul",
    "Mexico City", "Istanbul", "Bangkok", "Nairobi", "Lima", "Oslo",
    "Jakarta", "Madrid", "Rome", "Cape Town", "Hanoi",
  ];
  var TECH = ["React", "Node.js", "Redis", "Docker", "Python", "Laravel", "Prisma", "TypeScript"];

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  window.startSnake = function (opts) {
    var mount = opts.mount;
    var onExit = opts.onExit || function () {};

    // ---- build DOM ----
    mount.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "snake-wrap";
    wrap.innerHTML =
      '<div class="snake-hud">' +
        '<span class="sk-title">▶ SNAKE <span class="faint">· collect cities</span></span>' +
        '<span class="sk-stat">score <b id="sk-score">0</b></span>' +
        '<span class="sk-stat">best <b id="sk-best">0</b></span>' +
        '<span class="sk-quit" id="sk-quit">quit ✕</span>' +
      '</div>' +
      '<div class="sk-chasing">chasing: <span id="sk-next" class="cyan">—</span></div>' +
      '<div class="snake-board" id="sk-board"></div>' +
      '<div class="sk-collected" id="sk-collected"><span class="faint">collected:</span> <span id="sk-list" class="faint">none yet</span></div>' +
      '<div class="snake-controls">' +
        '<div class="dpad">' +
          '<button class="dk up" data-d="U" aria-label="up">▲</button>' +
          '<button class="dk left" data-d="L" aria-label="left">◀</button>' +
          '<button class="dk pause" id="sk-pause" aria-label="pause">❚❚</button>' +
          '<button class="dk right" data-d="R" aria-label="right">▶</button>' +
          '<button class="dk down" data-d="D" aria-label="down">▼</button>' +
        '</div>' +
        '<div class="sk-hint faint">arrows / WASD · space pauses · Q quits</div>' +
      '</div>';
    mount.appendChild(wrap);

    var boardEl = wrap.querySelector("#sk-board");
    var scoreEl = wrap.querySelector("#sk-score");
    var bestEl = wrap.querySelector("#sk-best");
    var nextEl = wrap.querySelector("#sk-next");
    var listEl = wrap.querySelector("#sk-list");

    // build cells grid
    var cells = [];
    for (var y = 0; y < ROWS; y++) {
      cells[y] = [];
      for (var x = 0; x < COLS; x++) {
        var d = document.createElement("div");
        d.className = "sk-cell";
        boardEl.appendChild(d);
        cells[y][x] = d;
      }
    }

    // ---- state ----
    var snake, dir, nextDir, food, score, speed, alive, paused, collected, pool, poolIdx, timer, ended = false;
    var best = 0;
    try { best = parseInt(localStorage.getItem("dr5hn_snake_best") || "0", 10) || 0; } catch (e) {}
    bestEl.textContent = best;

    function reset() {
      snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
      score = 0; speed = 150; alive = true; paused = false; collected = [];
      pool = shuffle(CITIES.concat(TECH)); poolIdx = 0;
      scoreEl.textContent = "0";
      listEl.textContent = "none yet"; listEl.className = "faint";
      placeFood();
      draw();
      schedule();
    }

    function placeFood() {
      var free = [];
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
        var on = snake.some(function (s) { return s.x === x && s.y === y; });
        if (!on) free.push({ x: x, y: y });
      }
      var spot = free[(Math.random() * free.length) | 0];
      var label = pool[poolIdx % pool.length]; poolIdx++;
      food = { x: spot.x, y: spot.y, label: label };
      nextEl.textContent = "◆ " + label;
    }

    function schedule() {
      clearTimeout(timer);
      if (!alive || paused) return;
      timer = setTimeout(tick, speed);
    }

    function tick() {
      if (!alive || paused) return;
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      // wall collision
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return gameOver();
      var ate = (head.x === food.x && head.y === food.y);
      var body = ate ? snake : snake.slice(0, -1);
      if (body.some(function (s) { return s.x === head.x && s.y === head.y; })) return gameOver();
      snake.unshift(head);
      if (ate) {
        score++;
        scoreEl.textContent = score;
        collected.push(food.label);
        listEl.className = "";
        listEl.textContent = collected.slice(-8).join(" · ");
        if (speed > 70) speed -= 5;
        if (window.SFX) SFX.eat();
        placeFood();
      } else {
        snake.pop();
      }
      draw();
      schedule();
    }

    function draw() {
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) cells[y][x].className = "sk-cell";
      cells[food.y][food.x].className = "sk-cell food";
      snake.forEach(function (s, i) {
        cells[s.y][s.x].className = "sk-cell " + (i === 0 ? "head" : "body");
      });
    }

    function gameOver() {
      alive = false;
      clearTimeout(timer);
      if (window.SFX) SFX.over();
      var isBest = score > best;
      if (isBest) { best = score; bestEl.textContent = best; try { localStorage.setItem("dr5hn_snake_best", String(best)); } catch (e) {} }
      var over = document.createElement("div");
      over.className = "snake-over";
      over.innerHTML =
        '<div class="so-title">GAME OVER</div>' +
        '<div class="so-score">score <b>' + score + '</b>' + (isBest ? ' <span class="amber">★ new best!</span>' : ' <span class="faint">· best ' + best + '</span>') + '</div>' +
        '<div class="so-collected faint">' + (collected.length ? "collected " + collected.length + ": " + collected.join(" · ") : "no cities collected — try again!") + '</div>' +
        '<div class="so-btns"><button class="so-btn again" id="sk-again">▶ play again</button><button class="so-btn quit" id="sk-quit2">quit to terminal</button></div>';
      boardEl.appendChild(over);
      over.querySelector("#sk-again").addEventListener("click", function () { over.remove(); reset(); });
      over.querySelector("#sk-quit2").addEventListener("click", function () { exit(); });
    }

    function setDir(code) {
      var map = { U: { x: 0, y: -1 }, D: { x: 0, y: 1 }, L: { x: -1, y: 0 }, R: { x: 1, y: 0 } };
      var nd = map[code]; if (!nd) return;
      // can't reverse directly
      if (nd.x === -dir.x && nd.y === -dir.y) return;
      nextDir = nd;
    }

    function togglePause() {
      if (!alive) return;
      paused = !paused;
      wrap.classList.toggle("paused", paused);
      if (!paused) schedule();
    }

    // ---- input ----
    function onKey(e) {
      var k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") { setDir("U"); e.preventDefault(); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { setDir("D"); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { setDir("L"); e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { setDir("R"); e.preventDefault(); }
      else if (k === " ") { togglePause(); e.preventDefault(); }
      else if (k === "q" || k === "Q" || k === "Escape") { exit(); e.preventDefault(); }
    }
    window.addEventListener("keydown", onKey, true);

    // d-pad + buttons
    wrap.querySelectorAll(".dk[data-d]").forEach(function (b) {
      b.addEventListener("click", function () { setDir(b.getAttribute("data-d")); });
    });
    wrap.querySelector("#sk-pause").addEventListener("click", togglePause);
    wrap.querySelector("#sk-quit").addEventListener("click", function () { exit(); });

    // swipe on board (mobile)
    var tsx = 0, tsy = 0;
    boardEl.addEventListener("touchstart", function (e) { var t = e.touches[0]; tsx = t.clientX; tsy = t.clientY; }, { passive: true });
    boardEl.addEventListener("touchend", function (e) {
      var t = e.changedTouches[0]; var dx = t.clientX - tsx, dy = t.clientY - tsy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "R" : "L"); else setDir(dy > 0 ? "D" : "U");
    }, { passive: true });

    function exit() {
      if (ended) return; ended = true;
      alive = false; clearTimeout(timer);
      window.removeEventListener("keydown", onKey, true);
      var summary = collected.length
        ? "snake: collected " + collected.length + " cities, score " + score + " (best " + best + ")."
        : "snake: thanks for playing! (best " + best + ")";
      onExit(summary);
    }

    reset();
    return exit;
  };
})();
