export type FastingPattern = "16:8" | "5:2" | "OMAD" | "custom";

export interface FastingEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  completed: boolean;
  pattern: FastingPattern;
  notes?: string;
}

export interface WeeklyReview {
  weekStarting: string;
  completedDays: number;
  totalDays: number;
  currentStreak: number;
  notes?: string;
}

export interface StorageAdapter {
  save(entry: FastingEntry): Promise<void>;
  load(date: string): Promise<FastingEntry | null>;
  loadRange(start: string, end: string): Promise<FastingEntry[]>;
  loadAll(): Promise<FastingEntry[]>;
}
