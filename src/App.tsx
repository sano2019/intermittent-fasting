import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/timer.css";
import "./styles/weekly-review.css";
import "./styles/history-modal.css";
import "./styles/modal.css";
import "./styles/profile.css";
import "./styles/calorie-day.css";
import "./styles/expert-insights.css";
import "./styles/weight-chart.css";
import "./styles/onboarding.css";
import { ProfilePage } from "./components/ProfilePage";
import { TimerRing } from "./components/TimerRing";
import { CalorieDayCard } from "./components/CalorieDayCard";
import { Header } from "./components/Header";
import { WeeklyReview } from "./components/WeeklyReview";
import { HistoryModal } from "./components/HistoryModal";
import { ExpertInsightsCard } from "./components/ExpertInsightsCard";
import { NotificationToast } from "./components/NotificationToast";
import { OnboardingModal } from "./components/OnboardingModal";
import { adapter, FastRecord, UserProfile } from "./store/StorageAdapter";
import { I18nProvider, useTranslation } from "./i18n/I18nContext";
import { startReminderScheduler, stopReminderScheduler } from "./services/notificationService";
import { applyTheme } from "./services/themeService";
import type { FastingPattern } from "./types/fasting";

function AppContent() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<"home" | "profile">("home");
  const [pattern, setPattern] = useState<FastingPattern>("Custom");
  const [userName, setUserName] = useState<string>("");
  const [records, setRecords] = useState<FastRecord[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOnboardingUpgraded, setIsOnboardingUpgraded] = useState(false);
  const activeProfileRef = useRef<UserProfile | null>(null);

  // Check for first-time or upgraded experience
  useEffect(() => {
    try {
      const seen = localStorage.getItem("fasting_onboarding_seen_v2");
      const hasRecords = !!localStorage.getItem("fast-records");
      const hasProfile = !!localStorage.getItem("user-profile");
      const hasWeights = !!localStorage.getItem("fast-weights");
      const isUpgraded = hasRecords || hasProfile || hasWeights;

      if (!seen) {
        setIsOnboardingUpgraded(isUpgraded);
        setIsOnboardingOpen(true);
        // Direct brand new users to the profile page so settings are immediately accessible
        if (!isUpgraded) {
          setCurrentPage("profile");
        }
      }
    } catch (e) {
      console.warn("Could not check onboarding status", e);
    }
  }, []);

  const refreshRecords = useCallback(async () => {
    const list = await adapter.loadAll();
    setRecords(list);
  }, []);

  const refreshProfile = useCallback(async () => {
    const p = await adapter.loadProfile();
    activeProfileRef.current = p;
    if (p?.pattern) {
      setPattern(p.pattern);
    }
    if (p?.name) {
      setUserName(p.name.trim());
    } else {
      setUserName("");
    }
    if (p?.theme && (p.theme === "dark" || p.theme === "light")) {
      applyTheme(p.theme);
    }
  }, []);

  const navigateTo = useCallback((target: "home" | "profile") => {
    const targetHash = target === "profile" ? "#/profile" : "#/";
    if (window.location.hash !== targetHash) {
      window.location.hash = target === "profile" ? "/profile" : "/";
    }
    setCurrentPage(target);
    if (target === "home") {
      refreshProfile();
    }
  }, [refreshProfile]);

  const handleDismissOnboarding = useCallback((targetPage?: "home" | "profile") => {
    try {
      localStorage.setItem("fasting_onboarding_seen_v2", "true");
    } catch {}
    setIsOnboardingOpen(false);
    if (targetPage) {
      navigateTo(targetPage);
    }
  }, [navigateTo]);

  const handleManualOpenOnboarding = useCallback(() => {
    const hasRecords = !!localStorage.getItem("fast-records");
    const hasProfile = !!localStorage.getItem("user-profile");
    setIsOnboardingUpgraded(hasRecords || hasProfile);
    setIsOnboardingOpen(true);
  }, []);

  const homeSubtitle = useMemo(() => {
    if (!userName) {
      return t("app.subtitle");
    }

    const hour = new Date().getHours();
    let greeting = "";
    if (hour >= 5 && hour < 12) {
      greeting = t("greeting.morning", { name: userName });
    } else if (hour >= 12 && hour < 18) {
      greeting = t("greeting.afternoon", { name: userName });
    } else {
      greeting = t("greeting.evening", { name: userName });
    }

    return `${greeting} · ${t("app.subtitle_short")}`;
  }, [userName, t]);

  useEffect(() => {
    refreshRecords();
    refreshProfile().then(() => {
      // Background reminder loop commented out until native/Web Push backend is active
      // startReminderScheduler(() => activeProfileRef.current);
    });

    return () => {
      stopReminderScheduler();
    };
  }, [refreshRecords, refreshProfile]);

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash;
      if (h === "#/profile") {
        setCurrentPage("profile");
      } else {
        setCurrentPage("home");
        refreshProfile();
      }
    };

    const onProfileUpdated = () => {
      refreshProfile();
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("profile-updated", onProfileUpdated);
    onHashChange();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("profile-updated", onProfileUpdated);
    };
  }, [refreshProfile]);

  const handleDeleteRecord = async (id: string) => {
    await adapter.delete(id);
    await refreshRecords();
  };

  const handleUpdateRecord = async (record: FastRecord) => {
    await adapter.update(record);
    await refreshRecords();
  };

  return (
    <>
      <NotificationToast />
      <main>
        {currentPage === "home" ? (
          <>
            <Header
              title={t("app.title")}
              subtitle={homeSubtitle}
              buttonLabel={t("nav.profile")}
              target="profile"
              onNavigate={navigateTo}
            />

            {pattern === "5:2" ? (
              <CalorieDayCard onRecordSaved={refreshRecords} />
            ) : (
              <TimerRing pattern={pattern} onFastCompleted={refreshRecords} />
            )}

            <WeeklyReview
              records={records}
              pattern={pattern}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
            />

            <ExpertInsightsCard />

            <HistoryModal
              isOpen={isHistoryModalOpen}
              onClose={() => setIsHistoryModalOpen(false)}
              records={records}
              onDelete={handleDeleteRecord}
              onUpdate={handleUpdateRecord}
            />
          </>
        ) : (
          <>
            <Header
              title={t("profile.title")}
              subtitle={t("profile.subtitle")}
              buttonLabel={t("nav.back")}
              target="home"
              onNavigate={navigateTo}
            />
            <ProfilePage onOpenOnboarding={handleManualOpenOnboarding} />
          </>
        )}
      </main>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        isUpgraded={isOnboardingUpgraded}
        onClose={handleDismissOnboarding}
      />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
