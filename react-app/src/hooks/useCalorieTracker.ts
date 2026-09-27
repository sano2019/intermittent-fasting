import { useState, useEffect, useMemo, useCallback } from "react";
import { adapter, FastRecord } from "../store/StorageAdapter";
import { useTranslation } from "../i18n/I18nContext";
import type { WeekdayKey } from "../types/fasting";
import type { CalEntry } from "../components/CalorieEntriesList";

const STORAGE_KEY_CAL_ACCUM = "cal-accum";
const STORAGE_KEY_CAL_ITEMS = "cal-items-v1";
const STORAGE_KEY_LIGHT_ACTIVE = "light-day-active";
const STORAGE_KEY_LIGHT_DATE = "light-date";

const WEEKDAYS_MAP: Record<number, WeekdayKey> = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  0: "sun",
};

export function useCalorieTracker(onRecordSaved?: (record: FastRecord) => void) {
  const { t } = useTranslation();

  const [inputVal, setInputVal] = useState("");
  const [entries, setEntries] = useState<CalEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CAL_ITEMS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isLightDayActive, setIsLightDayActive] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_LIGHT_ACTIVE) === "true";
  });

  const [activeDate, setActiveDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LIGHT_DATE) || "";
  });

  // Scheduled light days from profile
  const [lightDays, setLightDays] = useState<WeekdayKey[]>(["mon", "thu"]);

  useEffect(() => {
    let isMounted = true;
    adapter.loadProfile().then((p) => {
      if (!isMounted || !p) return;
      if (p.lightDays && Array.isArray(p.lightDays)) {
        setLightDays(p.lightDays);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalKcal = useMemo(() => {
    return entries.reduce((sum, item) => sum + item.kcal, 0);
  }, [entries]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CAL_ITEMS, JSON.stringify(entries));
    localStorage.setItem(STORAGE_KEY_CAL_ACCUM, String(totalKcal));
  }, [entries, totalKcal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIGHT_ACTIVE, String(isLightDayActive));
    localStorage.setItem(STORAGE_KEY_LIGHT_DATE, activeDate);
  }, [isLightDayActive, activeDate]);

  // Determine today's weekday
  const todayWeekdayKey = useMemo<WeekdayKey>(() => {
    const day = new Date().getDay();
    return WEEKDAYS_MAP[day];
  }, []);

  const isTodayLightDay = lightDays.includes(todayWeekdayKey);

  const handleAddKcal = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const val = parseInt(inputVal.replace(/[^0-9]/g, "").slice(0, 4), 10);
      if (!val || val <= 0) return;

      const newEntry: CalEntry = {
        id: `entry-${Date.now()}`,
        kcal: val,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setEntries((prev) => [...prev, newEntry]);
      setInputVal("");
    },
    [inputVal]
  );

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClear = useCallback(() => {
    setEntries([]);
    localStorage.setItem(STORAGE_KEY_CAL_ACCUM, "0");
  }, []);

  const handleToggleLightDay = useCallback(async () => {
    if (!isLightDayActive) {
      // Start light day
      const todayStr = new Date().toISOString().split("T")[0];
      setIsLightDayActive(true);
      setActiveDate(todayStr);
    } else {
      // Complete light day: Save record to adapter
      const dateToSave = activeDate || new Date().toISOString().split("T")[0];
      const record: FastRecord = {
        id: `light-${Date.now()}`,
        startTime: `${dateToSave}T08:00:00.000Z`,
        endTime: new Date().toISOString(),
        durationMs: 43200000, // 12h representation for light day
        completed: true,
        pattern: "5:2",
        createdAt: new Date().toISOString(),
        kcal: totalKcal,
      };

      await adapter.save(record);
      onRecordSaved?.(record);

      setIsLightDayActive(false);
      setActiveDate("");
      setEntries([]);
    }
  }, [isLightDayActive, activeDate, totalKcal, onRecordSaved]);

  const dayLabelsMap: Record<WeekdayKey, string> = {
    mon: t("days.mon"),
    tue: t("days.tue"),
    wed: t("days.wed"),
    thu: t("days.thu"),
    fri: t("days.fri"),
    sat: t("days.sat"),
    sun: t("days.sun"),
  };

  const formattedScheduledDays = lightDays
    .map((d) => dayLabelsMap[d])
    .join(" & ");

  return {
    inputVal,
    setInputVal,
    entries,
    totalKcal,
    isLightDayActive,
    activeDate,
    formattedScheduledDays,
    isTodayLightDay,
    handleAddKcal,
    handleRemoveEntry,
    handleClear,
    handleToggleLightDay,
  };
}
