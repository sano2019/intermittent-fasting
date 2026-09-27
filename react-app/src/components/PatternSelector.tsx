import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { FastingPattern } from "../types/fasting";

export interface PatternSelectorProps {
  pattern: FastingPattern;
  onSelectPattern: (p: FastingPattern) => void;
}

export function PatternSelector({
  pattern,
  onSelectPattern,
}: PatternSelectorProps) {
  const { t } = useTranslation();

  const patterns = [
    { key: "16:8" as FastingPattern, name: t("pattern.16:8"), note: t("pattern.16:8.note") },
    { key: "5:2" as FastingPattern, name: t("pattern.5:2"), note: t("pattern.5:2.note") },
    { key: "OMAD" as FastingPattern, name: t("pattern.OMAD"), note: t("pattern.OMAD.note") },
    { key: "Custom" as FastingPattern, name: t("pattern.custom"), note: t("pattern.custom.note") },
  ];

  return (
    <div className="profile-field-group">
      <span className="profile-label">{t("profile.pattern")}</span>
      <div
        className="pattern-cards-grid"
        role="radiogroup"
        aria-label={t("profile.pattern")}
      >
        {patterns.map((p) => {
          const isSelected = pattern === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`pattern-card-btn ${isSelected ? "selected" : ""}`.trim()}
              onClick={() => onSelectPattern(p.key)}
            >
              <span className="pattern-card-name">{p.name}</span>
              <span className="pattern-card-note">{p.note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
