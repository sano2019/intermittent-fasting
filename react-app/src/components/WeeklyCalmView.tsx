import React from "react";
import { useTranslation } from "../i18n/I18nContext";

export interface WeeklyCalmViewProps {
  is52: boolean;
  progressCount: number;
  targetCount: number;
}

export function WeeklyCalmView({
  is52,
  progressCount,
  targetCount,
}: WeeklyCalmViewProps) {
  const { t } = useTranslation();

  return (
    <div className="weekly-calm-content">
      <div className="weekly-stat-completed">
        {is52
          ? t("review.rhythm_52", {
              count: progressCount,
              total: targetCount,
            })
          : t("review.rhythm", {
              count: progressCount,
              total: targetCount,
            })}
      </div>

      <div className="weekly-stat-note">{t("review.note")}</div>
    </div>
  );
}
