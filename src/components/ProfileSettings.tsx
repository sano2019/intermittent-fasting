import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import { useProfileForm } from "../hooks/useProfileForm";
import { LanguageSelector } from "./LanguageSelector";
import { PatternSelector } from "./PatternSelector";
import { ScheduleConfig } from "./ScheduleConfig";
import { ThemeToggle } from "./ThemeToggle";
import { ReviewModeSelector } from "./ReviewModeSelector";
import { NotificationSettings } from "./NotificationSettings";

interface ProfileSettingsProps {
  onOpenOnboarding?: () => void;
}

export function ProfileSettings({ onOpenOnboarding }: ProfileSettingsProps) {
  const { t } = useTranslation();
  const {
    name,
    setName,
    lang,
    handleLanguageChange,
    theme,
    handleThemeChange,
    reviewMode,
    handleReviewModeChange,
    pattern,
    setPattern,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    lightDays,
    toggleLightDay,
    lightDayReminderTime,
    setLightDayReminderTime,
    notificationsEnabled,
    handleToggleNotifications,
    permissionState,
    handleTestNotification,
    saveStatus,
    handleSave,
  } = useProfileForm();

  return (
    <section className="card profile-card" aria-label="Profile settings">
      <div className="profile-card-title">{t("profile.title")}</div>

      {onOpenOnboarding && (
        <button
          type="button"
          className="btn-open-guide"
          onClick={onOpenOnboarding}
        >
          {t("onboarding.reopen_btn")}
        </button>
      )}

      <form onSubmit={handleSave}>
        {/* Language Selection */}
        <LanguageSelector value={lang} onChange={handleLanguageChange} />

        {/* User Name */}
        <div className="profile-field-group">
          <label htmlFor="profile-name" className="profile-label">
            {t("profile.name")}
          </label>
          <input
            id="profile-name"
            type="text"
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Fasting Pattern Selector */}
        <PatternSelector pattern={pattern} onSelectPattern={setPattern} />

        {/* Schedule & Fasting Configuration (Eating Window vs 5:2 Schedule) */}
        <ScheduleConfig
          pattern={pattern}
          startTime={startTime}
          endTime={endTime}
          lightDays={lightDays}
          lightDayReminderTime={lightDayReminderTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onToggleLightDay={toggleLightDay}
          onLightDayReminderTimeChange={setLightDayReminderTime}
        />

        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />

        {/* Weekly Review Mode (Calm vs Data) */}
        <ReviewModeSelector
          reviewMode={reviewMode}
          onReviewModeChange={handleReviewModeChange}
        />

        {/* Gentle Reminders / Notification Settings */}
        <NotificationSettings
          notificationsEnabled={notificationsEnabled}
          permissionState={permissionState}
          onToggleNotifications={handleToggleNotifications}
          onTestNotification={handleTestNotification}
        />

        {/* Save Action */}
        <div className="profile-actions-row">
          <button type="submit" className="btn-profile-save">
            {t("profile.save")}
          </button>
          {saveStatus && <span className="profile-save-message">{saveStatus}</span>}
        </div>
      </form>
    </section>
  );
}
