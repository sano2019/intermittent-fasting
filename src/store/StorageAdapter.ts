import type { FastRecord, UserProfile } from "../types/fasting";
import type { WeightLog } from "../types/weight";

export type { FastRecord, UserProfile, WeightLog };

export interface StorageAdapter {
  save(r: FastRecord): Promise<void>;
  update(r: FastRecord): Promise<void>;
  loadAll(): Promise<FastRecord[]>;
  loadRange(s: Date, e: Date): Promise<FastRecord[]>;
  delete(i: string): Promise<void>;
  loadProfile(): Promise<UserProfile>;
  saveProfile(p: Partial<UserProfile>): Promise<void>;
  getActiveFastStartTime(): string | null;
  setActiveFastStartTime(iso: string | null): void;
  loadWeightLogs(): Promise<WeightLog[]>;
  saveWeightLog(log: WeightLog): Promise<void>;
  deleteWeightLog(id: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private K = "fast-records-v1";
  private PROFILE_KEY = "if_local_profile";
  private ACTIVE_FAST_KEY = "timer-base";
  private WEIGHT_KEY = "if_weight_logs_v1";

  private getInitialWeightLogs(): WeightLog[] {
    const now = new Date();
    const d1 = new Date(now.getTime() - 14 * 86400000);
    const d2 = new Date(now.getTime() - 7 * 86400000);
    const d3 = new Date(now.getTime() - 1 * 86400000);
    const toYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    return [
      { id: "weight-seed-1", date: toYMD(d1), weight: 75.0, unit: "kg", createdAt: d1.toISOString() },
      { id: "weight-seed-2", date: toYMD(d2), weight: 74.3, unit: "kg", createdAt: d2.toISOString() },
      { id: "weight-seed-3", date: toYMD(d3), weight: 73.8, unit: "kg", createdAt: d3.toISOString() },
    ];
  }

  private getInitialRecords(): FastRecord[] {
    // Current week's Thursday reference for initial demo data matching screenshot
    const now = new Date();
    const thu = new Date(now);
    // Find this week's Thursday (weekday 4 where Sunday=0, Monday=1)
    const currentDay = now.getDay();
    const diffToThu = (currentDay === 0 ? -3 : 4 - currentDay);
    thu.setDate(now.getDate() + diffToThu);

    const pad = (n: number) => String(n).padStart(2, "0");
    const ymd = `${thu.getFullYear()}-${pad(thu.getMonth() + 1)}-${pad(thu.getDate())}`;

    return [
      {
        id: "fast-seed-1",
        startTime: `${ymd}T14:47:00.000Z`,
        endTime: `${ymd}T18:18:00.000Z`,
        durationMs: (4 * 3600 + 31 * 60) * 1000,
        completed: false,
        pattern: "16:8",
        createdAt: `${ymd}T18:18:00.000Z`,
      },
      {
        id: "fast-seed-2",
        startTime: `${ymd}T00:30:00.000Z`,
        endTime: `${ymd}T00:30:00.000Z`,
        durationMs: 24 * 3600 * 1000,
        completed: true,
        pattern: "16:8",
        createdAt: `${ymd}T00:30:00.000Z`,
      },
    ];
  }

  async save(r: FastRecord): Promise<void> {
    const a = await this.loadAll();
    a.unshift(r); // Add newest first
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(this.K, JSON.stringify(a));
    }
  }

  async update(r: FastRecord): Promise<void> {
    const a = await this.loadAll();
    const idx = a.findIndex((item) => item.id === r.id);
    if (idx !== -1) {
      a[idx] = r;
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(this.K, JSON.stringify(a));
      }
    }
  }

  async loadAll(): Promise<FastRecord[]> {
    if (typeof window === "undefined" || !window.localStorage) {
      return this.getInitialRecords();
    }
    try {
      const raw = window.localStorage.getItem(this.K);
      if (raw === null) {
        const initial = this.getInitialRecords();
        window.localStorage.setItem(this.K, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async loadRange(s: Date, e: Date): Promise<FastRecord[]> {
    return (await this.loadAll()).filter((r) => {
      const d = new Date(r.startTime);
      return d >= s && d <= e;
    });
  }

  async delete(i: string): Promise<void> {
    const a = await this.loadAll();
    const filtered = a.filter((r) => r.id !== i);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(this.K, JSON.stringify(filtered));
    }
  }

  async loadProfile(): Promise<UserProfile> {
    const fallback: UserProfile = {
      id: "local-user-1",
      name: "You",
      pattern: "Custom",
      startTime: "08:00",
      endTime: "16:00",
      lang: "en",
      theme: "light",
      reviewMode: "calm",
      createdAt: "2026-09-23T09:41:27.285Z",
      notificationsEnabled: false,
      lightDays: ["mon", "thu"],
      lightDayReminderTime: "08:00",
    };

    if (typeof window === "undefined" || !window.localStorage) {
      return fallback;
    }

    const raw = window.localStorage.getItem(this.PROFILE_KEY);
    if (!raw) return fallback;

    try {
      return { ...fallback, ...JSON.parse(raw) };
    } catch {
      return fallback;
    }
  }

  async saveProfile(p: Partial<UserProfile>): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      const current = await this.loadProfile();
      const merged: UserProfile = { ...current, ...p };
      window.localStorage.setItem(this.PROFILE_KEY, JSON.stringify(merged));
    }
  }

  getActiveFastStartTime(): string | null {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(this.ACTIVE_FAST_KEY);
  }

  setActiveFastStartTime(iso: string | null): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (iso) {
      window.localStorage.setItem(this.ACTIVE_FAST_KEY, iso);
    } else {
      window.localStorage.removeItem(this.ACTIVE_FAST_KEY);
    }
  }

  async loadWeightLogs(): Promise<WeightLog[]> {
    if (typeof window === "undefined" || !window.localStorage) {
      return this.getInitialWeightLogs();
    }
    try {
      const raw = window.localStorage.getItem(this.WEIGHT_KEY);
      if (raw === null) {
        const initial = this.getInitialWeightLogs();
        window.localStorage.setItem(this.WEIGHT_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async saveWeightLog(log: WeightLog): Promise<void> {
    const logs = await this.loadWeightLogs();
    // If an entry for the same date exists, replace it, otherwise add
    const existingIndex = logs.findIndex((l) => l.date === log.date);
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    // Keep sorted by date ascending
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(this.WEIGHT_KEY, JSON.stringify(logs));
    }
    window.dispatchEvent(new CustomEvent("weight-logs-updated"));
  }

  async deleteWeightLog(id: string): Promise<void> {
    const logs = await this.loadWeightLogs();
    const filtered = logs.filter((l) => l.id !== id);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(this.WEIGHT_KEY, JSON.stringify(filtered));
    }
    window.dispatchEvent(new CustomEvent("weight-logs-updated"));
  }
}

export const adapter: StorageAdapter = new LocalStorageAdapter();
export const CLOUD_SYNC_ENABLED = false;
