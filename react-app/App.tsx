import React from "react";
import "./styles/components.css"; // base component rules (no timer duplicates — see timer.css)
import "./styles/timer.css"; // timer ring + pills + eyebrow (single source, no duplicates)
import { TimerRing } from "./components/TimerRing";
import { adapter } from "./store/StorageAdapter";

export default function App() {
  return (
    <main>
      <header>
        <div className="header-row">
          <h1>Fasting</h1>
          <a href="/profile" className="header-link">
            {" "}
            Profile
          </a>
        </div>
        <p>A calm tracker for your rhythm</p>
      </header>
      <TimerRing fastMinutes={600} />
    </main>
  );
}
