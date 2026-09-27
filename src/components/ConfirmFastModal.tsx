import React, { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "./Modal";
import { useTranslation } from "../i18n/I18nContext";
import type { FastRecord, FastingPattern } from "../types/fasting";

export interface ConfirmFastModalProps {
  isOpen: boolean;
  initialStartTime?: string | null;
  initialEndTime?: string | null;
  initialPattern?: FastingPattern;
  onSave: (record: FastRecord) => Promise<void> | void;
  onCancel: () => void;
}

function toLocalDatetimeString(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function ConfirmFastModal({
  isOpen,
  initialStartTime,
  initialEndTime,
  initialPattern = "16:8",
  onSave,
  onCancel,
}: ConfirmFastModalProps) {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState<FastingPattern>(initialPattern);
  const [startStr, setStartStr] = useState<string>("");
  const [endStr, setEndStr] = useState<string>("");

  const wasOpenRef = useRef(false);

  // Initialize form state ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const startDate = initialStartTime ? new Date(initialStartTime) : new Date();
      const endDate = initialEndTime ? new Date(initialEndTime) : new Date();

      setStartStr(toLocalDatetimeString(startDate));
      setEndStr(toLocalDatetimeString(endDate));
      setPattern(initialPattern);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialStartTime, initialEndTime, initialPattern]);

  const durationText = useMemo(() => {
    const defaultText = t("confirm.duration", {
      hrs: 0,
      unitHrs: t("unit.hrs"),
      mins: 0,
      unitMins: t("unit.mins"),
    });

    if (!startStr || !endStr) return defaultText;
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) {
      return defaultText;
    }
    const diffMs = e - s;
    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return t("confirm.duration", {
      hrs: hours,
      unitHrs: t("unit.hrs"),
      mins: minutes,
      unitMins: t("unit.mins"),
    });
  }, [startStr, endStr, t]);

  const handleSave = async () => {
    const sDate = new Date(startStr);
    const eDate = new Date(endStr);
    const sMs = isNaN(sDate.getTime()) ? Date.now() : sDate.getTime();
    const eMs = isNaN(eDate.getTime()) ? Date.now() : eDate.getTime();
    const durationMs = Math.max(0, eMs - sMs);

    const targetHours =
      pattern === "OMAD"
        ? 24
        : pattern === "20:4"
        ? 20
        : pattern === "18:6"
        ? 18
        : pattern === "5:2"
        ? 24
        : 16;
    const targetMs = targetHours * 3600000;

    const record: FastRecord = {
      id: `fast-${Date.now()}`,
      startTime: new Date(sMs).toISOString(),
      endTime: new Date(eMs).toISOString(),
      durationMs,
      completed: durationMs >= targetMs,
      pattern,
      createdAt: new Date().toISOString(),
    };

    await onSave(record);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      dialogClassName="confirm-fast-dialog"
      ariaLabelledBy="confirm-fast-title"
    >
      <h2 id="confirm-fast-title" className="confirm-fast-title">
        {t("confirm.fast")}
      </h2>

      <div className="confirm-fast-duration">{durationText}</div>

      <div className="confirm-fast-pattern-row">
        <label htmlFor="confirm-pattern-select" className="confirm-fast-pattern-label">
          {t("confirm.pattern")}
        </label>
        <select
          id="confirm-pattern-select"
          className="confirm-fast-select"
          value={pattern}
          onChange={(e) => setPattern(e.target.value as FastingPattern)}
        >
          <option value="16:8">16:8</option>
          <option value="18:6">18:6</option>
          <option value="20:4">20:4</option>
          <option value="OMAD">OMAD</option>
          <option value="5:2">5:2</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      <div className="confirm-fast-field">
        <label htmlFor="confirm-start-input" className="confirm-fast-field-label">
          {t("confirm.start")}
        </label>
        <input
          id="confirm-start-input"
          type="datetime-local"
          className="confirm-fast-input"
          value={startStr}
          onChange={(e) => setStartStr(e.target.value)}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            if (val) setStartStr(val);
          }}
        />
      </div>

      <div className="confirm-fast-field">
        <label htmlFor="confirm-end-input" className="confirm-fast-field-label">
          {t("confirm.end")}
        </label>
        <input
          id="confirm-end-input"
          type="datetime-local"
          className="confirm-fast-input"
          value={endStr}
          onChange={(e) => setEndStr(e.target.value)}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            if (val) setEndStr(val);
          }}
        />
      </div>

      <div className="confirm-fast-actions">
        <button
          type="button"
          className="btn-confirm-cancel"
          onClick={onCancel}
        >
          {t("confirm.cancel")}
        </button>
        <button
          type="button"
          className="btn-confirm-save"
          onClick={handleSave}
        >
          {t("confirm.save")}
        </button>
      </div>
    </Modal>
  );
}
