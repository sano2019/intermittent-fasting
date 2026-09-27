import React, { useEffect, useRef } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dialogClassName?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  elevated?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  dialogClassName = "",
  ariaLabel,
  ariaLabelledBy,
  elevated = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${elevated ? "modal-elevated" : ""}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`modal-dialog ${dialogClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
