export interface FastRecord {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  completed: boolean;
  pattern: string;
  createdAt: string;
}

export interface StorageAdapter {
  save(r: FastRecord): Promise<void>;
  loadAll(): Promise<FastRecord[]>;
  loadRange(s: Date, e: Date): Promise<FastRecord[]>;
  delete(i: string): Promise<void>;
  loadProfile(): Promise<any>;
  saveProfile(p: any): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private K = "fast-records-v1";

  async save(r: FastRecord): Promise<void> {
    const a = await this.loadAll();
    a.push(r);
    window.localStorage.setItem(this.K, JSON.stringify(a));
  }

  async loadAll(): Promise<FastRecord[]> {
    try {
      const raw = window.localStorage.getItem(this.K);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  async loadRange(s: Date, e: Date): Promise<FastRecord[]> {
    return (await this.loadAll()).filter((r) => {
      const d = new Date(r.startTime);
      return d >= s && d <= e;
    });
  }

  async delete(i: string): Promise<void> {
    const a = await this.loadAll();
    window.localStorage.setItem(this.K, JSON.stringify(a.filter((r) => r.id !== i)));
  }

  async loadProfile(): Promise<any> {
    const raw = window.localStorage.getItem("if_local_profile");
    if (!raw) {
      return { id: "local-user-1", name: "You", pattern: "16:8", startTime: "08:00", endTime: "16:00", lang: "en", createdAt: "2026-09-23T09:41:27.285Z" };
    }
    try { return JSON.parse(raw); } catch { return { id: "local-user-1", name: "You", pattern: "16:8", startTime: "08:00", endTime: "16:00", lang: "en", createdAt: "2026-09-23T09:41:27.285Z" }; }
  }

  async saveProfile(p: any): Promise<void> {
    window.localStorage.setItem("if_local_profile", JSON.stringify(p));
  }
}

export const adapter: StorageAdapter = new LocalStorageAdapter();
export const CLOUD_SYNC_ENABLED = false;
