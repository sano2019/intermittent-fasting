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

    <section class="card" id="timer-card">
      <h2>Fasting timer</h2>
      <p id="timer-display" class="small">00:00:00</p>
      <span id="fast-indicator" class="indicator"></span>
      <button id="timer-override">Start from now</button>
    </section>

    <section class="card">
      <h2>${t("review.title")}</h2>
      <div id="weekly-stats"></div>
    </section>

    <section class="card">
      <h2>${t("patterns.title")}</h2>
      ${patterns
        .map(
          (p) => `
        <div class="checkbox-row">
          <label>${t(`pattern.${p.key}`)}</label>
          <span class="small note-inline">${t(`pattern.${p.key}.note`)}</span>
        </div>
      `
        )
        .join("")}
    </section>

    <footer>
      ${t("footer.note")}
    </footer>
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
    if (todayCheck.checked) {
      todayCheck.parentElement!.classList.add("completed");
    } else {
      todayCheck.parentElement!.classList.remove("completed");
    }
  });

  renderWeeklyStats(app);

  // Frame-based timer for accuracy (requestAnimationFrame)
  let animFrame: number;
  const updateTimer = () => {
    const display = document.getElementById("timer-display");
    if (!display) return;
    const baseStr = window.localStorage.getItem("timer-base");
    // Backfill test data (Mon-Thu completed, Fri missed, Sat today open)
    const testEntries = [
      { date: "2026-09-07", completed: true }, // Mon
      { date: "2026-09-08", completed: true }, // Tue
      { date: "2026-09-09", completed: true }, // Wed
      { date: "2026-09-10", completed: true }, // Thu
      { date: "2026-09-11", completed: false }, // Fri — broke fast
      { date: "2026-09-12", completed: false }, // Sat — today, open
    ];
    window.localStorage.setItem("test-entries", JSON.stringify(testEntries));
    const base = baseStr ? new Date(baseStr) : new Date();
    const elapsedMs = Date.now() - base.getTime();
    const h = Math.floor(elapsedMs / 3600000);
    const m = Math.floor((elapsedMs % 3600000) / 60000);
    const s = Math.floor((elapsedMs % 60000) / 1000);
    display.textContent = [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
    animFrame = requestAnimationFrame(updateTimer);
  };
  animFrame = requestAnimationFrame(updateTimer);

  // Override: reset timer base to now (handles oversleeping)
  document.getElementById("timer-override")?.addEventListener("click", () => {
    window.localStorage.setItem("timer-base", new Date().toISOString());
  });

  return app;
}

function renderWeeklyStats(app: HTMLElement) {
  const container = app.querySelector("#weekly-stats")!;
  const raw = window.localStorage.getItem("test-entries");
  const entries = raw ? JSON.parse(raw) : [];
  const dots = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    .map((d, i) => {
      const entry = entries[i] || { completed: false };
      const cls = entry.completed ? "indicator active" : "indicator";
      return `<span class="${cls}" title="${d}" style="margin-right:4px;"></span>`;
    }).join("");
  container.innerHTML = `
    <div class="weekly-dots">${dots}</div>
    <p>${t("review.completed", { count: 3, total: 7 })}</p>
    <p>${t("review.streak", { days: 2 })}</p>
    <p class="small">${t("review.note")}</p>
  `;
}

renderApp();
