import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/I18nContext";

export interface AdjustStartTimeModalProps {
  isOpen: boolean;
  currentStartTime: string | null;
  onSave: (newStartTimeIso: string) => void;
  onClose: () => void;
}

function toLocalDatetimeString(dateOrIso: Date | string | null): string {
  const d = dateOrIso ? new Date(dateOrIso) : new Date();
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AdjustStartTimeModal({
  isOpen,
  currentStartTime,
  onSave,
  onClose,
}: AdjustStartTimeModalProps) {
  const { t } = useTranslation();
  const [val, setVal] = useState("");

  useEffect(() => {
    if (isOpen) {
      setVal(toLocalDatetimeString(currentStartTime));
    }
  }, [isOpen, currentStartTime]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val) return;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      onSave(d.toISOString());
    }
    onClose();
  };

  return (
    <div
      className="modal-overlay modal-elevated"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjust-time-modal-title"
    >
      <div
        className="modal-dialog adjust-time-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="adjust-time-modal-title" className="adjust-time-title">
          {t("timer.adjust_start")}
        </h3>

        <form onSubmit={handleSave}>
          <div className="adjust-time-field">
            <label htmlFor="adjust-start-input" className="adjust-time-label">
              {t("timer.adjust_start_label")}
            </label>
            <input
              id="adjust-start-input"
              type="datetime-local"
              className="adjust-time-input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              required
            />
          </div>

          <div className="adjust-time-actions">
            <button
              type="button"
              className="btn-adjust-cancel"
              onClick={onClose}
            >
              {t("confirm.cancel")}
            </button>
            <button
              type="submit"
              className="btn-adjust-save"
            >
              {t("confirm.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
