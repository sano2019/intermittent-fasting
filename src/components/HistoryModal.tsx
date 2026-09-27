import React, { useState } from "react";
import { Modal } from "./Modal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { HistoryItemRow } from "./HistoryItemRow";
import { useTranslation } from "../i18n/I18nContext";
import type { FastRecord, FastingPattern } from "../types/fasting";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: FastRecord[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (record: FastRecord) => Promise<void>;
}

export function HistoryModal({
  isOpen,
  onClose,
  records,
  onDelete,
  onUpdate,
}: HistoryModalProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editPattern, setEditPattern] = useState<FastingPattern>("16:8");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageRecords = records.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const formatHeaderDate = (startTime: string, endTime: string) => {
    const s = new Date(startTime || Date.now());
    const e = new Date(endTime || startTime || Date.now());
    const days = [
      t("days.sun"),
      t("days.mon"),
      t("days.tue"),
      t("days.wed"),
      t("days.thu"),
      t("days.fri"),
      t("days.sat"),
    ];
    const dayName = days[s.getDay()];

    const pad = (n: number) => String(n).padStart(2, "0");
    const sTime = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
    const eTime = `${pad(e.getHours())}:${pad(e.getMinutes())}`;

    return `${dayName} ${sTime} → ${eTime}`;
  };

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.round(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} ${t("unit.hrs")} ${minutes} ${t("unit.mins")}`;
  };

  const startEdit = (rec: FastRecord) => {
    setEditingId(rec.id);
    const s = new Date(rec.startTime);
    const e = new Date(rec.endTime);
    const pad = (n: number) => String(n).padStart(2, "0");
    setEditStart(`${pad(s.getHours())}:${pad(s.getMinutes())}`);
    setEditEnd(`${pad(e.getHours())}:${pad(e.getMinutes())}`);
    setEditPattern(rec.pattern);
  };

  const saveEdit = async (rec: FastRecord) => {
    try {
      const sDate = new Date(rec.startTime);
      const eDate = new Date(rec.endTime);
      const [sh, sm] = editStart.split(":").map(Number);
      const [eh, em] = editEnd.split(":").map(Number);

      sDate.setHours(sh || 0, sm || 0, 0, 0);
      eDate.setHours(eh || 0, em || 0, 0, 0);

      let newDur = eDate.getTime() - sDate.getTime();
      if (newDur < 0) {
        // Wrapped past midnight
        newDur += 24 * 3600 * 1000;
        eDate.setDate(eDate.getDate() + 1);
      }

      const targetHours =
        rec.pattern === "OMAD"
          ? 24
          : rec.pattern === "20:4"
          ? 20
          : rec.pattern === "18:6"
          ? 18
          : 16;
      const targetMs = targetHours * 3600000;

      await onUpdate({
        ...rec,
        startTime: sDate.toISOString(),
        endTime: eDate.toISOString(),
        durationMs: newDur,
        completed: newDur >= targetMs,
        pattern: editPattern,
      });

      setEditingId(null);
    } catch {
      setEditingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await onDelete(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        dialogClassName="history-modal-dialog"
        ariaLabelledBy="history-modal-title"
      >
        <h2 id="history-modal-title" className="history-modal-title">
          {t("history.title")}
        </h2>

        <div className="history-list">
          {pageRecords.length === 0 ? (
            <div className="history-empty">{t("history.empty")}</div>
          ) : (
            pageRecords.map((rec) => (
              <HistoryItemRow
                key={rec.id}
                record={rec}
                isEditing={editingId === rec.id}
                editStart={editStart}
                editEnd={editEnd}
                editPattern={editPattern}
                formattedDate={formatHeaderDate(rec.startTime, rec.endTime)}
                formattedDuration={formatDuration(rec.durationMs)}
                onStartEdit={startEdit}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={saveEdit}
                onEditStartChange={setEditStart}
                onEditEndChange={setEditEnd}
                onEditPatternChange={setEditPattern}
                onRequestDelete={(id) => setPendingDeleteId(id)}
              />
            ))
          )}
        </div>

        <div className="history-footer">
          <div className="history-pagination-row">
            <span className="history-pagination-info">
              {t("history.page", { page: safePage, total: totalPages })}
            </span>

            {totalPages > 1 && (
              <div className="history-pagination-actions">
                <button
                  type="button"
                  className="history-pag-btn"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  {t("history.prev")}
                </button>
                <button
                  type="button"
                  className="history-pag-btn"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  {t("history.next")}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="history-close-btn"
            onClick={onClose}
          >
            {t("action.close")}
          </button>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
