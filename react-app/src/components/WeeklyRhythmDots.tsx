import React from "react";
import type { DayStat } from "../hooks/useWeeklyReview";

export interface WeeklyRhythmDotsProps {
  dayStats: DayStat[];
}

export function WeeklyRhythmDots({ dayStats }: WeeklyRhythmDotsProps) {
  return (
    <div className="weekly-dots-row">
      {dayStats.map((day) => (
        <div key={day.label} className="weekly-day-col">
          <span
            className={`day-dot ${day.status}`}
            title={`${day.label}: ${day.status}`}
          />
          <span className="day-label">{day.label}</span>
        </div>
      ))}
    </div>
  );
}
