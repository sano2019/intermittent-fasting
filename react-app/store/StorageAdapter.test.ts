import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { adapter, LocalStorageAdapter, FastRecord, CLOUD_SYNC_ENABLED } from "./StorageAdapter";

describe("StorageAdapter", () => {
  let adapterInst: LocalStorageAdapter;

  beforeEach(() => {
    adapterInst = new LocalStorageAdapter();
    let _store: Record<string, string> = {}; Object.defineProperty(window, 'localStorage', { value: { getItem: (k: string) => _store[k] ?? null, setItem: (k: string, v: string) => { _store[k] = v; }, removeItem: (k: string) => { delete _store[k]; }, clear: () => { _store = {}; } }, writable: true });
  });

  afterEach(() => {
    (window.localStorage as any).clear?.();
  });

  it("save + loadAll returns record", async () => {
    const r: FastRecord = {
      id: "r1",
      startTime: "2026-01-01T08:00:00Z",
      endTime: "2026-01-01T20:00:00Z",
      durationMs: 43200000,
      completed: true,
      pattern: "16:8",
      createdAt: new Date().toISOString(),
    };
    await adapterInst.save(r);
    const all = await adapterInst.loadAll();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe("r1");
    expect(all[0].pattern).toBe("16:8");
  });

  it("loadRange filters by date", async () => {
    const r: FastRecord = {
      id: "r1",
      startTime: "2026-06-15T08:00:00Z",
      endTime: "2026-06-15T20:00:00Z",
      durationMs: 43200000,
      completed: true,
      pattern: "OMAD",
      createdAt: new Date().toISOString(),
    };
    await adapterInst.save(r);
    const range = await adapterInst.loadRange(
      new Date("2026-06-10"),
      new Date("2026-06-20")
    );
    expect(range.length).toBe(1);
    const empty = await adapterInst.loadRange(
      new Date("2026-07-01"),
      new Date("2026-07-10")
    );
    expect(empty.length).toBe(0);
  });

  it("delete removes record", async () => {
    const r: FastRecord = {
      id: "del1",
      startTime: "2026-01-01T08:00:00Z",
      endTime: "2026-01-01T20:00:00Z",
      durationMs: 43200000,
      completed: false,
      pattern: "5:2",
      createdAt: new Date().toISOString(),
    };
    await adapterInst.save(r);
    await adapterInst.delete("del1");
    expect((await adapterInst.loadAll()).length).toBe(0);
  });

  it("loadProfile / saveProfile roundtrip", async () => {
    await adapterInst.saveProfile({ lang: "sv", name: "Test" });
    const p = await adapterInst.loadProfile();
    expect(p.lang).toBe("sv");
  });


  it("loadProfile reads 'if_local_profile' with null default (live key)", async () => {
    const p = await adapterInst.loadProfile();
    expect(p.id).toBeDefined();
    expect(p.lang).toBeDefined();              // null-guard must provide default lang
    expect(p.pattern).toBeDefined();
    expect(p.startTime).toBeDefined();
    expect(p.endTime).toBeDefined();
    expect(p.createdAt).toBeDefined();
  });
  it("loadProfile / saveProfile roundtrip uses 'if_local_profile' (live key)", async () => {
    await adapterInst.saveProfile({ lang: "sv", name: "Test", pattern: "16:8", startTime: "08:00", endTime: "16:00", id: "local-user-1", createdAt: new Date().toISOString() });
    const p = await adapterInst.loadProfile();
    expect(p.lang).toBe("sv");
    expect(p.name).toBe("Test");
    expect(p.pattern).toBe("16:8");
  });
  it("loadAll reads 'fast-records-v1' (live array key)", async () => {
    await adapterInst.save({ id: "r-live", startTime: new Date().toISOString(), endTime: new Date().toISOString(), durationMs: 1000, completed: true, pattern: "16:8", createdAt: new Date().toISOString() });
    const all = await adapterInst.loadAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
  it("CLOUD_SYNC_ENABLED is false", () => {
    expect(CLOUD_SYNC_ENABLED).toBe(false);
  });
});
