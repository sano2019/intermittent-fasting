import React, { useEffect, useRef, useState } from "react";

export function TimerRing({ fastMinutes = 420 }: { fastMinutes?: number }) {
  const [showRemaining, setShowRemaining] = useState(true);
  const [timeText, setTimeText] = useState("16:00:00");
  const [pct, setPct] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const animRef = useRef(0);

  useEffect(() => {
    if (!isActive) return; // mechanism only runs when timer active
    let running = true;
    const update = () => {
      if (!running) return;
      // Live mechanism: compute from timer-base (simulated live state)
      const baseStr =
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage.getItem("timer-base") || null
          : null;
      const baseMs = baseStr
        ? new Date(baseStr).getTime()
        : Date.now() - 120000; // demo: 2 min elapsed
      const elapsedMs = Math.max(0, Date.now() - baseMs);
      const windowMs = fastMinutes * 60000;
      const remainingMs = Math.max(0, windowMs - elapsedMs);

      // Format HH:MM:SS (live, not static 16:00:00)
      const fmt = (ms: number) => {
        const sign = ms < 0 ? "-" : "";
        const absMs = Math.abs(ms);
        const h = Math.floor(absMs / 3600000);
        const m = Math.floor((absMs % 3600000) / 60000);
        const s = Math.floor((absMs % 60000) / 1000);
        return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      };
      setTimeText(showRemaining ? fmt(remainingMs) : fmt(elapsedMs));

      // Ring progress: live pct based on elapsed / windowMs (not fixed 0.5)
      const livePct = Math.min(1, Math.max(0, elapsedMs / windowMs));
      setPct(livePct);
      animRef.current = requestAnimationFrame(update);
    };
    animRef.current = requestAnimationFrame(update);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [fastMinutes, showRemaining, isActive]);

  return (
    <div className="card timer-ring-card">
      {/* Eyebrow matches legacy FASTING TIMER design: amber #c7bfae, serif italic */}
      <div className="timer-card-title">Fasting Timer</div>

      {/* Pills: separated, active = amber #c7bfae (Remaining default per 2026-09-23) */}
      <div className="timer-pill-row">
        <button
          className={`timer-pill ${!showRemaining ? "active" : ""}`}
          onClick={() => setShowRemaining(false)}
        >
          Elapsed
        </button>
        <button
          className={`timer-pill ${showRemaining ? "active" : ""}`}
          onClick={() => setShowRemaining(true)}
        >
          Remaining
        </button>
      </div>

      <div className="ring-wrap">
        <svg
          className="timer-ring"
          viewBox="0 0 200 200"
          aria-label="timer ring"
        >
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#eae8e0"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#7fbf7f"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="502.65"
            strokeDashoffset={502.65 * (1 - pct)}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="ring-time">{timeText}</div>
      </div>

      <button
        className={`primary-btn timer-start ${isActive ? "stop-mode" : ""}`.trim()}
        onClick={() => {
          if (!isActive) {
            // START: save timer-base (no reload)
            window.localStorage?.setItem(
              "timer-base",
              new Date().toISOString(),
            );
            setIsActive(true);
          } else {
            // STOP: clear timer-base, reset mechanism
            window.localStorage?.removeItem("timer-base");
            setIsActive(false);
            setPct(0);
            setTimeText("16:00:00");
          }
        }}
      >
        {isActive ? "Stop" : "Start Fast"}
      </button>
    </div>
  );
}
