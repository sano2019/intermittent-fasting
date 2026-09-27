import { useState, useEffect, useCallback } from "react";
import { adapter, UserProfile } from "../store/StorageAdapter";
import { useTranslation } from "../i18n/I18nContext";
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  PermissionState,
} from "../services/notificationService";
import { getInitialTheme, applyTheme } from "../services/themeService";
import type { FastingPattern, FastingTheme, SupportedLanguage, WeekdayKey } from "../types/fasting";

export function useProfileForm() {
  const { t, setLanguage } = useTranslation();
  const [name, setName] = useState("You");
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [theme, setTheme] = useState<FastingTheme>(() => getInitialTheme());
  const [reviewMode, setReviewMode] = useState<"calm" | "data">("calm");
  const [pattern, setPattern] = useState<FastingPattern>("Custom");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [lightDays, setLightDays] = useState<WeekdayKey[]>(["mon", "thu"]);
  const [lightDayReminderTime, setLightDayReminderTime] = useState("08:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>("default");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    adapter.loadProfile().then((p) => {
      if (!isMounted || !p) return;
      if (p.name) setName(p.name);
      if (p.lang) setLang(p.lang as SupportedLanguage);
      if (p.theme && (p.theme === "dark" || p.theme === "light")) {
        setTheme(p.theme);
        applyTheme(p.theme);
      }
      if (p.reviewMode === "data" || p.reviewMode === "calm") {
        setReviewMode(p.reviewMode);
      } else {
        try {
          const saved = localStorage.getItem("weekly-review-mode");
          if (saved === "data") setReviewMode("data");
        } catch {
          // ignore
        }
      }
      if (p.pattern) setPattern(p.pattern);
      if (p.startTime) setStartTime(p.startTime);
      if (p.endTime) setEndTime(p.endTime);
      if (p.lightDays && Array.isArray(p.lightDays)) setLightDays(p.lightDays);
      if (p.lightDayReminderTime) setLightDayReminderTime(p.lightDayReminderTime);
      if (typeof p.notificationsEnabled === "boolean") {
        setNotificationsEnabled(p.notificationsEnabled);
      }
    });

    setPermissionState(getNotificationPermission());

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLanguageChange = useCallback(
    (selected: SupportedLanguage) => {
      setLang(selected);
      setLanguage(selected);
    },
    [setLanguage]
  );

  const handleThemeChange = useCallback((newTheme: FastingTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  }, []);

  const handleReviewModeChange = useCallback((newMode: "calm" | "data") => {
    setReviewMode(newMode);
    try {
      localStorage.setItem("weekly-review-mode", newMode);
      window.dispatchEvent(
        new CustomEvent("weekly-review-mode-changed", { detail: newMode })
      );
    } catch {
      // ignore
    }
  }, []);

  const toggleLightDay = useCallback((day: WeekdayKey) => {
    setLightDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length <= 1) return prev;
        return prev.filter((d) => d !== day);
      }
      if (prev.length >= 2) {
        return [prev[1], day];
      }
      return [...prev, day];
    });
  }, []);

  const handleToggleNotifications = useCallback(async () => {
    setNotificationsEnabled((prev) => {
      const nextState = !prev;
      if (nextState) {
        requestNotificationPermission().then((perm) => {
          setPermissionState(perm);
        });
      }
      return nextState;
    });
  }, []);

  const handleTestNotification = useCallback(async () => {
    if (permissionState !== "granted") {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);
    }
    sendTestNotification();
  }, [permissionState]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const updated: Partial<UserProfile> = {
        name,
        lang,
        theme,
        pattern,
        startTime,
        endTime,
        lightDays,
        lightDayReminderTime,
        notificationsEnabled,
        reviewMode,
      };

      applyTheme(theme);
      await adapter.saveProfile(updated);
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: updated }));
      if (updated.lang) {
        setLanguage(updated.lang as SupportedLanguage);
      }
      setSaveStatus(t("profile.saved"));
      setTimeout(() => {
        setSaveStatus(null);
      }, 2500);
    },
    [
      name,
      lang,
      theme,
      pattern,
      startTime,
      endTime,
      lightDays,
      lightDayReminderTime,
      notificationsEnabled,
      reviewMode,
      setLanguage,
      t,
    ]
  );

  return {
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
  };
}
