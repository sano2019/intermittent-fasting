import { useState, useEffect, useRef, useCallback } from "react";
import { adapter, FastRecord } from "../store/StorageAdapter";

export interface UseTimerOptions {
  fastMinutes?: number;
  initialShowRemaining?: boolean;
  onFastCompleted?: (record: FastRecord) => void;
}

export interface UseTimerReturn {
  isActive: boolean;
  startTime: string | null;
  showRemaining: boolean;
  setShowRemaining: (show: boolean) => void;
  timeText: string;
  pct: number;
  startTimer: () => void;
  stopTimer: () => void;
  stopAndCaptureFast: () => { startTime: string; endTime: string };
  completeFast: (record: FastRecord) => Promise<void>;
  updateStartTime: (newIso: string) => void;
  toggleTimer: () => void;
}

export function useTimer({
  fastMinutes = 420,
  initialShowRemaining = true,
  onFastCompleted,
}: UseTimerOptions = {}): UseTimerReturn {
  const [showRemaining, setShowRemaining] = useState(initialShowRemaining);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [timeText, setTimeText] = useState("16:00:00");
  const [pct, setPct] = useState(0);
  const animRef = useRef<number>(0);

  const formatTime = useCallback((ms: number): string => {
    const sign = ms < 0 ? "-" : "";
    const absMs = Math.abs(ms);
    const h = Math.floor(absMs / 3600000);
    const m = Math.floor((absMs % 3600000) / 60000);
    const s = Math.floor((absMs % 60000) / 1000);
    return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  // Check stored active fast on initial mount via StorageAdapter
  useEffect(() => {
    const savedBase = adapter.getActiveFastStartTime();
    if (savedBase) {
      setIsActive(true);
      setStartTime(savedBase);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      setPct(0);
      setTimeText(
        showRemaining
          ? formatTime(fastMinutes * 60000)
          : "00:00:00"
      );
      return;
    }

    let running = true;
    const update = () => {
      if (!running) return;

      const baseStr = adapter.getActiveFastStartTime();
      const baseMs = baseStr ? new Date(baseStr).getTime() : Date.now();
      const elapsedMs = Math.max(0, Date.now() - baseMs);
      const windowMs = fastMinutes * 60000;
      const remainingMs = Math.max(0, windowMs - elapsedMs);

      setTimeText(showRemaining ? formatTime(remainingMs) : formatTime(elapsedMs));

      const livePct = Math.min(1, Math.max(0, elapsedMs / windowMs));
      setPct(livePct);

      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [fastMinutes, showRemaining, isActive, formatTime]);

  const startTimer = useCallback(() => {
    const nowIso = new Date().toISOString();
    adapter.setActiveFastStartTime(nowIso);
    setStartTime(nowIso);
    setIsActive(true);
  }, []);

  const updateStartTime = useCallback((newIso: string) => {
    adapter.setActiveFastStartTime(newIso);
    setStartTime(newIso);
  }, []);

  const completeFast = useCallback(
    async (record: FastRecord) => {
      await adapter.save(record);
      adapter.setActiveFastStartTime(null);
      setStartTime(null);
      setIsActive(false);
      setPct(0);
      setTimeText(
        showRemaining ? formatTime(fastMinutes * 60000) : "00:00:00"
      );
      onFastCompleted?.(record);
    },
    [onFastCompleted, fastMinutes, showRemaining, formatTime],
  );

  // Immediately stops active timer and returns captured session start and end times
  const stopAndCaptureFast = useCallback((): { startTime: string; endTime: string } => {
    const currentStart = adapter.getActiveFastStartTime() || startTime || new Date().toISOString();
    const endTime = new Date().toISOString();

    adapter.setActiveFastStartTime(null);
    setStartTime(null);
    setIsActive(false);
    setPct(0);
    setTimeText("16:00:00");

    return {
      startTime: currentStart,
      endTime,
    };
  }, [startTime]);

  const stopTimer = useCallback(async () => {
    const captured = stopAndCaptureFast();
    const durationMs = Math.max(
      0,
      new Date(captured.endTime).getTime() - new Date(captured.startTime).getTime(),
    );
    const targetMs = fastMinutes * 60000;
    const newRecord: FastRecord = {
      id: `fast-${Date.now()}`,
      startTime: captured.startTime,
      endTime: captured.endTime,
      durationMs,
      completed: durationMs >= targetMs,
      pattern: fastMinutes >= 1440 ? "OMAD" : "16:8",
      createdAt: captured.endTime,
    };
    await completeFast(newRecord);
  }, [fastMinutes, stopAndCaptureFast, completeFast]);

  const toggleTimer = useCallback(() => {
    if (isActive) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [isActive, startTimer, stopTimer]);

  return {
    isActive,
    startTime,
    showRemaining,
    setShowRemaining,
    timeText,
    pct,
    startTimer,
    stopTimer,
    stopAndCaptureFast,
    completeFast,
    updateStartTime,
    toggleTimer,
  };
}
