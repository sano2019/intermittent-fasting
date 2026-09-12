import { FastingPattern } from "./types";
import { loadLang, t } from "./i18n";
import { LocalStorageAdapter } from "./storage/local";

(window as any).adapter = new LocalStorageAdapter();

loadLang("en").catch(() => {});

// Load user language preference if available
(window as any).adapter?.loadProfile().then((p: any) => {
  if (p?.lang) loadLang(p.lang as any).catch(() => {});
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
          <label>${p.label}</label>
          <span class="small note-inline">${p.note}</span>
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
  return app;
}

function renderWeeklyStats(app: HTMLElement) {
  const container = app.querySelector("#weekly-stats")!;
  // Placeholder stats — architecture ready for real data
  container.innerHTML = `
    <p>${t("review.completed", { count: 3, total: 7 })}</p>
    <p>${t("review.streak", { days: 2 })}</p>
    <p class="small">${t("review.note")}</p>
  `;
}

renderApp();
