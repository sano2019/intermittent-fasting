import React, { useMemo } from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { PermissionState } from "../services/notificationService";

export interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  permissionState: PermissionState;
  onToggleNotifications: () => void;
  onTestNotification: () => void;
}

export function NotificationSettings({
  notificationsEnabled,
  permissionState,
  onToggleNotifications,
  onTestNotification,
}: NotificationSettingsProps) {
  const { t } = useTranslation();

  const permissionLabel = useMemo(() => {
    switch (permissionState) {
      case "granted":
        return t("profile.status_granted");
      case "denied":
        return t("profile.status_denied");
      case "default":
        return t("profile.status_default");
      default:
        return t("profile.status_default");
    }
  }, [permissionState, t]);

  return (
    <div className="profile-reminders-box">
      <div className="profile-reminders-header">
        <div>
          <div className="profile-reminders-title">{t("profile.reminders")}</div>
          <div className="profile-reminders-desc">{t("profile.reminders_desc")}</div>
        </div>
        <label className="switch-toggle" aria-label={t("profile.notifications_enable")}>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={onToggleNotifications}
          />
          <span className="slider-round" />
        </label>
      </div>

      <div className="profile-reminders-meta">
        <span className="permission-status-text">
          {t("profile.notifications_status")}{" "}
          <strong
            className={`permission-badge ${
              permissionState === "granted" ? "granted" : permissionState === "denied" ? "denied" : ""
            }`}
          >
            {permissionLabel}
          </strong>
        </span>

        <button
          type="button"
          className="btn-test-reminder"
          onClick={onTestNotification}
        >
          {t("profile.test_notification")}
        </button>
      </div>
    </div>
  );
}
