import React, { useEffect } from "react";
import { useTranslation } from "../i18n/I18nContext";

interface OnboardingModalProps {
  isOpen: boolean;
  isUpgraded: boolean;
  onClose: (targetPage?: "home" | "profile") => void;
}

export function OnboardingModal({ isOpen, isUpgraded, onClose }: OnboardingModalProps) {
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(isUpgraded ? "home" : "profile");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUpgraded, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={() => onClose(isUpgraded ? "home" : "profile")}
    >
      <div className="onboarding-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="onboarding-close-btn"
          onClick={() => onClose(isUpgraded ? "home" : "profile")}
          aria-label={t("action.close")}
        >
          &times;
        </button>

        <div className="onboarding-scroll-area">
          {/* Badge */}
          <div className="onboarding-badge">
            {isUpgraded ? `✨ ${t("onboarding.upgrade_badge")}` : `🌿 ${t("onboarding.welcome_badge")}`}
          </div>

          {/* Title */}
          <h2 id="onboarding-title" className="onboarding-title">
            {isUpgraded ? t("onboarding.upgrade_title") : t("onboarding.welcome_title")}
          </h2>

          <p className="onboarding-subtitle">
            {t("app.subtitle")}
          </p>

          {/* Safe Data Preserve Notice for Upgraded Users */}
          {isUpgraded && (
            <div className="onboarding-safe-banner">
              <span className="onboarding-safe-icon" aria-hidden="true">🛡️</span>
              <div className="onboarding-safe-content">
                <div className="onboarding-safe-title">{t("onboarding.safe_data_title")}</div>
                <p className="onboarding-safe-desc">{t("onboarding.safe_data_desc")}</p>
              </div>
            </div>
          )}

          {/* Features Highlights */}
          <div className="onboarding-features-list">
            <div className="onboarding-feature-item">
              <span className="onboarding-feature-icon" aria-hidden="true">⏱️</span>
              <div className="onboarding-feature-content">
                <div className="onboarding-feature-title">{t("onboarding.feat_timer_title")}</div>
                <p className="onboarding-feature-desc">{t("onboarding.feat_timer_desc")}</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <span className="onboarding-feature-icon" aria-hidden="true">🌿</span>
              <div className="onboarding-feature-content">
                <div className="onboarding-feature-title">{t("onboarding.feat_review_title")}</div>
                <p className="onboarding-feature-desc">{t("onboarding.feat_review_desc")}</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <span className="onboarding-feature-icon" aria-hidden="true">🥗</span>
              <div className="onboarding-feature-content">
                <div className="onboarding-feature-title">{t("onboarding.feat_52_title")}</div>
                <p className="onboarding-feature-desc">{t("onboarding.feat_52_desc")}</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <span className="onboarding-feature-icon" aria-hidden="true">⚖️</span>
              <div className="onboarding-feature-content">
                <div className="onboarding-feature-title">{t("onboarding.feat_weight_title")}</div>
                <p className="onboarding-feature-desc">{t("onboarding.feat_weight_desc")}</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <span className="onboarding-feature-icon" aria-hidden="true">🧪</span>
              <div className="onboarding-feature-content">
                <div className="onboarding-feature-title">{t("onboarding.feat_insights_title")}</div>
                <p className="onboarding-feature-desc">{t("onboarding.feat_insights_desc")}</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <span className="onboarding-feature-icon" aria-hidden="true">🔒</span>
              <div className="onboarding-feature-content">
                <div className="onboarding-feature-title">{t("onboarding.feat_offline_title")}</div>
                <p className="onboarding-feature-desc">{t("onboarding.feat_offline_desc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Primary and Secondary CTAs */}
        <div className="onboarding-footer">
          <button
            type="button"
            className="onboarding-btn-primary"
            onClick={() => onClose(isUpgraded ? "home" : "profile")}
          >
            {isUpgraded ? t("onboarding.btn_explore") : t("onboarding.btn_start")}
          </button>
          <button
            type="button"
            className="onboarding-btn-secondary"
            onClick={() => onClose(isUpgraded ? "profile" : "home")}
          >
            {isUpgraded ? t("onboarding.btn_view_settings") : t("onboarding.btn_skip")}
          </button>
        </div>
      </div>
    </div>
  );
}
