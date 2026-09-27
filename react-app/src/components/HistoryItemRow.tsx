import React from "react";
import { useTranslation } from "../i18n/I18nContext";
import type { FastRecord, FastingPattern } from "../types/fasting";

export interface HistoryItemRowProps {
  record: FastRecord;
  isEditing: boolean;
  editStart: string;
  editEnd: string;
  editPattern: FastingPattern;
  formattedDate: string;
  formattedDuration: string;
  onStartEdit: (record: FastRecord) => void;
  onCancelEdit: () => void;
  onSaveEdit: (record: FastRecord) => void;
  onEditStartChange: (val: string) => void;
  onEditEndChange: (val: string) => void;
  onEditPatternChange: (pattern: FastingPattern) => void;
  onRequestDelete: (id: string) => void;
}

export function HistoryItemRow({
  record,
  isEditing,
  editStart,
  editEnd,
  editPattern,
  formattedDate,
  formattedDuration,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditStartChange,
  onEditEndChange,
  onEditPatternChange,
  onRequestDelete,
}: HistoryItemRowProps) {
  const { t } = useTranslation();

  return (
    <div className="history-item">
      <div className="history-item-date">{formattedDate}</div>

      <div className="history-item-main">
        <span className="history-badge">{record.pattern}</span>
        <span className="history-duration">{formattedDuration}</span>
        <span
          className={`history-status-dot ${
            record.completed ? "completed" : "partial"
          }`}
          title={record.completed ? t("status.done") : t("status.missed")}
        />

        <button
          type="button"
          className="history-action-btn"
          title="Edit record"
          aria-label="Edit record"
          onClick={() => onStartEdit(record)}
        >
          ✏️
        </button>

        <button
          type="button"
          className="history-action-btn"
          title="Delete record"
          aria-label="Delete record"
          onClick={() => onRequestDelete(record.id)}
        >
          🗑️
        </button>
      </div>

      {isEditing && (
        <div className="history-edit-box">
          <div className="history-edit-inputs">
            <input
              type="time"
              value={editStart}
              onChange={(e) => onEditStartChange(e.target.value)}
              aria-label="Start time"
            />
            <span>→</span>
            <input
              type="time"
              value={editEnd}
              onChange={(e) => onEditEndChange(e.target.value)}
              aria-label="End time"
            />
            <select
              value={editPattern}
              onChange={(e) =>
                onEditPatternChange(e.target.value as FastingPattern)
              }
              aria-label="Pattern"
            >
              <option value="16:8">16:8</option>
              <option value="18:6">18:6</option>
              <option value="20:4">20:4</option>
              <option value="OMAD">OMAD</option>
              <option value="5:2">5:2</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="history-edit-buttons">
            <button
              type="button"
              className="history-edit-btn"
              onClick={onCancelEdit}
            >
              {t("delete.cancel")}
            </button>
            <button
              type="button"
              className="history-edit-btn save"
              onClick={() => onSaveEdit(record)}
            >
              {t("profile.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
