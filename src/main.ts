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

    <div id="fast-save-modal" class="fast-save-modal" style="display:none;">
      <div class="modal-inner card">
        <h3>Confirm Fast</h3>
        <p>Duration: <span id="fast-save-duration"></span></p>
        <label>Pattern: <select id="fast-save-pattern"><option value="">(blank)</option><option>16:8</option><option>5:2</option><option>OMAD</option><option>custom</option></select></label>
        <p>Start: <input type="datetime-local" id="fast-save-start" /></p>
        <p>End: <input type="datetime-local" id="fast-save-end" /></p>
        <button onclick="document.getElementById('fast-save-modal').style.display='none';window.localStorage.removeItem('timer-base');window.localStorage.removeItem('fast-pattern');setBtnState();">Cancel</button>
        <button onclick="const s=document.getElementById('fast-save-start')?.value||'';const e=document.getElementById('fast-save-end')?.value||'';const p=document.getElementById('fast-save-pattern')?.value||'';const dur=Math.max(0,new Date(e||Date.now()).getTime()-new Date(s||window.localStorage.getItem('timer-start')||Date.now()).getTime());const arr=JSON.parse(window.localStorage.getItem('fast-records-v1')||'[]');arr.push({id:'fast-'+Date.now(),startTime:s||new Date().toISOString(),endTime:e||new Date().toISOString(),durationMs:dur,completed:true,pattern:p,createdAt:new Date().toISOString()});window.localStorage.setItem('fast-records-v1',JSON.stringify(arr));document.getElementById('fast-save-modal').style.display='none';window.localStorage.removeItem('timer-base');window.localStorage.removeItem('fast-pattern');setBtnState();">Save</button>
      </div>
    </div>

    <div id="delete-confirm-modal" class="fast-history-modal" style="display:none; z-index:60;">
      <div class="modal-inner" style="text-align:center; padding:2rem;">
        <h3 class="label">Delete this fast?</h3>
        <p style="margin:0.5rem 0 1rem; color:var(--muted-foreground); font-size:0.95rem;">This cannot be undone.</p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button onclick="document.getElementById('delete-confirm-modal').style.display='none'; window.deleteConfirmId=null;" style="padding:6px 16px; background:var(--border); border:1px solid var(--border); border-radius:6px; cursor:pointer;">Cancel</button>
          <button onclick='const id=window.deleteConfirmId; if(id){ const arr=JSON.parse(window.localStorage.getItem("fast-records-v1")||"[]"); const filtered=arr.filter((r:any)=>r.id!==id); window.localStorage.setItem("fast-records-v1",JSON.stringify(filtered)); window.deleteConfirmId=null; document.getElementById("delete-confirm-modal").style.display="none"; openFastHistory(); }' style="padding:6px 16px; background:var(--accent); color:#3d3b37; border:none; border-radius:6px; cursor:pointer;">Delete</button>
        </div>
      </div>
    </div>
    <div id="fast-history-modal" class="fast-history-modal" style="display:none;">
      <div class="modal-inner">
        <h3>Previous Fasts</h3>
        <div id="history-list"></div>
        <div class="history-pag" style="display:flex;gap:8px;margin-top:10px;align-items:center;">
          <button id="pag-prev" onclick="window.historyPage = Math.max(1,(window.historyPage||1)-1); openFastHistory();" class="btn-secondary">&lt;</button>
          <span style="font-size:11px;color:var(--muted-foreground);">page <span id="history-page-num">1</span> / <span id="history-total-pages">1</span></span>
          <button id="pag-next" onclick="window.historyPage = Math.min(99,(window.historyPage||1)+1); openFastHistory();" class="btn-secondary">&gt;</button>
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
  (window as any).setBtnState = setBtnState;
  startBtn.addEventListener("click", () => {
    const running = !!window.localStorage.getItem("timer-base");
    if (running) {
      // Confirm save: duration + pattern select before clearing timer-base
      const baseStr = window.localStorage.getItem("timer-base")!;
      const start = new Date(baseStr).getTime();
      const now = Date.now();
      const durationMs = Math.max(0, now - start);
      const profile = window.adapter ? (window.adapter.loadProfile ? null : null) : null; // stub: adapter.loadProfile async; deferred full profile read for this step per user's "no inline functions" constraint
      const pattern = (window.localStorage.getItem("fast-pattern") || "16:8");
      // Show styled save-confirm modal (separate from #fast-history-modal display flow)
      const modal = document.getElementById("fast-save-modal") as HTMLElement;
      const durSpan = document.getElementById("fast-save-duration") as HTMLElement;
      const patSelect = document.getElementById("fast-save-pattern") as HTMLSelectElement;
      durSpan.textContent = fmtMs(durationMs);
      const startInput = document.getElementById("fast-save-start") as HTMLInputElement;
      const endInput = document.getElementById("fast-save-end") as HTMLInputElement;
      if (startInput) startInput.value = baseStr.slice(0,16).replace(" ","T");
      if (endInput) endInput.value = new Date().toISOString().slice(0,16).replace(" ","T");
      patSelect.innerHTML = ["","16:8","5:2","OMAD","custom"].map(p => `<option value="${p}" ${p===pattern?"selected":""}>${p || "(blank)"}</option>`).join("");
      modal.style.display = "block";
      window.localStorage.removeItem("timer-base");
    } else {
      window.localStorage.setItem("timer-base", new Date().toISOString());
      window.localStorage.setItem("fast-pattern", (window.localStorage.getItem("profile-pattern") || "16:8"));
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
  const raw = window.localStorage.getItem("fast-records-v1") || "[]";
  const entries = raw ? JSON.parse(raw) : [];
  const now = new Date(); const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - ((now.getDay()+6)%7)); startOfWeek.setHours(0,0,0,0);
  const days = [t("days.mon"),t("days.tue"),t("days.wed"),t("days.thu"),t("days.fri"),t("days.sat"),t("days.sun")];
  // Map weekday index (0=Mon...6=Sun) from entry.date (ISO YYYY-MM-DD)
  const entryByDay: (typeof entries[0] | undefined)[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
  entries.forEach((e) => {
    if (!e || !(e.startTime || e.endTime)) return;
    const dStr = (e.startTime || e.endTime || '').slice(0,10);
    const d = new Date(dStr + "T00:00:00");
    const entryWeek = new Date(d); entryWeek.setHours(0,0,0,0); entryWeek.setDate(d.getDate() - ((d.getDay()+6)%7));
    if (entryWeek.getTime() !== startOfWeek.getTime()) return;
    const wd = d.getDay(); // 0=Sun ... 6=Sat; remap
    const idx = wd === 0 ? 6 : wd - 1; // Sun(0)->6, Mon(1)->0 ... Sat(6)->5
    entryByDay[idx] = e;
  });
  const completedCount = entryByDay.filter((e) => e && (e.durationMs || 0) > 0).length;
  const missedCount = entryByDay.filter((e) => e && e.startTime && !(e.durationMs || 0)).length;
  const streak = (() => { let s=0; for(let i=entryByDay.length-1;i>=0&&entryByDay[i]&&(entryByDay[i]!.durationMs||0)>0;i--) s++; return s; })();
  container.innerHTML = `
        <div class="weekly-row">
      ${[0,1,2,3,4,5,6].map(i => {
        const d = days[i];
        const entry = entryByDay[i];
        let cls = "dot";
        if (entry && (entry.durationMs || 0) > 0) cls = "dot active"; else if (entry && entry.startTime && !(entry.durationMs || 0)) cls = "dot missed";
        const labelText = d.length > 3 ? d.substring(0, 3) : d;
        return `<div class="week-day"><span class="dot ${cls}" title="${d}"></span><span class="label">${labelText}</span></div>`;
      }).join("")}
    </div>
    <p class="review-stat">${t("review.completed", { count: completedCount, total: 7 })}</p>
    <p class="review-stat">${t("review.streak", { days: streak })}</p>
    <p class="small review-note" style="text-align:center">Calm reviews, No penalties</p>
    <div style="display:flex;justify-content:center;margin-top:8px;">
      <button onclick="openFastHistory()" class="btn-secondary">Previous Fasts</button>
    </div>
  `;
}

function fmtMs(ms: number) { const h = Math.round(ms / 3600000); const m = Math.round((ms % 3600000) / 60000); return h + ' hrs, ' + m + ' mins'; }
function openFastHistory() { const page = Math.max(0,(window.historyPage||1)-1); const m = document.getElementById('fast-history-modal'); if (m) { m.style.display = 'flex'; (window as any).adapter.loadAll().then((recs: any[]) => { const sorted = (recs||[]).sort((a,b)=>new Date(b.startTime||b.endTime||0).getTime()-new Date(a.startTime||a.endTime||0).getTime()); const list = document.getElementById('history-list'); const totalPages = Math.max(1,Math.ceil(sorted.length/7)); const totalSpan = document.getElementById('history-total-pages'); if (totalSpan) totalSpan.textContent = String(totalPages); const prevBtn = document.getElementById('pag-prev') as HTMLElement|null; const nextBtn = document.getElementById('pag-next') as HTMLElement|null; if (prevBtn) prevBtn.style.display = page <= 0 ? 'none' : 'inline-block'; if (nextBtn) nextBtn.style.display = page >= totalPages-1 ? 'none' : 'inline-block'; const pageNum = document.getElementById('history-page-num'); if (pageNum) pageNum.textContent = String(window.historyPage||1); if (list) list.innerHTML = sorted.slice(page*7,(page+1)*7).map((r: any) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eae8e0"><div><strong>${r.pattern || '-'}</strong> — ${r.startTime?.slice(0,10) || '-'} → ${r.endTime?.slice(0,10) || '-'} | ${r.durationMs ? fmtMs(r.durationMs) : '-'} | ${r.completed === true ? 'done' : r.completed === false ? 'missed' : '-'}</div><button onclick='window.deleteConfirmId="${r.id}"; document.getElementById("delete-confirm-modal").style.display="flex";' aria-label="Delete" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:1.1rem;line-height:1;" title="Delete">🗑</button></div>`).join('') || '<div style="color:#8a8780;padding:12px 0">No records yet</div>'; }); } else alert('History modal not found'); }
(window as any).openFastHistory = openFastHistory;
function syncToCloud() { alert('Sync: adapter.loadAll() -> SQLite (userId); OAuth/account future scope.'); }
