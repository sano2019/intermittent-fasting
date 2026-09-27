import React from "react";
import { FastRecord } from "../store/StorageAdapter";
import { useTranslation } from "../i18n/I18nContext";
import { useCalorieTracker } from "../hooks/useCalorieTracker";
import { CalorieEntriesList } from "./CalorieEntriesList";

interface CalorieDayCardProps {
  onRecordSaved?: (record: FastRecord) => void;
}

export function CalorieDayCard({ onRecordSaved }: CalorieDayCardProps) {
  const { t } = useTranslation();
  const {
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
  } = useCalorieTracker(onRecordSaved);

  return (
    <section className="card calorie-card" aria-label="5:2 Calorie Day">
      <div className="calorie-card-title">
        5:2 · {t("timer.calorie_day")}
      </div>

      <div className="cal-display-wrap">
        <span className="cal-total-number">{totalKcal}</span>
        <div className="cal-subtitle">
          {t("timer.light_day_title")} — {isLightDayActive ? activeDate : "—"}
        </div>
      </div>

      {/* Subtle Schedule Banner */}
      <div className="cal-schedule-banner">
        <span className="cal-schedule-label">
          {t("timer.light_days_schedule")}: <strong>{formattedScheduledDays || "Mon & Thu"}</strong>
        </span>
        <span
          className={`cal-schedule-tag ${
            isTodayLightDay ? "active-today" : ""
          }`}
        >
          {isTodayLightDay ? "Today is Light Day" : "Normal Eating Day"}
        </span>
      </div>

      {/* Calorie Intake Form */}
      <form onSubmit={handleAddKcal} className="cal-entry-group">
        <label htmlFor="cal-intake-input" className="cal-entry-label">
          {t("timer.cal_intake")}{" "}
          <span className="cal-entry-sub">{t("timer.cal_intake_sub")}</span>
        </label>

        <div className="cal-input-row">
          <input
            id="cal-intake-input"
            type="number"
            min="0"
            max="9999"
            placeholder="kcal"
            className="cal-input"
            value={inputVal}
            onChange={(e) =>
              setInputVal(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
            }
          />
          <button
            type="submit"
            className="btn-cal-add"
            aria-label="Add calories"
          >
            +
          </button>
        </div>
      </form>

      {/* Logged Meal Chips */}
      <CalorieEntriesList
        entries={entries}
        onRemoveEntry={handleRemoveEntry}
      />

      {/* Suggested guidelines */}
      <div className="cal-suggested-text">{t("timer.suggested_cal")}</div>

      {/* Reset note */}
      <div className="cal-reset-text">
        {t("timer.cal_accum_note")}{" "}
        <button type="button" className="btn-cal-clear" onClick={handleClear}>
          {t("timer.clear")}
        </button>{" "}
        {t("timer.cal_reset_note")}
      </div>

      {/* Action Button */}
      <button
        type="button"
        className={`btn-light-day ${isLightDayActive ? "active-mode" : ""}`}
        onClick={handleToggleLightDay}
      >
        {isLightDayActive
          ? t("timer.complete_light_day")
          : t("timer.start_light_day")}
      </button>
    </section>
  );
}
