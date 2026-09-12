import { FastingPattern } from "./types";

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
      <h1>Fasting</h1>
      <p>A calm tracker for your rhythm.</p>
    </header>

    <section class="card">
      <h2>Today</h2>
      <div id="today-row" class="checkbox-row">
        <label for="today-check">Complete today's window</label>
        <input id="today-check" type="checkbox" />
      </div>
      <p class="small">No guilt. Just presence.</p>
    </section>

    <section class="card">
      <h2>Weekly Review</h2>
      <div id="weekly-stats"></div>
    </section>

    <section class="card">
      <h2>Patterns (extensible)</h2>
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
      Local tracking &mdash; cloud sync feature-flagged for future premium tier.
    </footer>
  `;

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
    <p>Completed: <strong>3 / 7</strong></p>
    <p>Streak: <strong>2 days</strong></p>
    <p class="small">Calm review. No penalties.</p>
  `;
}

renderApp();
