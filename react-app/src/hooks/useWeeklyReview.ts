import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "../i18n/I18nContext";
import { adapter } from "../store/StorageAdapter";
import type { FastRecord, FastingPattern } from "../types/fasting";

export type ReviewViewMode = "calm" | "data";
export const STORAGE_KEY_REVIEW_MODE = "weekly-review-mode";

export interface DayStat {
  label: string;
  status: "none" | "partial" | "completed";
  record?: FastRecord;
}

export interface WeeklyReviewStats {
  dayStats: DayStat[];
  is52: boolean;
  progressCount: number;
  targetCount: number;
  completedInWeek: number;
  totalFastsInWeek: number;
  totalHours: string;
  avgHours: string;
  longestFastHours: string;
  allTimeCount: number;
  consistencyPct: number;
  hasCalorieData: boolean;
  totalKcalDisplay: number;
}

export function useWeeklyReview(
  records: FastRecord[],
  propPattern?: FastingPattern
) {
  const { t } = useTranslation();

  const [activePattern, setActivePattern] = useState<FastingPattern>(
    propPattern || "16:8"
  );

  const [viewMode, setViewMode] = useState<ReviewViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEW_MODE);
      return saved === "data" ? "data" : "calm";
    } catch {
      return "calm";
    }
  });

  useEffect(() => {
    if (propPattern) {
      setActivePattern(propPattern);
    }
  }, [propPattern]);

  useEffect(() => {
    let isMounted = true;
    adapter.loadProfile().then((p) => {
      if (isMounted) {
        if (p?.reviewMode) setViewMode(p.reviewMode);
        if (!propPattern && p?.pattern) setActivePattern(p.pattern);
      }
    });

    const handleModeUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail === "data" || custom.detail === "calm") {
        setViewMode(custom.detail);
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY_REVIEW_MODE);
          setViewMode(saved === "data" ? "data" : "calm");
        } catch {
          // ignore
        }
      }
    };

    const handleProfileUpdate = () => {
      adapter.loadProfile().then((p) => {
        if (isMounted) {
          if (p?.reviewMode) setViewMode(p.reviewMode);
          if (!propPattern && p?.pattern) setActivePattern(p.pattern);
        }
      });
    };

    window.addEventListener("weekly-review-mode-changed", handleModeUpdate);
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("weekly-review-mode-changed", handleModeUpdate);
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [propPattern]);

  const dayLabels = useMemo(
    () => [
      t("days.mon"),
      t("days.tue"),
      t("days.wed"),
      t("days.thu"),
      t("days.fri"),
      t("days.sat"),
      t("days.sun"),
    ],
    [t]
  );

  const stats: WeeklyReviewStats = useMemo(() => {
    const now = new Date();

    // 1. Current week boundaries (Monday 00:00:00 to Sunday 23:59:59.999 local)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setTime(endOfWeek.getTime() - 1);

    // 2. Day-by-day stats for the 7 dots of the current week
    const recordsByDayIndex: (FastRecord | undefined)[] = [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ];

    let totalDurationMsInWeek = 0;
    let totalFastsInWeek = 0;
    let completedInWeek = 0;
    let calorieDaysInWeek = 0;
    let totalKcalInWeek = 0;
    const lightDaysRecordedInWeek = new Set<number>();

    // Check active unsaved calories in local storage for today
    let liveAccumKcal = 0;
    try {
      const raw = localStorage.getItem("cal-accum");
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed > 0) liveAccumKcal = parsed;
      }
    } catch {
      // ignore
    }

    records.forEach((rec) => {
      if (!rec || (!rec.startTime && !rec.endTime)) return;
      const recDate = new Date(rec.endTime || rec.startTime);
      if (isNaN(recDate.getTime())) return;

      // Current week metrics
      if (recDate >= startOfWeek && recDate <= endOfWeek) {
        const recDay = recDate.getDay();
        const monIdx = recDay === 0 ? 6 : recDay - 1;
        const existing = recordsByDayIndex[monIdx];
        if (!existing || (!existing.completed && rec.completed)) {
          recordsByDayIndex[monIdx] = rec;
        }

        if (rec.durationMs && rec.durationMs > 0) {
          totalFastsInWeek++;
          totalDurationMsInWeek += rec.durationMs;
        }
        if (rec.completed) {
          completedInWeek++;
        }

        if (rec.kcal && rec.kcal > 0) {
          totalKcalInWeek += rec.kcal;
          calorieDaysInWeek++;
          lightDaysRecordedInWeek.add(monIdx);
        } else if (rec.pattern === "5:2") {
          calorieDaysInWeek++;
          lightDaysRecordedInWeek.add(monIdx);
        }
      }
    });

    const dayStats: DayStat[] = dayLabels.map((label, idx) => {
      const rec = recordsByDayIndex[idx];
      let status: "none" | "partial" | "completed" = "none";
      if (rec) {
        if (rec.completed) {
          status = "completed";
        } else if (rec.durationMs > 0) {
          status = "partial";
        }
      }
      return {
        label,
        status,
        record: rec,
      };
    });

    // 3. All-time metrics (healthy milestones that never reset to zero)
    let longestFastMs = 0;
    let allTimeCount = 0;

    records.forEach((rec) => {
      if (!rec) return;
      if ((rec.durationMs && rec.durationMs > 0) || rec.completed) {
        allTimeCount++;
      }
      if (rec.durationMs && rec.durationMs > longestFastMs) {
        longestFastMs = rec.durationMs;
      }
    });

    const longestFastHours =
      longestFastMs > 0 ? (longestFastMs / 3600000).toFixed(1) : "0.0";

    // Weekly hours summary: Total duration divided by amount of fasts
    const totalHours = (totalDurationMsInWeek / 3600000).toFixed(1);
    const avgHours =
      totalFastsInWeek > 0
        ? (totalDurationMsInWeek / totalFastsInWeek / 3600000).toFixed(1)
        : "0.0";

    // 5:2 vs Daily weekly target progress
    const is52 = activePattern === "5:2";
    const lightDaysCompleted =
      lightDaysRecordedInWeek.size + (liveAccumKcal > 0 ? 1 : 0);
    const targetCount = is52 ? 2 : 7;
    const progressCount = is52 ? lightDaysCompleted : completedInWeek;
    const consistencyPct = Math.min(
      100,
      Math.round((progressCount / targetCount) * 100)
    );

    const totalKcalDisplay = totalKcalInWeek + liveAccumKcal;
    const hasCalorieData = is52 || calorieDaysInWeek > 0 || liveAccumKcal > 0;

    return {
      dayStats,
      is52,
      progressCount,
      targetCount,
      completedInWeek,
      totalFastsInWeek,
      totalHours,
      avgHours,
      longestFastHours,
      allTimeCount,
      consistencyPct,
      hasCalorieData,
      totalKcalDisplay,
    };
  }, [records, dayLabels, activePattern]);

  return {
    viewMode,
    setViewMode,
    stats,
  };
}
