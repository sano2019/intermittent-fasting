export interface ExpertInsight {
  id: string;
  categoryKey: string;
  titleKey: string;
  summaryKey: string;
  sourceName: string;
  sourceUrl: string;
}

export const EXPERT_INSIGHTS: ExpertInsight[] = [
  {
    id: "hunger-waves",
    categoryKey: "insights.cat_physiology",
    titleKey: "insights.waves_title",
    summaryKey: "insights.waves_desc",
    sourceName: "J. Clin. Endocrinol. Metab. (Cummings et al.)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11297590/",
  },
  {
    id: "cellular-autophagy",
    categoryKey: "insights.cat_cellular",
    titleKey: "insights.autophagy_title",
    summaryKey: "insights.autophagy_desc",
    sourceName: "New England Journal of Medicine (de Cabo & Mattson, 2019)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/31881139/",
  },
  {
    id: "circadian-timing",
    categoryKey: "insights.cat_circadian",
    titleKey: "insights.circadian_title",
    summaryKey: "insights.circadian_desc",
    sourceName: "Cell Metabolism (Sutton et al., 2018)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29754952/",
  },
  {
    id: "hydration-electrolytes",
    categoryKey: "insights.cat_hydration",
    titleKey: "insights.hydration_title",
    summaryKey: "insights.hydration_desc",
    sourceName: "Nutrients / American Physiological Society",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/31443472/",
  },
  {
    id: "gentle-breaking",
    categoryKey: "insights.cat_nutrition",
    titleKey: "insights.breaking_title",
    summaryKey: "insights.breaking_desc",
    sourceName: "Harvard Medical School Publishing",
    sourceUrl: "https://www.health.harvard.edu/heart-health/intermittent-fasting-surprising-update",
  },
  {
    id: "listen-to-body",
    categoryKey: "insights.cat_safety",
    titleKey: "insights.listen_title",
    summaryKey: "insights.listen_desc",
    sourceName: "Johns Hopkins Medicine (Mattson et al.)",
    sourceUrl: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/intermittent-fasting-what-is-it-and-how-does-it-work",
  },
  {
    id: "metabolic-switch",
    categoryKey: "insights.cat_metabolism",
    titleKey: "insights.switch_title",
    summaryKey: "insights.switch_desc",
    sourceName: "Obesity Journal (Anton et al., 2018)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29086496/",
  },
  {
    id: "evening-rest",
    categoryKey: "insights.cat_rest",
    titleKey: "insights.evening_title",
    summaryKey: "insights.evening_desc",
    sourceName: "Nature Reviews Endocrinology (Panda et al.)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/33828287/",
  },
];
