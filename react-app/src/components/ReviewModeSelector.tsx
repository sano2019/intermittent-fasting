import React from "react";
import { useTranslation } from "../i18n/I18nContext";

export interface ReviewModeSelectorProps {
  reviewMode: "calm" | "data";
  onReviewModeChange: (mode: "calm" | "data") => void;
}

export function ReviewModeSelector({
  reviewMode,
  onReviewModeChange,
}: ReviewModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="profile-theme-box">
      <div className="profile-theme-header profile-theme-header-spaced">
        <div>
          <div className="profile-theme-title">{t("profile.review_mode_title")}</div>
          <div className="profile-theme-desc">{t("profile.review_mode_desc")}</div>
        </div>
      </div>
      <div
        className="profile-mode-options"
        role="radiogroup"
        aria-label={t("profile.review_mode_title")}
      >
        <button
          type="button"
          role="radio"
          aria-checked={reviewMode === "calm"}
          className={`pattern-card-btn ${reviewMode === "calm" ? "selected" : ""}`.trim()}
          onClick={() => onReviewModeChange("calm")}
        >
          <span className="pattern-card-name">{t("profile.review_mode_calm")}</span>
          <span className="pattern-card-note">{t("profile.review_mode_calm_note")}</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={reviewMode === "data"}
          className={`pattern-card-btn ${reviewMode === "data" ? "selected" : ""}`.trim()}
          onClick={() => onReviewModeChange("data")}
        >
          <span className="pattern-card-name">{t("profile.review_mode_data")}</span>
          <span className="pattern-card-note">{t("profile.review_mode_data_note")}</span>
        </button>
      </div>
    </div>
  );
}
