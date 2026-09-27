export type FastingPattern = "16:8" | "5:2" | "OMAD" | "Custom";

export type FastingTheme = "light" | "dark";

export type SupportedLanguage = "en" | "nl" | "sv" | "vi";

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface UserProfile {
  id: string;
  name: string;
  pattern: FastingPattern;
  startTime: string; // Eating start time
  endTime: string;   // Eating end time
  lang: SupportedLanguage;
  theme?: FastingTheme;
  reviewMode?: "calm" | "data";
  createdAt: string;
  notificationsEnabled?: boolean;
  lightDays?: WeekdayKey[];
  lightDayReminderTime?: string;
}

export interface FastRecord {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  completed: boolean;
  pattern: FastingPattern;
  createdAt: string;
  kcal?: number;
}
