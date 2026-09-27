import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTranslation } from "../i18n/I18nContext";
import { adapter } from "../store/StorageAdapter";
import type { WeightLog } from "../types/weight";
import { LogWeightModal } from "./LogWeightModal";

export interface WeightTrendChartProps {
  className?: string;
  daysRange?: number;
}

export function WeightTrendChart({
  className = "",
  daysRange = 30,
}: WeightTrendChartProps) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadLogs = async () => {
    const data = await adapter.loadWeightLogs();
    setLogs(data);
  };

  useEffect(() => {
    loadLogs();

    const handleUpdate = () => {
      loadLogs();
    };

    window.addEventListener("weight-logs-updated", handleUpdate);
    return () => window.removeEventListener("weight-logs-updated", handleUpdate);
  }, []);

  // Filter logs for the selected range (past 30 days by default)
  const filteredLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysRange);
    cutoff.setHours(0, 0, 0, 0);

    return logs
      .filter((log) => new Date(log.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs, daysRange]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return filteredLogs.map((log) => {
      const d = new Date(log.date);
      const displayDate = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return {
        date: log.date,
        displayDate,
        weight: log.weight,
        unit: log.unit,
      };
    });
  }, [filteredLogs]);

  // Statistics
  const latestLog = filteredLogs[filteredLogs.length - 1];
  const earliestLog = filteredLogs[0];

  const diffText = useMemo(() => {
    if (!latestLog || !earliestLog || filteredLogs.length < 2) return null;
    const diff = latestLog.weight - earliestLog.weight;
    if (Math.abs(diff) < 0.05) return t("weight.steady");
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)} ${latestLog.unit}`;
  }, [latestLog, earliestLog, filteredLogs.length, t]);

  const handleSave = async (log: WeightLog) => {
    await adapter.saveWeightLog(log);
  };

  const handleDelete = async (id: string) => {
    await adapter.deleteWeightLog(id);
  };

  return (
    <div className={`weight-trend-container ${className}`.trim()}>
      <div className="weight-trend-header">
        <div className="weight-trend-title-wrap">
          <h3 className="weight-trend-title">{t("weight.title")}</h3>
          <span className="weight-trend-subtitle">{t("weight.subtitle")}</span>
        </div>

        <button
          type="button"
          className="weight-log-btn"
          onClick={() => setIsModalOpen(true)}
        >
          {t("weight.log_btn")}
        </button>
      </div>

      {filteredLogs.length > 0 && (
        <div className="weight-metrics-summary">
          {latestLog && (
            <div className="weight-metric-item">
              <span className="weight-metric-label">{t("weight.latest")}</span>
              <span className="weight-metric-value">
                {latestLog.weight} {latestLog.unit}
              </span>
            </div>
          )}

          {diffText && (
            <div className="weight-metric-item">
              <span className="weight-metric-label">{t("weight.change")}</span>
              <span className="weight-metric-value">{diffText}</span>
            </div>
          )}
        </div>
      )}

      {chartData.length >= 2 ? (
        <div className="weight-chart-wrapper">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <XAxis
                dataKey="displayDate"
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
                allowDecimals={true}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="weight-custom-tooltip">
                        <strong>{data.displayDate}</strong>: {data.weight}{" "}
                        {data.unit}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--fg)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--fg)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="weight-empty-box">{t("weight.empty")}</div>
      )}

      {/* Lightweight, Decoupled Modal */}
      <LogWeightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        recentLogs={filteredLogs}
        defaultWeight={latestLog?.weight}
        defaultUnit={latestLog?.unit}
      />
    </div>
  );
}
