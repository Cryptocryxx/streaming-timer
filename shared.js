(function () {
  const CFG = window.TIMER_CONFIG;

  const DEFAULT_SETTINGS = {
    title: "",
    warnBlinkSec: 600,   // einmal orange blinken
    warnColorSec: 60,    // ab hier dauerhaft orange
    critBlinkSec: 10,    // ab hier rot blinkend
    colorNormal: "#ffffff",
    colorWarn: "#ff9800",
    colorCrit: "#ff1744",
    bg: "#000000",
    endText: "ZEIT ABGELAUFEN",
    showTitle: true
  };

  const DEFAULT_STATE = {
    rev: 0,
    running: false,
    endAt: 0,
    remainingMs: 5 * 60 * 1000,
    settings: DEFAULT_SETTINGS
  };

  function getTopic() {
    const p = new URLSearchParams(location.search).get("t");
    return p || localStorage.getItem("timer_topic") || CFG.topic;
  }

  function remaining(state, now) {
    return state.running ? Math.max(0, state.endAt - now) : state.remainingMs;
  }

  function format(ms) {
    const total = Math.ceil(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const p = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  }

  // Rendert den Timer in das Element `root` (enthält .t-time, .t-title, .t-end)
  function render(root, state, now) {
    const s = Object.assign({}, DEFAULT_SETTINGS, state.settings);
    const ms = remaining(state, now);
    const sec = ms / 1000;
    const timeEl = root.querySelector(".t-time");
    const titleEl = root.querySelector(".t-title");
    const endEl = root.querySelector(".t-end");

    const text = format(ms);
    timeEl.textContent = text;

    const finished = ms <= 0;
    const crit = sec <= s.critBlinkSec;               // rot blinken (inkl. 0)
    const warn = !crit && sec <= s.warnColorSec;      // dauerhaft orange
    // einmaliges Blinken in den 5 Sekunden nach Unterschreiten der Schwelle (nur wenn Timer läuft)
    const flash = state.running && !crit && !warn &&
      sec <= s.warnBlinkSec && sec > s.warnBlinkSec - 5;

    root.style.setProperty("--bg", s.bg);
    root.style.setProperty("--c-normal", s.colorNormal);
    root.style.setProperty("--c-warn", s.colorWarn);
    root.style.setProperty("--c-crit", s.colorCrit);
    root.classList.toggle("is-warn", warn);
    root.classList.toggle("is-crit", crit);
    root.classList.toggle("is-finished", finished);
    root.classList.toggle("is-flash", flash);

    // Blinken der Ziffern: ab warnColorSec mit ~1 Hz, Frequenz steigt exponentiell bis ~8 Hz bei 0.
    // Die Phase wird direkt aus der Restzeit berechnet (Integral der Frequenz) -> kein Zustand nötig.
    const T = s.warnColorSec, F_MIN = 1, F_MAX = 8;
    if (state.running && !finished && T > 0 && sec <= T) {
      const k = Math.log(F_MAX / F_MIN) / T;
      const phase = (F_MIN / k) * (Math.exp(k * (T - sec)) - 1);
      timeEl.style.opacity = (phase % 1) < 0.5 ? "1" : "0.08";
    } else {
      timeEl.style.opacity = "";
    }

    titleEl.textContent = s.title;
    titleEl.style.display = s.showTitle && s.title ? "" : "none";
    endEl.textContent = finished ? s.endText : "";

    // Schriftgröße an Fläche anpassen
    const w = root.clientWidth, h = root.clientHeight;
    const size = Math.min((w * 0.94) / (text.length * 0.6), h * 0.6);
    timeEl.style.fontSize = size + "px";
  }

  // ntfy: Zustand senden
  async function publish(state) {
    const res = await fetch(`${CFG.server}/${encodeURIComponent(getTopic())}`, {
      method: "POST",
      body: JSON.stringify(state)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  }

  // ntfy: Zustand empfangen (letzter Stand beim Verbinden + Live-Updates)
  function subscribe(onState, onStatus) {
    let es;
    function connect() {
      es = new EventSource(`${CFG.server}/${encodeURIComponent(getTopic())}/sse?since=latest`);
      es.onopen = () => onStatus && onStatus(true);
      es.onerror = () => onStatus && onStatus(false);
      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event !== "message") return;
          onState(JSON.parse(msg.message));
        } catch (_) {}
      };
    }
    connect();
    return () => es && es.close();
  }

  window.Timer = { CFG, DEFAULT_SETTINGS, DEFAULT_STATE, getTopic, remaining, format, render, publish, subscribe };
})();
