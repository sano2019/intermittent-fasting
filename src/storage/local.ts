import type { StorageAdapter, FastingEntry, Profile } from "./types";

const STORAGE_KEY = "fast-records-v1";

export class LocalStorageAdapter implements StorageAdapter {
  private async getEntries(): Promise<FastingEntry[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  private async setEntries(entries: FastingEntry[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  async save(entry: FastingEntry): Promise<void> {
    const entries = await this.getEntries();
    const existing = entries.findIndex((e) => e.id === entry.id);
    if (existing >= 0) entries[existing] = entry;
    else entries.push(entry);
    await this.setEntries(entries);
  }

  async load(date: string): Promise<FastingEntry | null> {
    const entries = await this.getEntries();
    return entries.find((e) => e.date === date) ?? null;
  }

  async loadRange(start: string, end: string): Promise<FastingEntry[]> {
    const entries = await this.getEntries();
    return entries.filter((e) => e.date >= start && e.date <= end);
  }

  async loadAll(): Promise<FastingEntry[]> {
    return this.getEntries();
  }

  private async getProfile(): Promise<Profile | null> {
    const raw = localStorage.getItem("if_local_profile");
    return raw ? JSON.parse(raw) : null;
  }
  private async setProfile(profile: Profile): Promise<void> {
    localStorage.setItem("if_local_profile", JSON.stringify(profile));
  }

  async saveProfile(profile: Profile): Promise<void> {
    await this.setProfile(profile);
  }
  async loadProfile(): Promise<Profile | null> {
    return this.getProfile();
  }
}
