import type { Profile, FastingPattern } from "./types";

const patterns: { key: FastingPattern; label: string; note: string }[] = [
  { key: "16:8", label: "16:8", note: "16h fast / 8h window" },
  { key: "5:2", label: "5:2", note: "5 days normal / 2 light" },
  { key: "OMAD", label: "OMAD", note: "One meal a day" },
  { key: "custom", label: "Custom", note: "Your own rhythm" },
];

export function renderProfile(app: HTMLElement) {
  app.innerHTML = `
    <header>
      <div class="header-row">
        <h1>Profile</h1>
        <a href="#/" class="header-link" id="back-link">Back</a>
      </div>
      <p>Local settings — future cloud sync.</p>
    </header>

    <section class="card">
      <h2>Settings</h2>
      <form id="profile-form">
        <label class="field-label">Language</label>
      <select id="lang-select" class="text-input">
        <option value="en">English</option>
        <option value="sv">Svenska</option>
        <option value="nl">Nederlands</option>
        <option value="vi">Tiếng Việt</option>
      </select>

      <label class="field-label" for="user-name">Name</label>
        <input id="user-name" type="text" value="You" class="text-input" />

        <label class="field-label">Fasting Pattern</label>
        <div class="pattern-grid">
          ${patterns.map((p) => `<button type="button" class="pattern-btn" data-pattern="${p.key}" aria-label="${p.label}">${p.label}<span class="small note-inline">${p.note}</span></button>`).join("")}
        </div>

        <div class="time-row">
          <div>
            <label class="field-label" for="start-time">Window start</label>
            <input id="start-time" type="time" value="08:00" class="text-input" />
          </div>
          <div>
            <label class="field-label" for="end-time">Window end</label>
            <input id="end-time" type="time" value="16:00" class="text-input" />
          </div>
        </div>

        <button type="submit" class="primary-btn">Save</button>
      </form>
    </section>

    <section class="card">
      <h2>Account</h2>
      <p class="small">Local profile. Cloud sync feature-flagged for future premium tier.</p>
    </section>
  `;

  // Load existing profile into form if present
  const adapter = (window as any).adapter;
  if (adapter) {
    adapter.loadProfile().then((p: Profile | null) => {
      if (!p) return;
      const input = app.querySelector<HTMLInputElement>("#user-name")!;
      input.value = p.name || "You";
      const selected = app.querySelector(`.pattern-btn[data-pattern="${p.pattern}"]`);
      if (selected) selected.classList.add("selected");
      const langSelect = app.querySelector<HTMLSelectElement>("#lang-select");
      if (langSelect && p.lang) langSelect.value = p.lang;
      const start = app.querySelector<HTMLInputElement>("#start-time")!;
      if (p.startTime) start.value = p.startTime;
      const end = app.querySelector<HTMLInputElement>("#end-time")!;
      if (p.endTime) end.value = p.endTime;
    });
  }

  // Pattern selection
  app.querySelectorAll(".pattern-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      app.querySelectorAll(".pattern-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Save
  const form = app.querySelector<HTMLFormElement>("#profile-form")!;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selected = app.querySelector(".pattern-btn.selected") as HTMLElement;
    const profile: Profile = {
      id: "local-user-1",
      name: (app.querySelector<HTMLInputElement>("#user-name")!.value) || "You",
      pattern: (selected?.getAttribute("data-pattern") as FastingPattern) ?? "custom",
      startTime: app.querySelector<HTMLInputElement>("#start-time")!.value,
      endTime: app.querySelector<HTMLInputElement>("#end-time")!.value,
      lang: app.querySelector<HTMLSelectElement>("#lang-select")!.value,
      createdAt: new Date().toISOString(),
    };
    if (adapter) adapter.saveProfile(profile);

    // Hot reload language
    import("./i18n").then((i18n) => {
      i18n.loadLang(profile.lang as any).catch(() => {});
      alert("Profile saved locally. Language switched to " + profile.lang);
      // Re-render with new language (optional — kept simple by reload)
      window.location.reload();
    });
  });

  // Back link returns to main app view
  const backLink = app.querySelector("#back-link");
  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "/";
      window.location.reload();
    });
  }
}
