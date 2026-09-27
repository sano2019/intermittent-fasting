import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { SupportedLanguage } from "../types/fasting";

export interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  id?: string;
}

export function LanguageSelector({
  value,
  onChange,
  id = "profile-language",
}: LanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="profile-field-group">
      <label htmlFor={id} className="profile-label">
        {t("profile.language")}
      </label>
      <select
        id={id}
        className="profile-select"
        value={value}
        onChange={(e) => {
          onChange(e.target.value as SupportedLanguage);
        }}
      >
        <option value="en">English</option>
        <option value="sv">Svenska</option>
        <option value="nl">Nederlands</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>
  );
}
