import { FastingPattern } from "./types";
import { loadLang, t } from "./i18n";
import { LocalStorageAdapter } from "./storage/local";

(window as any).adapter = new LocalStorageAdapter();

// Load user language preference synchronously from profile
(window as any).adapter?.loadProfile().then((p: any) => {
  loadLang(p?.lang || "en");
  renderApp();  // re-render after language loaded
}).catch(() => {
  loadLang("en");
  renderApp();
});

const patterns: { key: FastingPattern; label: string; note: string }[] = [
  { key: "16:8", label: "16:8", note: "16h fast / 8h window" },
  { key: "5:2", label: "5:2", note: "5 days normal / 2 light" },
  { key: "OMAD", label: "OMAD", note: "One meal a day" },
  { key: "custom", label: "Custom", note: "Your own rhythm" },
];

export function renderApp(): HTMLElement {
  const app = document.getElementById("app")!;
  app.className = "app";

  app.innerHTML = `
    <header>
      <div class="header-row">
        <h1>${t("app.title")}</h1>
        <a href="#/profile" class="header-link">${t("nav.profile")}</a>
      </div>
      <p>${t("app.subtitle")}</p>
    </header>

    <section class="card">
      <h2>${t("today.label")}</h2>
      <div id="today-row" class="checkbox-row">
        <label for="today-check">${t("today.label")}</label>
        <input id="today-check" type="checkbox" />
      </div>
      <p class="small">${t("today.note")}</p>
    </section>

    <section class="card timer-ring-card" id="timer-card">
      <h2 class="timer-card-title">${t("tracking.fast")}</h2>
      <div class="mode-pills"><button id="mode-elapsed" class="pill active">${t("timer.elapsed")}</button><button id="mode-remaining" class="pill">${t("timer.remaining")}</button></div>
      <div class="ring-wrap">
        <svg viewBox="0 0 200 200" class="fast-ring">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#eae8e0" stroke-width="12" />
          <circle id="fast-progress" cx="100" cy="100" r="80" fill="none" stroke="#7fbf7f" stroke-width="12" stroke-linecap="round" stroke-dasharray="502.65" stroke-dashoffset="502.65" transform="rotate(-90 100 100)" />
        </svg>
        <div id="timer-display" class="ring-time"><span id="timer-time">00:00:00</span></div>
      </div>
      <div class="timer-controls">
        <button id="timer-minus" class="timer-btn" aria-label="Subtract hour">−</button>
        <span class="timer-window">${(window.localStorage.getItem("fast-hours") || "16") + " " + t("timer.unit")}</span>
        <button id="timer-plus" class="timer-btn" aria-label="Add hour">+</button>
      </div>
      <button id="timer-start" class="primary-btn timer-start">${t("timer.start")}</button>
    </section>

    <section class="card">
      <h2>${t("review.title")}</h2>
      <div id="weekly-stats"></div>
    </section>



    <footer>
      ${t("footer.note")}
    </footer>

    <div id="fast-history-modal" class="fast-history-modal" style="display:none;">
      <div class="modal-inner">
        <h3>Previous Fasts</h3>
        <div id="history-list"></div>
        <div class="history-pag" style="display:flex;gap:8px;margin-top:10px;align-items:center;">
          <button onclick="(window as any).historyPage = Math.max(0,(window.historyPage||1)-1); openFastHistory();" class="btn-secondary">&lt;</button>
          <span style="font-size:11px;color:var(--muted-foreground);">page <span id="history-page-num">1</span></span>
          <button onclick="(window as any).historyPage = ((window.historyPage||1)+1); openFastHistory();" class="btn-secondary">&gt;</button>
        </div>
        <button onclick="var el=document.getElementById('fast-history-modal'); if(el) el.style.display='none';" style="margin-top:12px;padding:6px 14px;background:var(--border);border:none;border-radius:6px;cursor:pointer;">Close</button>
      </div>
    </div>
  `;

  // Profile link navigation
  const profileLink = app.querySelector('a[href="#/profile"]');
  if (profileLink) {
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      import("./profile").then((m) => m.renderProfile(app));
    });
  }

  // Simple interaction hook — keeps function separate from style
  const todayCheck = app.querySelector<HTMLInputElement>("#today-check")!;
  todayCheck.addEventListener("change", () => {
    const completed = todayCheck.checked;
    todayCheck.parentElement!.classList.toggle("completed", completed);
    // Persist to test-entries: today (Sat 2026-09-13) = completed true/false/null
    const todayStr = new Date().toISOString().split("T")[0];
    const raw = window.localStorage.getItem("test-entries");
    const entries = raw ? JSON.parse(raw) : [];
    const idx = entries.findIndex((e: any) => e.date === todayStr);
    const entry = { date: todayStr, completed: completed ? true : (completed === false ? false : null) };
    if (idx >= 0) entries[idx] = entry; else entries.push(entry);
    window.localStorage.setItem("test-entries", JSON.stringify(entries));
    renderWeeklyStats(app); // refresh dots
  });

  renderWeeklyStats(app);

  // Frame-based timer for accuracy (requestAnimationFrame)
  let animFrame: number;
  const updateTimer = () => {
    const timerTime = document.getElementById("timer-time")!;
    if (!timerTime) return;
    const profileRaw = window.localStorage.getItem("profile");
    const savedProfile = profileRaw ? JSON.parse(profileRaw) : null;
    // Vietnam ICT (UTC+7): interpret profile times in local Vietnam time
    const eatingEndStr = savedProfile?.endTime ? (() => {
      const [h, m] = savedProfile.endTime.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      // Offset UTC by -7h for Vietnam local interpretation (stored as UTC base)
      const utcMs = d.getTime() - 7 * 3600000;
      return new Date(utcMs).toISOString();
    })() : null;
    const baseStr = window.localStorage.getItem("timer-base") || eatingEndStr || new Date().toISOString();
    // Read pattern once (already read above at line 90-92; re-use savedProfile)
    const savedPattern = savedProfile?.pattern as string || "custom";
    // For 16:8: fast window = 16h (counted from eating end); feed window = 8h
    const savedHours = window.localStorage.getItem("fast-hours") ? parseInt(window.localStorage.getItem("fast-hours")!, 10) : 16;
    const FAST_WINDOW_H = savedHours;
    const base = baseStr ? new Date(baseStr) : new Date();
    const elapsedMs = Date.now() - base.getTime();
    const remainingMs = FAST_WINDOW_H * 3600000 - elapsedMs;
    if (showRemaining) {
      const sign = remainingMs < 0 ? "-" : "";
      const absMs = Math.abs(remainingMs);
      const h = Math.floor(absMs / 3600000);
      const m = Math.floor((absMs % 3600000) / 60000);
      const s = Math.floor((absMs % 60000) / 1000);
      timerTime.textContent = `${sign}${[h, m, s].map((n) => String(n).padStart(2, "0")).join(":")}`;
    } else {
      const h = Math.floor(elapsedMs / 3600000);
      const m = Math.floor((elapsedMs % 3600000) / 60000);
      const s = Math.floor((elapsedMs % 60000) / 1000);
      timerTime.textContent = `${[h, m, s].map((n) => String(n).padStart(2, "0")).join(":")}`;
    }
    const lblFast = document.getElementById("timer-label-text");
    if (lblFast) lblFast.textContent = showRemaining ? "Remaining" : "Elapsed";
    // Progress ring: fill based on elapsed / 24h (full circle = 24h)
    const progressEl = document.getElementById("fast-progress") as SVGCircleElement | null;
    if (progressEl) {
      const totalMs = 24 * 3600000; // ring = 24 hours
      const pct = Math.min(1, Math.max(0, elapsedMs / totalMs));
      const dashOffset = 502.65 - (502.65 * pct); // circumference of r=80 circle ~2*pi*80 ≈ 502.65
      progressEl.style.strokeDashoffset = String(dashOffset);
    }
    animFrame = requestAnimationFrame(updateTimer);
  };
  animFrame = requestAnimationFrame(updateTimer);

  // Override: reset timer base to now (handles oversleeping)
  // Adjust fast window hours (+ / -)
  document.getElementById("timer-plus")?.addEventListener("click", () => {
    const raw = window.localStorage.getItem("fast-hours");
    const current = raw ? parseInt(raw, 10) : 16;
    const updated = Math.min(24, current + 1);
    window.localStorage.setItem("fast-hours", String(updated));
    document.querySelector(".timer-window")!.textContent = `${updated} ${t("timer.unit")}`;
  });
  document.getElementById("timer-minus")?.addEventListener("click", () => {
    const raw = window.localStorage.getItem("fast-hours");
    const current = raw ? parseInt(raw, 10) : 16;
    const updated = Math.max(4, current - 1);
    window.localStorage.setItem("fast-hours", String(updated));
    document.querySelector(".timer-window")!.textContent = `${updated} ${t("timer.unit")}`;
  });

  // Start / Stop fast toggle
  const startBtn = document.getElementById("timer-start")!;
  const setBtnState = () => {
    const running = !!window.localStorage.getItem("timer-base");
    startBtn.textContent = running ? t("timer.stop") : t("timer.start");
    // Lock +/- selectors when fast is running
    const controls = document.querySelector(".timer-controls");
    if (controls) (controls as HTMLElement).classList.toggle("locked", running);
  };
  setBtnState();
  startBtn.addEventListener("click", () => {
    const running = !!window.localStorage.getItem("timer-base");
    if (running) {
      window.localStorage.removeItem("timer-base");
    } else {
      window.localStorage.setItem("timer-base", new Date().toISOString());
    }
    setBtnState();
  });

  // Pill toggle: Elapsed / Remaining
  let showRemaining = false;
  document.getElementById("mode-elapsed")?.addEventListener("click", () => {
    showRemaining = false;
    document.getElementById("mode-elapsed")!.textContent = t("timer.elapsed");
    document.getElementById("mode-remaining")!.textContent = t("timer.remaining");
    document.getElementById("mode-elapsed")!.classList.add("active");
    document.getElementById("mode-remaining")!.classList.remove("active");
  });
  document.getElementById("mode-remaining")?.addEventListener("click", () => {
    showRemaining = true;
    document.getElementById("mode-elapsed")!.textContent = t("timer.elapsed");
    document.getElementById("mode-remaining")!.textContent = t("timer.remaining");
    document.getElementById("mode-remaining")!.classList.add("active");
    document.getElementById("mode-elapsed")!.classList.remove("active");
  });

  document.getElementById("timer-override")?.addEventListener("click", () => {
    window.localStorage.setItem("timer-base", new Date().toISOString());
  });

  return app;
}

function renderWeeklyStats(app: HTMLElement) {
  const container = app.querySelector("#weekly-stats")!;
  const raw = window.localStorage.getItem("test-entries");
  const entries = raw ? JSON.parse(raw) : [];
  const days = [t("days.mon"),t("days.tue"),t("days.wed"),t("days.thu"),t("days.fri"),t("days.sat"),t("days.sun")];
  // Map weekday index (0=Mon...6=Sun) from entry.date (ISO YYYY-MM-DD)
  const entryByDay: (typeof entries[0] | undefined)[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
  entries.forEach((e) => {
    if (!e || !e.date) return;
    const d = new Date(e.date + "T00:00:00");
    const wd = d.getDay(); // 0=Sun ... 6=Sat; remap
    const idx = wd === 0 ? 6 : wd - 1; // Sun(0)->6, Mon(1)->0 ... Sat(6)->5
    entryByDay[idx] = e;
  });
  container.innerHTML = `
        <div class="weekly-row">
      ${[0,1,2,3,4,5,6].map(i => {
        const d = days[i];
        const entry = entryByDay[i];
        let cls = "indicator";
        if (entry) {
          if (entry.completed === true) cls = "active";
          else if (entry.completed === false && entry.completed !== null) cls = "missed";
        }
        const labelText = d.length > 3 ? d.substring(0, 3) : d;
        return `<div class="week-day"><span class="dot ${cls}" title="${d}"></span><span class="label">${labelText}</span></div>`;
      }).join("")}
    </div>
    <p class="review-stat">${t("review.completed", { count: 3, total: 7 })}</p>
    <p class="review-stat">${t("review.streak", { days: 2 })}</p>
    <p class="small review-note">${t("review.note")}</p>
    <button onclick="openFastHistory()" class="btn-secondary">Previous Fasts</button>
  `;
}

function fmtMs(ms: number) { const h = Math.round(ms / 3600000); const m = Math.round((ms % 3600000) / 60000); return h + ' hrs, ' + m + ' mins'; }
function openFastHistory() { const m = document.getElementById('fast-history-modal'); if (m) { m.style.display = 'flex'; adapter.loadAll().then((recs: any[]) => { const list = document.getElementById('history-list'); if (list) list.innerHTML = (recs || []).slice(0,7).map((r: any) => `<div style="padding:6px 0;border-bottom:1px solid #eae8e0"><strong>${r.pattern || '-'}</strong> — ${r.startTime?.slice(0,10) || '-'} → ${r.endTime?.slice(0,10) || '-'} | ${r.durationMs ? fmtMs(r.durationMs) : '-'} | ${r.completed === true ? 'done' : r.completed === false ? 'missed' : '-'}</div>`).join('') || '<div style="color:#8a8780;padding:12px 0">No records yet</div>'; }); } else alert('History modal not found'); }
(window as any).openFastHistory = openFastHistory;
function syncToCloud() { alert('Sync: adapter.loadAll() -> SQLite (userId); OAuth/account future scope.'); }
