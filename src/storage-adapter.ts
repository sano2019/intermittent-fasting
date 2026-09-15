export interface FastRecord {
  id: string; startTime: string; endTime: string; durationMs: number;
  completed: boolean; pattern: string; createdAt: string;
}
export interface StorageAdapter {
  save(r: FastRecord): Promise<void>;
  loadAll(): Promise<FastRecord[]>;
  loadRange(s: Date, e: Date): Promise<FastRecord[]>;
  delete(i: string): Promise<void>;
}
// Local adapter (current browser build)
export class LocalStorageAdapter implements StorageAdapter {
  private K = "fast-records-v1";
  async save(r: FastRecord) { const a = await this.loadAll(); a.push(r); window.localStorage.setItem(this.K, JSON.stringify(a)); }
  async loadAll(): Promise<FastRecord[]> { const raw = window.localStorage.getItem(this.K); return raw ? JSON.parse(raw) : []; }
  async loadRange(s: Date, e: Date): Promise<FastRecord[]> { return (await this.loadAll()).filter(r => { const d = new Date(r.startTime); return d >= s && d <= e; }); }
  async delete(i: string) { const a = await this.loadAll(); window.localStorage.setItem(this.K, JSON.stringify(a.filter(r => r.id !== i))); }
}
// SQLite adapter (Fly backend — NOT bundled in browser; import separately)
// export class SqliteStorageAdapter implements StorageAdapter { ... }
export const adapter: StorageAdapter = new LocalStorageAdapter();
export const CLOUD_SYNC_ENABLED = false;
