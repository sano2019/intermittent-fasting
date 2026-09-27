import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { FastRecord, FastingPattern } from "../types/fasting";
import { useWeeklyReview } from "../hooks/useWeeklyReview";
import { WeeklyRhythmDots } from "./WeeklyRhythmDots";
import { WeeklyCalmView } from "./WeeklyCalmView";
import { WeeklyDataGrid } from "./WeeklyDataGrid";
import { WeightTrendChart } from "./WeightTrendChart";

interface WeeklyReviewProps {
  records: FastRecord[];
  onOpenHistory: () => void;
  pattern?: FastingPattern;
}

export function WeeklyReview({
  records,
  onOpenHistory,
  pattern,
}: WeeklyReviewProps) {
  const { t } = useTranslation();
  const { viewMode, stats } = useWeeklyReview(records, pattern);

  return (
    <section className="card weekly-review-card" aria-label="Weekly review">
      <div className="weekly-review-title">{t("review.title")}</div>

      {/* The 7-day rhythm dots are always shown */}
      <WeeklyRhythmDots dayStats={stats.dayStats} />

      {viewMode === "calm" ? (
        /* Calm View: Peaceful rhythm without pressure or streak counters */
        <WeeklyCalmView
          is52={stats.is52}
          progressCount={stats.progressCount}
          targetCount={stats.targetCount}
        />
      ) : (
        /* Data View: Clear, uplifting, non-punishing analytical metrics */
        <>
          <WeeklyDataGrid stats={stats} />
          {/* Modular Weight Trend Chart (only in Data View; portable anywhere) */}
          <WeightTrendChart />
        </>
      )}

      <div className="weekly-history-wrap">
        <button
          type="button"
          className="btn-previous-fasts"
          onClick={onOpenHistory}
        >
          {t("history.button")}
        </button>
      </div>
    </section>
  );
}
