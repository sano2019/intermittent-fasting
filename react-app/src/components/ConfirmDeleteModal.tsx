import React from "react";
import { Modal } from "./Modal";
import { useTranslation } from "../i18n/I18nContext";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      dialogClassName="delete-confirm-dialog"
      ariaLabelledBy="delete-confirm-title"
      elevated={true}
    >
      <h3 id="delete-confirm-title" className="delete-confirm-title">
        {t("delete.confirm")}
      </h3>
      <p className="delete-confirm-desc">{t("delete.note")}</p>
      <div className="delete-confirm-actions">
        <button
          type="button"
          className="btn-delete-cancel"
          onClick={onCancel}
        >
          {t("delete.cancel")}
        </button>
        <button
          type="button"
          className="btn-delete-confirm"
          onClick={onConfirm}
        >
          {t("delete.confirm_btn")}
        </button>
      </div>
    </Modal>
  );
}
