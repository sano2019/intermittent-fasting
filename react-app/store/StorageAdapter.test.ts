import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { adapter, LocalStorageAdapter, FastRecord, CLOUD_SYNC_ENABLED } from "./StorageAdapter";

describe("StorageAdapter", () => {
  let adapterInst: LocalStorageAdapter;

  beforeEach(() => {
    adapterInst = new LocalStorageAdapter();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
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

  it("CLOUD_SYNC_ENABLED is false", () => {
    expect(CLOUD_SYNC_ENABLED).toBe(false);
  });
});
