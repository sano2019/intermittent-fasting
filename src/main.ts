import { FastingPattern } from "./types";
import { loadLang, t } from "./i18n";
import { LocalStorageAdapter } from "./storage/local";

(window as any).adapter = new LocalStorageAdapter();

// Load user language preference synchronously from profile
(window as any).adapter
  ?.loadProfile()
  .then((p: any) => {
    loadLang(p?.lang || "en");
    renderApp(); // re-render after language loaded
  })
  .catch(() => {
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
  // Read profile pattern before building HTML (used in timer-controls and timer-window)
  const savedPattern = (window.localStorage.getItem("profile-pattern") as string) || "custom";
  const savedHours = window.localStorage.getItem("fast-hours") ? parseInt(window.localStorage.getItem("fast-hours")!, 10) : 16;
  const FAST_WINDOW_H = ("OMAD" === savedPattern || window.localStorage.getItem("profile-pattern") === "OMAD") ? 24 : ("16:8" === savedPattern || window.localStorage.getItem("profile-pattern") === "16:8") ? 16 : savedHours;

  app.innerHTML = `
    <header>
      <div class="header-row">
        <h1>${t("app.title")}</h1>
        <a href="#/profile" class="header-link">${t("nav.profile")}</a>
      </div>
      <p>${t("app.subtitle")}</p>
    </header>

    <section class="card timer-ring-card" id="timer-card">
      ${savedPattern === "5:2" || window.localStorage.getItem("profile-pattern") === "5:2" ? `
      <h2 class="timer-card-title">5:2 · ${t("timer.calorie_day") || "Calorie Day"}</h2>
      <div class="cal-display" style="text-align:center;margin:10px 0 8px;">
        <span id="cal-total" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:2.6rem;color:#c7bfae;line-height:1.1;">0</span>
        <div style="font-size:.78rem;color:#6e6c60;margin-top:4px;">kcal · light day — <span id="light-date" style="font-family:'DM Sans',system-ui,sans-serif;color:#a9a591;font-size:.72rem;letter-spacing:.03em;">—</span></div>
      </div>
      <label style="display:block;font-size:.8rem;color:#6e6c60;margin-bottom:6px;font-family:'DM Sans',system-ui,sans-serif;letter-spacing:.01em;">Cal intake <span style="font-size:.7rem;color:#a9a591;font-weight:300;">(enter each meal; accumulates)</span></label>
      <div style="display:flex;gap:6px;align-items:center;">
        <input id="cal-intake" type="number" min="0" placeholder="kcal" style="flex:1;padding:.55rem .75rem;border-radius:.75rem;border:1px solid #eae8e0;background:#fff;font-family:'DM Sans',system-ui,sans-serif;font-size:.95rem;color:#222;outline:none;letter-spacing:.01em;" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0,4);" aria-label="Calorie entry" />
        <button onclick="addCalEntry()" style="padding:.55rem .9rem;border-radius:.75rem;border:1px solid #c7bfae;background:#fff;color:#222;font-family:'DM Sans',system-ui,sans-serif;font-size:.85rem;letter-spacing:.01em;font-weight:500;">+</button>
      </div>
      <div style="font-size:.78rem;color:#c7bfae;margin-top:10px;line-height:1.4;">Suggested: <b>600 cal</b> (men) · <b>500 cal</b> (women)</div>
      <div style="margin-top:4px;font-size:.7rem;color:#6e6c60;font-family:'DM Sans',system-ui,sans-serif;letter-spacing:.01em;">Each entry accumulates. <button onclick="clearCalDay()" style="background:none;border:none;color:#c7bfae;text-decoration:underline;font-size:.7rem;font-family:inherit;cursor:pointer;">Clear</button> resets for the next light day.</div>
      <button id="btn-light-day" class="primary-btn timer-start" onclick="toggleLightDay()" style="margin-top:.8rem;width:100%;padding:.75rem;border-radius:.75rem;background:#c7bfae;color:#222;font-family:DM Sans,system-ui,sans-serif;font-weight:500;letter-spacing:.01em;">Start light day</button>
      ` : `
      <h2 class="timer-card-title">${t("tracking.fast")}</h2>
      <div class="mode-pills"><button id="mode-elapsed" class="pill active">${t("timer.elapsed")}</button><button id="mode-remaining" class="pill">${t("timer.remaining")}</button></div>
      <div class="ring-wrap">
        <svg viewBox="0 0 200 200" class="fast-ring">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#eae8e0" stroke-width="12" />
          <circle id="fast-progress" cx="100" cy="100" r="80" fill="none" stroke="#7fbf7f" stroke-width="12" stroke-linecap="round" stroke-dasharray="502.65" stroke-dashoffset="502.65" transform="rotate(-90 100 100)" />
        </svg>
        <div id="timer-display" class="ring-time"><span id="timer-time">00:00:00</span></div>
      </div>
      <div class="timer-controls" ${savedPattern === "16:8" || savedPattern === "OMAD" || window.localStorage.getItem("profile-pattern") === "16:8" || window.localStorage.getItem("profile-pattern") === "OMAD" ? 'style="display:none;"' : ''}>
        <button id="timer-minus" class="timer-btn" aria-label="Subtract hour">−</button>
        <span class="timer-window">${FAST_WINDOW_H + " " + t("timer.unit")}</span>
        <button id="timer-plus" class="timer-btn" aria-label="Add hour">+</button>
      </div>
      <span id="btn-adjust-wrapper" class="btn-adjust-wrapper" style="display:none;">${(window.localStorage.getItem('timer-base') ? `<button onclick="document.getElementById('adjust-start-modal').style.display='flex';document.getElementById('adjust-start-time').value=window.localStorage.getItem('timer-base')?(() => { const d = new Date(window.localStorage.getItem('timer-base')||''); if(isNaN(d.getTime())){d=new Date();} const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); })():(() => { const d = new Date(); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); })();" class="btn-secondary" id="btn-adjust-start">Adjust start time</button>` : `<button onclick="document.getElementById('adjust-start-modal').style.display='flex';document.getElementById('adjust-start-time').value=window.localStorage.getItem('timer-base')?(() => { const d = new Date(window.localStorage.getItem('timer-base')||''); if(isNaN(d.getTime())){d=new Date();} const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); })():(() => { const d = new Date(); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); })();" class="btn-secondary" id="btn-adjust-start">Adjust start time</button>`)}</span>
      <button id="timer-start" class="primary-btn timer-start">${t("timer.start")}</button>
      `}
    </section>

    <section class="card">
      <h2>${t("review.title")}</h2>
      <div id="weekly-stats"></div>
    </section>



    <footer>
      ${t("footer.note")}
    </footer>

    <div id="adjust-start-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:60; align-items:center; justify-content:center;"><div class="modal-inner card" style="padding:1.5rem; max-width:340px; width:92%;"><h3 class="label" style="margin-top:0;">Adjust start time</h3><p style="margin:1rem 0;">Start: <input type="datetime-local" id="adjust-start-time" style="min-height:48px; font-size:1.05rem; padding:0.5rem;" /></p><div style="display:flex; flex-direction:column; gap:0.75rem; align-items:stretch; margin-top:1rem;"><button onclick="document.getElementById('adjust-start-modal').style.display='none';" class="btn" style="min-height:48px; padding:0.75rem; font-size:1.05rem;">Cancel</button><button onclick="const s=document.getElementById('adjust-start-time')?.value; if(s){ window.localStorage.setItem('timer-base', new Date(s).toISOString()); } document.getElementById('adjust-start-modal').style.display='none';" class="btn" style="min-height:48px; padding:0.75rem; font-size:1.05rem; background:var(--accent);">Save</button></div></div></div>

    <div id="fast-save-modal" class="fast-save-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:60; align-items:center; justify-content:center;">
      <div class="modal-inner card" style="padding:1.5rem; max-width:340px; width:92%; border-radius:1.25rem;">
        <h3>Confirm Fast</h3>
        <p>Duration: <span id="fast-save-duration"></span></p>
        <label style="font-weight:500;">Pattern: <select id="fast-save-pattern" style="min-height:48px; font-size:1.05rem; padding:0.5rem; border-radius:0.75rem;"><option value="">(blank)</option><option>16:8</option><option>5:2</option><option>OMAD</option><option>custom</option></select></label>
        <p style="margin:1rem 0;">Start: <input type="datetime-local" id="fast-save-start" style="min-height:48px; font-size:1.05rem; padding:0.5rem; border-radius:0.75rem; width:100%; box-sizing:border-box;" /></p>
        <p style="margin:0.5rem 0;">End: <input type="datetime-local" id="fast-save-end" style="min-height:48px; font-size:1.05rem; padding:0.5rem; border-radius:0.75rem; width:100%; box-sizing:border-box;" /></p>
        <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:stretch; margin-top:1.25rem;">
          <button onclick="document.getElementById('fast-save-modal').style.display='none';window.localStorage.removeItem('timer-base');window.localStorage.removeItem('fast-pattern');setBtnState();" class="btn" style="min-height:48px; padding:0.75rem; font-size:1.05rem; border-radius:0.75rem;">Cancel</button>
          <button onclick="const s=document.getElementById('fast-save-start')?.value||'';const e=document.getElementById('fast-save-end')?.value||'';const p=document.getElementById('fast-save-pattern')?.value||'';const dur=Math.max(0,new Date(e||Date.now()).getTime()-new Date(s||window.localStorage.getItem('timer-start')||Date.now()).getTime());const arr=JSON.parse(window.localStorage.getItem('fast-records-v1')||'[]');const editId=window.editRecordId||null; if(editId){ const idx=arr.findIndex(x=>x.id===editId); if(idx>=0){ arr[idx]={...arr[idx],startTime:s||arr[idx].startTime,endTime:e||arr[idx].endTime,durationMs:dur,pattern:p||arr[idx].pattern}; } } else { arr.push({id:'fast-'+Date.now(),startTime:s||new Date().toISOString(),endTime:e||new Date().toISOString(),durationMs:dur,completed:true,pattern:p,createdAt:new Date().toISOString()}); } window.localStorage.setItem('fast-records-v1',JSON.stringify(arr));document.getElementById('fast-save-modal').style.display='none';window.localStorage.removeItem('timer-base');window.localStorage.removeItem('fast-pattern');window.editRecordId=null;openFastHistory();setBtnState();" class="btn" style="min-height:48px; padding:0.75rem; font-size:1.05rem; background:var(--accent); border-radius:0.75rem;">Save</button>
        </div>
      </div>
    </div>

    <div id="delete-confirm-modal" class="fast-history-modal" style="display:none; z-index:60;">
      <div class="modal-inner" style="text-align:center; padding:2rem;">
        <h3 class="label">${t("delete.confirm")}</h3>
        <p class="label-delete-note">${t("delete.note")}</p>
        <div class="delete-btn-row">
          <button onclick="document.getElementById('delete-confirm-modal').style.display='none'; window.deleteConfirmId=null;" class="delete-btn-cancel">${t("delete.cancel")}</button>
          <button onclick="deleteConfirm()" class="delete-btn-confirm">${t("delete.confirm_btn")}</button>
        </div>
      </div>
    </div>
    <div id="fast-history-modal" class="fast-history-modal" class="btn-adjust-wrapper" style="display:none;">
      <div class="modal-inner">
        <h3>${t("history.title")}</h3>
        <div id="history-list"></div>
        <div class="history-pag">
          <button id="pag-prev" onclick="window.historyPage = Math.max(1,(window.historyPage||1)-1); openFastHistory();" class="btn-secondary">&lt;</button>
          <span class="history-pag-num">page <span id="history-page-num">1</span> / <span id="history-total-pages">1</span></span>
          <button id="pag-next" onclick="window.historyPage = Math.min(99,(window.historyPage||1)+1); openFastHistory();" class="btn-secondary">&gt;</button>
        </div>
        <button onclick="var el=document.getElementById('fast-history-modal'); if(el) el.style.display='none';" class="history-close-btn">${t("action.close")}</button>
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

  // Timer start/stop interaction — timer-card handles tracking
  renderWeeklyStats(app);

  // Frame-based timer for accuracy (requestAnimationFrame)
  let animFrame: number;
  const updateTimer = () => {
    const timerTime = document.getElementById("timer-time")!;
    if (!timerTime) return;
    const profileRaw = window.localStorage.getItem("profile");
    const savedProfile = profileRaw ? JSON.parse(profileRaw) : null;
    // Vietnam ICT (UTC+7): interpret profile times in local Vietnam time
    const eatingEndStr = savedProfile?.endTime
      ? new Date(savedProfile.endTime).toISOString()
      : null;
    const baseStr =
      window.localStorage.getItem("timer-base") ||
      eatingEndStr ||
      new Date().toISOString();
    // Pattern already read at top-level savedPattern (line 29); re-use it here
    // For 16:8: fast window = 16h (counted from eating end); feed window = 8h
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
    const progressEl = document.getElementById(
      "fast-progress",
    ) as SVGCircleElement | null;
    if (progressEl) {
      const totalMs = 24 * 3600000; // ring = 24 hours
      const pct = Math.min(1, Math.max(0, elapsedMs / totalMs));
      const dashOffset = 502.65 - 502.65 * pct; // circumference of r=80 circle ~2*pi*80 ≈ 502.65
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
    document.querySelector(".timer-window")!.textContent =
      `${updated} ${t("timer.unit")}`;
  });
  document.getElementById("timer-minus")?.addEventListener("click", () => {
    const raw = window.localStorage.getItem("fast-hours");
    const current = raw ? parseInt(raw, 10) : 16;
    const updated = Math.max(4, current - 1);
    window.localStorage.setItem("fast-hours", String(updated));
    document.querySelector(".timer-window")!.textContent =
      `${updated} ${t("timer.unit")}`;
  });

  // Start / Stop fast toggle
  const startBtn = document.getElementById("timer-start");
  const setBtnState = () => {
    if (!startBtn) return; // profile may use light-day toggle instead of timer-start
    const running = !!window.localStorage.getItem("timer-base");
    startBtn.textContent = running ? t("timer.stop") : t("timer.start");
    // Lock +/- selectors when fast is running
    const controls = document.querySelector(".timer-controls");
    if (controls) (controls as HTMLElement).classList.toggle("locked", running);
    const btnWrap = document.getElementById("btn-adjust-wrapper");
    if (btnWrap) (btnWrap as HTMLElement).style.display = running ? "inline-block" : "none";
  };
  setBtnState();
  (window as any).setBtnState = setBtnState;
  if (startBtn) startBtn.addEventListener("click", () => {
    const running = !!window.localStorage.getItem("timer-base");
    if (running) {
      // Confirm save: duration + pattern select before clearing timer-base
      const baseStr = window.localStorage.getItem("timer-base")!;
      const start = new Date(baseStr).getTime();
      const now = Date.now();
      const durationMs = Math.max(0, now - start);
      const profile = window.adapter
        ? window.adapter.loadProfile
          ? null
          : null
        : null; // stub: adapter.loadProfile async; deferred full profile read for this step per user's "no inline functions" constraint
      const pattern = window.localStorage.getItem("fast-pattern") || "16:8";
      // Show styled save-confirm modal (separate from #fast-history-modal display flow)
      const modal = document.getElementById("fast-save-modal") as HTMLElement;
      const durSpan = document.getElementById(
        "fast-save-duration",
      ) as HTMLElement;
      const patSelect = document.getElementById(
        "fast-save-pattern",
      ) as HTMLSelectElement;
      durSpan.textContent = fmtMs(durationMs);
      const startInput = document.getElementById(
        "fast-save-start",
      ) as HTMLInputElement;
      const endInput = document.getElementById(
        "fast-save-end",
      ) as HTMLInputElement;
      if (startInput) {
        const d = new Date(baseStr);
        startInput.value = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0") + "T" + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
      }
      if (endInput) {
        const d = new Date();
        endInput.value = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0") + "T" + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
      }
      patSelect.innerHTML = ["", "16:8", "5:2", "OMAD", "custom"]
        .map(
          (p) =>
            `<option value="${p}" ${p === pattern ? "selected" : ""}>${p || "(blank)"}</option>`,
        )
        .join("");
      // Only show meal-time field for OMAD
      const mealRow = document.createElement("div");
      if (pattern === "OMAD" || (patSelect && (patSelect as HTMLSelectElement).value === "OMAD")) {
        mealRow.innerHTML = `<label style="display:block;margin-top:10px;font-size:0.82rem;color:#6e6c60;font-family:DM Sans">Meal at: <input type="time" id="fast-save-meal-time" style="margin-left:8px;border:1px solid #eae8e0;border-radius:0.75rem;padding:6px 8px;font-family:Cormorant Serif;font-size:1rem;background:#fff;color:#232220;" value="${new Date().getHours().toString().padStart(2,"0")}:${new Date().getMinutes().toString().padStart(2,"0")}"></label>`;
        modal.querySelector(".modal-inner")?.appendChild(mealRow);
      }
      if (!baseStr) {
        const sStr = startInput?.value || ""; const eStr = endInput?.value || "";
        if (sStr && eStr) {
          const dMs = Math.max(0, new Date(eStr).getTime() - new Date(sStr).getTime());
          durSpan.textContent = fmtMs ? fmtMs(dMs) : "0 hrs, 0 mins";
        } else {
          durSpan.textContent = fmtMs ? fmtMs(0) : "0 hrs, 0 mins";
        }
      }
      modal.style.display = "flex";
      window.localStorage.removeItem("timer-base");
    } else {
      window.localStorage.setItem("timer-base", new Date().toISOString());
      window.localStorage.setItem(
        "fast-pattern",
        window.localStorage.getItem("profile-pattern") || "16:8",
      );
      // Capture meal-time for OMAD profile
      const mealInput = document.getElementById("fast-save-meal-time") as HTMLInputElement | null;
      if (mealInput && (window.localStorage.getItem("profile-pattern") === "OMAD" || (window.localStorage.getItem("fast-pattern") === "OMAD"))) {
        window.localStorage.setItem("fast-meal-time", mealInput.value || "");
      }
      setBtnState(); // hot-refresh button visibility after start
    }
    setBtnState();
  });

  // Pill toggle: Elapsed / Remaining (default: Remaining per 2026-09-23 update)
  let showRemaining = true;
  // Active/inactive pill states: default = Remaining active, Elapsed inactive
  document.getElementById("mode-remaining")?.classList.add("active");
  document.getElementById("mode-elapsed")?.classList.remove("active");
  document.getElementById("mode-elapsed")?.addEventListener("click", () => {
    showRemaining = false;
    document.getElementById("mode-elapsed")!.textContent = t("timer.elapsed");
    document.getElementById("mode-remaining")!.textContent =
      t("timer.remaining");
    document.getElementById("mode-elapsed")!.classList.add("active");
    document.getElementById("mode-remaining")!.classList.remove("active");
  });
  document.getElementById("mode-remaining")?.addEventListener("click", () => {
    showRemaining = true;
    document.getElementById("mode-elapsed")!.textContent = t("timer.elapsed");
    document.getElementById("mode-remaining")!.textContent =
      t("timer.remaining");
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
  const raw = window.localStorage.getItem("fast-records-v1") || "[]";
  const entries = raw ? JSON.parse(raw) : [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const days = [
    t("days.mon"),
    t("days.tue"),
    t("days.wed"),
    t("days.thu"),
    t("days.fri"),
    t("days.sat"),
    t("days.sun"),
  ];
  // Map weekday index (0=Mon...6=Sun) from entry.date (ISO YYYY-MM-DD)
  const entryByDay: ((typeof entries)[0] | undefined)[] = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];
  entries.forEach((e) => {
    if (!e || !(e.startTime || e.endTime)) return;
    const dStr = (e.startTime || e.endTime || "").slice(0, 10);
    const d = new Date(dStr + "T00:00:00");
    const entryWeek = new Date(d);
    entryWeek.setHours(0, 0, 0, 0);
    entryWeek.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    if (entryWeek.getTime() !== startOfWeek.getTime()) return;
    const wd = d.getDay(); // 0=Sun ... 6=Sat; remap
    const idx = wd === 0 ? 6 : wd - 1; // Sun(0)->6, Mon(1)->0 ... Sat(6)->5
    entryByDay[idx] = e;
  });
  const completedCount = entryByDay.filter(
    (e) => e && (e.durationMs || 0) > 0,
  ).length;
  const missedCount = entryByDay.filter(
    (e) => e && e.startTime && !(e.durationMs || 0),
  ).length;
  const streak = (() => {
    let s = 0;
    for (
      let i = entryByDay.length - 1;
      i >= 0 && entryByDay[i] && (entryByDay[i]!.durationMs || 0) > 0;
      i--
    )
      s++;
    return s;
  })();
  container.innerHTML = `
        <div class="weekly-row">
      ${[0, 1, 2, 3, 4, 5, 6]
        .map((i) => {
          const d = days[i];
          const entry = entryByDay[i];
          let cls = "dot";
          if (entry && entry.pattern) {
            const targetMs = entry.pattern === 'OMAD' ? 86400000 : entry.pattern === '16:8' ? 57600000 : 0;
            const dMs = (entry.durationMs || 0);
            if (targetMs > 0 && dMs > 0 && dMs < targetMs) cls = "dot missed"; // partial: amber
            else if (dMs > 0) cls = "dot active"; // done (green): full target or custom (>0 with no target)
            else cls = "dot missed"; // zero
          } else if (entry && (entry.durationMs || 0) > 0) cls = "dot active"; // custom: any >0 = green
          else if (entry) cls = "dot missed";
          const labelText = d.length > 3 ? d.substring(0, 3) : d;
          return `<div class="week-day"><span class="dot ${cls}" title="${d}"></span><span class="label">${labelText}</span></div>`;
        })
        .join("")}
    </div>
    <p class="review-stat">${t("review.completed", { count: completedCount, total: 7 })}</p>
    <p class="review-stat">${t("review.streak", { days: streak })}</p>
    <p class="small review-note" style="text-align:center">Calm reviews, No penalties</p>
    <div style="display:flex;justify-content:center;margin-top:8px;">
      <button onclick="openFastHistory()" class="btn-secondary">${t("history.button")}</button>
    </div>
  `;
}

function fmtMs(ms: number) {
  const h = Math.round(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return h + " " + t("unit.hrs") + ", " + m + " " + t("unit.mins");
}
function openFastHistory() {
  const page = Math.max(0, (window.historyPage || 1) - 1);
  const m = document.getElementById("fast-history-modal");
  if (m) {
    m.style.display = "flex";
    (window as any).adapter.loadAll().then((recs: any[]) => {
      const sorted = (recs || []).sort(
        (a, b) =>
          new Date(b.startTime || b.endTime || 0).getTime() -
          new Date(a.startTime || a.endTime || 0).getTime(),
      );
      const list = document.getElementById("history-list");
      const totalPages = Math.max(1, Math.ceil(sorted.length / 7));
      const totalSpan = document.getElementById("history-total-pages");
      if (totalSpan) totalSpan.textContent = String(totalPages);
      const prevBtn = document.getElementById("pag-prev") as HTMLElement | null;
      const nextBtn = document.getElementById("pag-next") as HTMLElement | null;
      if (prevBtn) prevBtn.style.display = page <= 0 ? "none" : "inline-block";
      if (nextBtn)
        nextBtn.style.display =
          page >= totalPages - 1 ? "none" : "inline-block";
      const pageNum = document.getElementById("history-page-num");
      if (pageNum) pageNum.textContent = String(window.historyPage || 1);
      if (list)
        list.innerHTML =
          sorted
            .slice(page * 7, (page + 1) * 7)
            .map(
              (r: any) =>
                `<div style="border-radius:1rem; padding:0.75rem 0.5rem; margin-bottom:0.75rem; border-bottom:1px solid #eae8e0; line-height:1.35;">
<span style="font-size:0.75rem; color:#8a8780;">${(() => { const d = new Date(r.startTime||r.endTime||0); const k = ['sun','mon','tue','wed','thu','fri','sat'][d.getDay()]||'mon'; return (typeof t==='function' ? (t('days.'+k)||d.toLocaleDateString('en-GB',{weekday:'short'})) : d.toLocaleDateString('en-GB',{weekday:'short'})); })()} ${new Date(r.startTime||r.endTime||0).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} → ${new Date(r.endTime||r.startTime||0).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
<div style="display:flex;gap:6px; align-items:center; flex-wrap:wrap; margin-top:4px; flex-grow:1;">
<span style="display:inline-block; padding:2px 8px; border-radius:999px; background:#eae8e0; color:#5a574e; font-size:0.8rem; font-weight:600;">${r.pattern||"-"}</span>
<span style="font-size:0.9rem; font-weight:500;">${r.durationMs ? fmtMs(r.durationMs).replace(',','') : "-"}</span>
<span class="indicator ${(() => { const tMs = r.pattern==='OMAD'?86400000:r.pattern==='16:8'?57600000:0; const dMs = (r.durationMs||0); if (tMs>0 && dMs>0 && dMs<tMs) return 'missed'; if (dMs>0) return 'active'; return 'missed'; })()}" style="width:8px;height:8px;border-radius:50%;display:inline-block;" title="${(() => { const tMs = r.pattern==='OMAD'?86400000:r.pattern==='16:8'?57600000:0; const dMs = (r.durationMs||0); const label = (tMs>0 && dMs>0 && dMs<tMs) ? (t('status.partial')||'Partial') : (dMs>0 ? (t('status.done')||'Done') : (t('status.missed')||'Missed')); return label; })()}"></span>
<button onclick='window.editRecordId="${r.id}";openEditRecord("${r.id}")' aria-label="Edit" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:1rem;line-height:1;" title="Edit">✏</button>
<button onclick='window.deleteConfirmId="${r.id}"; document.getElementById("delete-confirm-modal").style.display="flex";' aria-label="Delete" style="background:none;border:none;color:#c7bfae;cursor:pointer;font-size:1rem;line-height:1;" title="Delete">🗑</button>
</div>
</div>`,
            )
            .join("") ||
          '<div style="color:#8a8780;padding:12px 0">No records yet</div>';
    });
  } else alert("History modal not found");
}
(window as any).openFastHistory = openFastHistory;
(window as any).deleteConfirm = function () {
  const id = window.deleteConfirmId;
  if (!id) return;
  const adapter: any = (window as any).adapter;
  if (adapter && adapter.delete) {
    adapter.delete(id).catch(() => { /* fall back to manual filter */ });
  }
  const arr = JSON.parse(window.localStorage.getItem("fast-records-v1") || "[]");
  const filtered = arr.filter((r: any) => r.id !== id);
  window.localStorage.setItem("fast-records-v1", JSON.stringify(filtered));
  window.deleteConfirmId = null;
  document.getElementById("delete-confirm-modal")!.style.display = "none";
  openFastHistory();
};
(window as any).openEditRecord = function (id: string) {
  const arr = JSON.parse(window.localStorage.getItem("fast-records-v1") || "[]");
  const r = arr.find((x: any) => x.id === id);
  if (!r) return;
  // Open edit flow: show save-confirm modal (not the history list) for editing record
  const saveModal = document.getElementById("fast-save-modal") as HTMLElement | null;
  if (saveModal) saveModal.style.display = "flex";
  const st = document.getElementById("fast-save-start") as HTMLInputElement | null; if (st) st.value = r.startTime || "";
  const et = document.getElementById("fast-save-end") as HTMLInputElement | null; if (et) et.value = r.endTime || "";
  const pat = document.getElementById("fast-save-pattern") as HTMLSelectElement | null; if (pat) pat.value = r.pattern || "";
  window.editRecordId = id;
  // Refresh duration label when editing (fix e1f94e): compute from loaded start/end
  const sVal = r.startTime || ""; const eVal = r.endTime || "";
  const durMsEdit = Math.max(0, new Date(eVal || Date.now()).getTime() - new Date(sVal || Date.now()).getTime());
  const durSpanEdit = document.getElementById("fast-save-duration") as HTMLElement | null;
  if (durSpanEdit && (window as any).fmtMs && typeof (window as any).fmtMs === "function") durSpanEdit.textContent = (window as any).fmtMs(durMsEdit);
};
console.log("openEditRecord registered:", typeof (window as any).openEditRecord);
function syncToCloud() {
  alert(
    "Sync: adapter.loadAll() -> SQLite (userId); OAuth/account future scope.",
  );
}

// 5:2 light-day tracking: start records date + clears; stop saves date + acc to adapter; clear resets
(window as any).toggleLightDay = () => {
  const btn = document.getElementById("btn-light-day") as HTMLButtonElement | null;
  const running = btn?.textContent?.includes("Stop");
  if (!running) {
    // Start
    const d = new Date().toISOString().split("T")[0];
    window.localStorage.setItem("light-date", d);
    window.localStorage.setItem("cal-accum", "0");
    if (btn) { btn.textContent = "Stop light day"; btn.style.background = "#222"; btn.style.color = "#c7bfae"; }
    document.getElementById("cal-total")!.textContent = "0";
    document.getElementById("light-date")!.textContent = d;
  } else {
    // Stop — save to adapter (date-keyed; supports 2 non-consecutive days)
    const accText = document.getElementById("cal-total")!.textContent || "0";
    const d = document.getElementById("light-date")!.textContent || new Date().toISOString().split("T")[0];
    const existing = JSON.parse(window.localStorage.getItem("light-days") || "[]");
    existing.push({ date: d, kcal: parseInt(accText, 10) });
    window.localStorage.setItem("light-days", JSON.stringify(existing));
    window.localStorage.setItem("cal-accum", "0");
    if (btn) { btn.textContent = "Start light day"; btn.style.background = "#c7bfae"; btn.style.color = "#222"; }
    document.getElementById("cal-total")!.textContent = "0";
  }
};
(window as any).clearCalDay = () => {
  window.localStorage.setItem("cal-accum", "0");
  document.getElementById("cal-total")!.textContent = "0";
};
(window as any).addCalEntry = () => {
  const input = document.getElementById("cal-intake") as HTMLInputElement | null;
  if (!input) return;
  const v = parseInt(input.value || "0", 10);
  if (v <= 0) { input.focus(); return; }
  const acc = parseInt(window.localStorage.getItem("cal-accum") || "0", 10);
  window.localStorage.setItem("cal-accum", String(acc + v));
  document.getElementById("cal-total")!.textContent = String(acc + v);
  input.value = "";
};
// Restore accumulated value on load (if same-day continuation)
const calAcc = window.localStorage.getItem("cal-accum");
if (calAcc) {
  const el = document.getElementById("cal-total");
  if (el) el.textContent = calAcc;
}
const savedLightDate = window.localStorage.getItem("light-date");
if (savedLightDate) {
  const el = document.getElementById("light-date");
  if (el) el.textContent = savedLightDate;
}
