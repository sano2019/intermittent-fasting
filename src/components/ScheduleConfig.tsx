import React, { useMemo } from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { FastingPattern, WeekdayKey } from "../types/fasting";

const WEEKDAYS: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface ScheduleConfigProps {
  pattern: FastingPattern;
  startTime: string;
  endTime: string;
  lightDays: WeekdayKey[];
  lightDayReminderTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onToggleLightDay: (day: WeekdayKey) => void;
  onLightDayReminderTimeChange: (time: string) => void;
}

export function ScheduleConfig({
  pattern,
  startTime,
  endTime,
  lightDays,
  lightDayReminderTime,
  onStartTimeChange,
  onEndTimeChange,
  onToggleLightDay,
  onLightDayReminderTimeChange,
}: ScheduleConfigProps) {
  const { t } = useTranslation();

  const dayLabelsMap: Record<WeekdayKey, string> = {
    mon: t("days.mon"),
    tue: t("days.tue"),
    wed: t("days.wed"),
    thu: t("days.thu"),
    fri: t("days.fri"),
    sat: t("days.sat"),
    sun: t("days.sun"),
  };

  const areDaysConsecutive = useMemo(() => {
    if (lightDays.length !== 2) return false;
    const idx0 = WEEKDAYS.indexOf(lightDays[0]);
    const idx1 = WEEKDAYS.indexOf(lightDays[1]);
    const diff = Math.abs(idx0 - idx1);
    return diff === 1 || diff === 6;
  }, [lightDays]);

  if (pattern === "5:2") {
    return (
      <div className="profile-52-section">
        <label className="profile-label">
          {t("profile.light_days_title")}
        </label>
        <div
          className="light-days-pills profile-days-pills"
          role="group"
          aria-label="5:2 light days"
        >
          {WEEKDAYS.map((day) => {
            const isSelected = lightDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                className={`light-day-btn ${isSelected ? "selected" : ""}`.trim()}
                onClick={() => onToggleLightDay(day)}
              >
                {dayLabelsMap[day]}
              </button>
            );
          })}
        </div>

        {areDaysConsecutive && (
          <div className="light-days-warning">
            {t("profile.light_days_tip")}
          </div>
        )}

        {/* Reminder time input temporarily commented out until native / Web Push backend is ready */}
        {/*
        <div className="profile-field-group profile-field-group-spaced">
          <label htmlFor="profile-light-time" className="profile-label">
            {t("profile.light_reminder_time")}
          </label>
          <input
            id="profile-light-time"
            type="time"
            className="profile-input"
            value={lightDayReminderTime}
            onChange={(e) => onLightDayReminderTimeChange(e.target.value)}
          />
        </div>
        */}
      </div>
    );
  }

  // Eating start & end time boxes are commented out until integrated directly into the notification settings
  return null;
  /*
  return (
    <div className="profile-times-row">
      <div className="profile-field-group">
        <label htmlFor="profile-start-time" className="profile-label">
          {t("profile.start")}
        </label>
        <input
          id="profile-start-time"
          type="time"
          className="profile-input"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
        />
      </div>

      <div className="profile-field-group">
        <label htmlFor="profile-end-time" className="profile-label">
          {t("profile.end")}
        </label>
        <input
          id="profile-end-time"
          type="time"
          className="profile-input"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
  */
}
