import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { WeeklyReviewStats } from "../hooks/useWeeklyReview";

export interface WeeklyDataGridProps {
  stats: WeeklyReviewStats;
}

export function WeeklyDataGrid({ stats }: WeeklyDataGridProps) {
  const { t } = useTranslation();

  return (
    <div className="weekly-data-grid">
      <div className="weekly-data-card">
        <span className="data-card-label">
          {t("review.data_weekly_target")}
        </span>
        <span className="data-card-value">
          {stats.progressCount} / {stats.targetCount}{" "}
          <span className="data-card-sub">({stats.consistencyPct}%)</span>
        </span>
      </div>

      <div className="weekly-data-card">
        <span className="data-card-label">
          {t("review.data_longest_fast")}
        </span>
        <span className="data-card-value">
          {stats.longestFastHours}{" "}
          <span className="data-card-unit">{t("timer.unit")}</span>
        </span>
      </div>

      <div className="weekly-data-card">
        <span className="data-card-label">
          {t("review.data_total_fasted")}
        </span>
        <span className="data-card-value">
          {stats.totalHours}{" "}
          <span className="data-card-unit">{t("timer.unit")}</span>
        </span>
      </div>

      <div className="weekly-data-card">
        <span className="data-card-label">
          {t("review.data_avg_fast")}
        </span>
        <span className="data-card-value">
          {stats.avgHours}{" "}
          <span className="data-card-unit">{t("timer.unit")}</span>
        </span>
      </div>

      <div className="weekly-data-card">
        <span className="data-card-label">
          {t("review.data_all_time_fasts")}
        </span>
        <span className="data-card-value">
          {t("review.all_time_completed_unit", {
            count: stats.allTimeCount,
          })}
        </span>
      </div>

      {stats.hasCalorieData ? (
        <div className="weekly-data-card">
          <span className="data-card-label">
            {t("review.data_calories")}
          </span>
          <span className="data-card-value">
            {stats.totalKcalDisplay}{" "}
            <span className="data-card-unit">kcal</span>
          </span>
        </div>
      ) : (
        <div className="weekly-data-card">
          <span className="data-card-label">
            {t("review.data_calories")}
          </span>
          <span className="data-card-value">—</span>
        </div>
      )}
    </div>
  );
}
