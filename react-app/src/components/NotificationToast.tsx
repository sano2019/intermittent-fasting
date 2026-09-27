import React, { useState, useEffect } from "react";
import type { InAppToastDetail } from "../services/notificationService";

export function NotificationToast() {
  const [toast, setToast] = useState<InAppToastDetail | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<InAppToastDetail>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
      }
    };

    window.addEventListener("app-toast-message", handleToast);
    return () => {
      window.removeEventListener("app-toast-message", handleToast);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="in-app-toast"
      onClick={() => setToast(null)}
    >
      <div className="in-app-toast-inner">
        <div className="in-app-toast-title">{toast.title}</div>
        <div className="in-app-toast-body">{toast.body}</div>
      </div>
      <button
        type="button"
        className="in-app-toast-close"
        aria-label="Close notification"
        onClick={(e) => {
          e.stopPropagation();
          setToast(null);
        }}
      >
        ×
      </button>
    </div>
  );
}
