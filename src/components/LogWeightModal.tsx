import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { WeightLog } from "../types/weight";
import { Modal } from "./Modal";

export interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: WeightLog) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  recentLogs: WeightLog[];
  defaultWeight?: number;
  defaultUnit?: "kg" | "lbs";
}

export function LogWeightModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  recentLogs,
  defaultWeight,
  defaultUnit = "kg",
}: LogWeightModalProps) {
  const { t } = useTranslation();

  const [inputDate, setInputDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [inputWeight, setInputWeight] = useState("");
  const [inputUnit, setInputUnit] = useState<"kg" | "lbs">("kg");

  useEffect(() => {
    if (isOpen) {
      setInputDate(new Date().toISOString().split("T")[0]);
      if (typeof defaultWeight === "number") {
        setInputWeight(String(defaultWeight));
        setInputUnit(defaultUnit);
      } else {
        setInputWeight("");
      }
    }
  }, [isOpen, defaultWeight, defaultUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val <= 0) return;

    const newLog: WeightLog = {
      id: `weight-${Date.now()}`,
      date: inputDate,
      weight: parseFloat(val.toFixed(1)),
      unit: inputUnit,
      createdAt: new Date().toISOString(),
    };

    await onSave(newLog);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      dialogClassName="weight-modal-dialog"
      ariaLabelledBy="weight-modal-title"
    >
      <h2 id="weight-modal-title" className="weight-modal-title">
        {t("weight.modal_title")}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="weight-form-group">
          <label htmlFor="weight-date" className="weight-form-label">
            {t("weight.date_label")}
          </label>
          <input
            id="weight-date"
            type="date"
            className="weight-input"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            required
          />
        </div>

        <div className="weight-form-group">
          <label htmlFor="weight-num" className="weight-form-label">
            {t("weight.weight_label")}
          </label>
          <div className="weight-input-row">
            <input
              id="weight-num"
              type="number"
              step="0.1"
              min="20"
              max="300"
              className="weight-input"
              placeholder="70.5"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              required
              autoFocus
            />

            <div className="weight-unit-toggle">
              <button
                type="button"
                className={`weight-unit-btn ${inputUnit === "kg" ? "active" : ""}`}
                onClick={() => setInputUnit("kg")}
              >
                kg
              </button>
              <button
                type="button"
                className={`weight-unit-btn ${inputUnit === "lbs" ? "active" : ""}`}
                onClick={() => setInputUnit("lbs")}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        <div className="weight-modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            {t("weight.cancel")}
          </button>
          <button type="submit" className="primary-btn weight-save-btn">
            {t("weight.save")}
          </button>
        </div>
      </form>

      {recentLogs.length > 0 && (
        <div className="weight-recent-list">
          <div className="weight-recent-title">
            {t("weight.recent_title")}
          </div>
          {recentLogs
            .slice()
            .reverse()
            .map((log) => (
              <div key={log.id} className="weight-recent-item">
                <span>
                  {log.date}: {log.weight} {log.unit}
                </span>
                <button
                  type="button"
                  className="weight-delete-btn"
                  onClick={() => onDelete(log.id)}
                  title={t("weight.delete")}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      )}
    </Modal>
  );
}
