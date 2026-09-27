import React from "react";
import { useTranslation } from "../i18n/I18nContext";

interface TimerPillsProps {
  showRemaining: boolean;
  onToggle: (showRemaining: boolean) => void;
}

export function TimerPills({ showRemaining, onToggle }: TimerPillsProps) {
  const { t } = useTranslation();

  return (
    <div className="timer-pill-row" role="tablist" aria-label="Timer display mode">
      <button
        type="button"
        role="tab"
        aria-selected={!showRemaining}
        className={`timer-pill ${!showRemaining ? "active" : ""}`}
        onClick={() => onToggle(false)}
      >
        {t("timer.elapsed")}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={showRemaining}
        className={`timer-pill ${showRemaining ? "active" : ""}`}
        onClick={() => onToggle(true)}
      >
        {t("timer.remaining")}
      </button>
    </div>
  );
}
