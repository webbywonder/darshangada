/* ============================================================
   dr5hn OS — sfx.js
   Synthesized Web Audio sound effects. No audio files.
   Muted by default; only starts after a user gesture.

   window.SFX.setEnabled(bool) / .enabled
   window.SFX.key() .blip() .beep() .eat() .over() .error()
   ============================================================ */
(function () {
  "use strict";
  var ctx = null;
  var enabled = false;
  try { enabled = localStorage.getItem("dr5hn_sound") === "1"; } catch (e) {}

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  // a short synth tone
  function tone(freq, dur, type, gain, slideTo) {
    var ac = ensure();
    if (!ac) return;
    var t0 = ac.currentTime;
    var osc = ac.createOscillator();
    var g = ac.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
    var peak = (gain == null ? 0.05 : gain);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  window.SFX = {
    get enabled() { return enabled; },
    setEnabled: function (v) {
      enabled = !!v;
      try { localStorage.setItem("dr5hn_sound", enabled ? "1" : "0"); } catch (e) {}
      if (enabled) { ensure(); this.blip(); }
    },
    key: function () { tone(420 + Math.random() * 80, 0.025, "square", 0.022); },
    blip: function () { tone(660, 0.06, "triangle", 0.05); },
    beep: function () { tone(880, 0.09, "sine", 0.05); },
    eat: function () { tone(540, 0.07, "square", 0.05, 900); },
    over: function () { tone(300, 0.32, "sawtooth", 0.06, 90); },
    error: function () { tone(160, 0.18, "square", 0.05, 110); },
  };
})();
