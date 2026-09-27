import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { FastingTheme } from "../types/fasting";

export interface ThemeToggleProps {
  theme: FastingTheme;
  onThemeChange: (theme: FastingTheme) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="profile-theme-box">
      <div className="profile-theme-header">
        <div>
          <div className="profile-theme-title">{t("profile.dark_mode")}</div>
          <div className="profile-theme-desc">{t("profile.theme_desc")}</div>
        </div>
        <label className="switch-toggle" aria-label={t("profile.dark_mode")}>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={(e) => onThemeChange(e.target.checked ? "dark" : "light")}
          />
          <span className="slider-round" />
        </label>
      </div>
    </div>
  );
}
