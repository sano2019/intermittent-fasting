import React, { useState, useEffect } from "react";
import { useTimer } from "../hooks/useTimer";
import { TimerPills } from "./TimerPills";
import { ConfirmFastModal } from "./ConfirmFastModal";
import { AdjustStartTimeModal } from "./AdjustStartTimeModal";
import { adapter } from "../store/StorageAdapter";
import { useTranslation } from "../i18n/I18nContext";
import type { FastRecord, FastingPattern } from "../types/fasting";

export interface TimerRingProps {
  pattern?: FastingPattern;
  onFastCompleted?: (record: FastRecord) => void;
}

export function TimerRing({
  pattern = "Custom",
  onFastCompleted,
}: TimerRingProps) {
  const { t } = useTranslation();

  // Determine hours based on pattern
  const [customHours, setCustomHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("fast-hours");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 72) return parsed;
      }
    } catch {
      // fallback
    }
    return 16;
  });

  const targetHours =
    pattern === "OMAD"
      ? 24
      : pattern === "16:8"
      ? 16
      : customHours;

  const canAdjustHours = pattern === "Custom";

  const handleDecrement = () => {
    if (customHours > 1) {
      const next = customHours - 1;
      setCustomHours(next);
      localStorage.setItem("fast-hours", String(next));
    }
  };

  const handleIncrement = () => {
    if (customHours < 72) {
      const next = customHours + 1;
      setCustomHours(next);
      localStorage.setItem("fast-hours", String(next));
    }
  };

  const fastMinutes = targetHours * 60;

  const {
    isActive,
    startTime,
    showRemaining,
    setShowRemaining,
    timeText,
    pct,
    startTimer,
    stopAndCaptureFast,
    updateStartTime,
  } = useTimer({ fastMinutes, onFastCompleted });

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [capturedSession, setCapturedSession] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  const circumference = 502.65; // 2 * Math.PI * 80
  const strokeDashoffset = circumference * (1 - pct);

  const handleActionClick = () => {
    if (!isActive) {
      startTimer();
    } else {
      // Immediately stop the timer and freeze the captured session times
      const session = stopAndCaptureFast();
      setCapturedSession(session);
    }
  };

  const handleSaveConfirmed = async (record: FastRecord) => {
    await adapter.save(record);
    onFastCompleted?.(record);
    setCapturedSession(null);
  };

  const handleCancel = () => {
    setCapturedSession(null);
  };

  return (
    <>
      <div className="card timer-ring-card">
        <div className="timer-card-title">{t("tracking.fast")}</div>

        <TimerPills
          showRemaining={showRemaining}
          onToggle={setShowRemaining}
        />

        <div className="ring-wrap">
          <svg
            className="timer-ring"
            viewBox="0 0 200 200"
            aria-label="timer ring"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--ring-track, #eae8e0)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--progress-green, #7fbf7f)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="ring-time">{timeText}</div>
        </div>

        {/* When active: show Adjust start time button (Screenshot 1). When stopped: show stepper. */}
        {isActive ? (
          <div className="adjust-start-time-wrap">
            <button
              type="button"
              className="btn-adjust-start-time"
              onClick={() => setIsAdjustOpen(true)}
            >
              {t("timer.adjust_start")}
            </button>
          </div>
        ) : canAdjustHours ? (
          <div className="timer-stepper" aria-label="Adjust fast duration">
            <button
              type="button"
              className="stepper-btn"
              aria-label="Decrease fast duration"
              disabled={customHours <= 1}
              onClick={handleDecrement}
            >
              −
            </button>
            <span className="stepper-label">{customHours} hr</span>
            <button
              type="button"
              className="stepper-btn"
              aria-label="Increase fast duration"
              disabled={customHours >= 72}
              onClick={handleIncrement}
            >
              +
            </button>
          </div>
        ) : (
          <div className="timer-stepper" aria-label="Fast duration">
            <span className="stepper-label">{targetHours} hr</span>
          </div>
        )}

        <button
          type="button"
          className={`primary-btn timer-start ${isActive ? "stop-mode" : ""}`.trim()}
          onClick={handleActionClick}
        >
          {isActive ? t("timer.stop") : t("timer.start")}
        </button>
      </div>

      <AdjustStartTimeModal
        isOpen={isAdjustOpen}
        currentStartTime={startTime}
        onSave={(newIso) => {
          updateStartTime(newIso);
        }}
        onClose={() => setIsAdjustOpen(false)}
      />

      <ConfirmFastModal
        isOpen={Boolean(capturedSession)}
        initialStartTime={capturedSession?.startTime}
        initialEndTime={capturedSession?.endTime}
        initialPattern={pattern}
        onSave={handleSaveConfirmed}
        onCancel={handleCancel}
      />
    </>
  );
}
