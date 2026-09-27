import React, { useState } from "react";
import { useTranslation } from "../i18n/I18nContext";
import { EXPERT_INSIGHTS } from "../data/expertInsights";
import { Modal } from "./Modal";

export function ExpertInsightsCard() {
  const { t } = useTranslation();

  // Pick a random initial insight once per session
  const [currentIndex, setCurrentIndex] = useState(() => {
    return Math.floor(Math.random() * EXPERT_INSIGHTS.length);
  });

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % EXPERT_INSIGHTS.length);
  };

  const currentInsight = EXPERT_INSIGHTS[currentIndex];

  return (
    <>
      <section
        className="expert-insights-card"
        aria-label="Expert insights and science"
      >
        <div className="expert-insights-header">
          <div className="expert-insights-title-group">
            <h2 className="expert-insights-title">{t("insights.title")}</h2>
            <span className="insight-category-badge">
              {t(currentInsight.categoryKey)}
            </span>
          </div>

          <button
            type="button"
            className="insight-next-btn"
            onClick={handleNext}
            aria-label="Next scientific insight"
          >
            {t("insights.next")} <span>→</span>
          </button>
        </div>

        <div key={currentInsight.id} className="insight-content-wrap">
          <h3 className="insight-headline">{t(currentInsight.titleKey)}</h3>
          <p className="insight-text">{t(currentInsight.summaryKey)}</p>

          <div className="insight-source-box">
            <span className="insight-source-label">
              {t("insights.source_label")}
            </span>
            <a
              href={currentInsight.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="insight-source-link"
              title="Open peer-reviewed source in a new tab"
            >
              <span>{currentInsight.sourceName}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="insight-footer">
          <button
            type="button"
            className="insight-disclaimer-btn"
            onClick={() => setIsDisclaimerOpen(true)}
          >
            {t("insights.disclaimer_btn")}
          </button>
        </div>
      </section>

      {/* Medical & Health Disclaimer Modal */}
      <Modal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        dialogClassName="disclaimer-dialog"
        ariaLabelledBy="disclaimer-modal-title"
      >
        <h2 id="disclaimer-modal-title" className="disclaimer-title">
          {t("disclaimer.title")}
        </h2>

        <div className="disclaimer-section">
          <p>{t("disclaimer.p1")}</p>
          <p>{t("disclaimer.p2")}</p>
        </div>

        <div className="disclaimer-highlight">
          <strong>{t("disclaimer.highlight_title")}: </strong>
          {t("disclaimer.highlight_body")}
        </div>

        <div className="disclaimer-close-wrap">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsDisclaimerOpen(false)}
          >
            {t("disclaimer.close")}
          </button>
        </div>
      </Modal>
    </>
  );
}
