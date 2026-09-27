// notificationService.ts — Gentle reminders & Web Notification management
import type { UserProfile, WeekdayKey } from "../types/fasting";

export type PermissionState = "granted" | "denied" | "default" | "unsupported";

const WEEKDAYS_MAP: Record<number, WeekdayKey> = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  0: "sun",
};

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): PermissionState {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return Notification.permission as PermissionState;
  } catch {
    return "unsupported";
  }
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result as PermissionState;
  } catch (err) {
    console.warn("Could not request notification permission:", err);
    return "denied";
  }
}

export interface InAppToastDetail {
  title: string;
  body: string;
}

export function dispatchInAppToast(title: string, body: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<InAppToastDetail>("app-toast-message", {
        detail: { title, body },
      }),
    );
  }
}

export function sendNotification(title: string, body: string): boolean {
  // Always trigger an in-app visual toast so user sees it even if browser minimizes or suppresses
  dispatchInAppToast(title, body);

  if (isNotificationSupported() && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        silent: false,
      });
      return true;
    } catch (e) {
      console.warn("Failed to create Notification instance:", e);
    }
  }
  return false;
}

export function sendTestNotification(): boolean {
  return sendNotification(
    "🌟 Fasting App: Test Reminder",
    "Gentle reminders are active! You will receive calm prompts for your fasting routine.",
  );
}

// Background reminder check loop
let checkTimerId: number | null = null;
let lastFiredKeys = new Set<string>();

export function startReminderScheduler(getProfile: () => UserProfile | null) {
  if (checkTimerId) {
    clearInterval(checkTimerId);
  }

  const checkReminders = () => {
    const profile = getProfile();
    if (!profile || !profile.notificationsEnabled) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const todayDateStr = now.toISOString().split("T")[0];
    const currentWeekday = WEEKDAYS_MAP[now.getDay()];

    if (profile.pattern === "5:2") {
      const isLightDay = profile.lightDays?.includes(currentWeekday);
      const reminderTime = profile.lightDayReminderTime || "08:00";
      const key = `5:2-${todayDateStr}-${reminderTime}`;

      if (isLightDay && currentTimeStr === reminderTime && !lastFiredKeys.has(key)) {
        lastFiredKeys.add(key);
        sendNotification(
          "🌟 5:2 Light Day Reminder",
          "Today is your scheduled light day. Remember to keep within 500–600 kcal.",
        );
      }
    } else {
      // 16:8, Custom, OMAD
      // Eating window ends (time to start fast)
      if (profile.endTime) {
        const keyEnd = `fast-start-${todayDateStr}-${profile.endTime}`;
        if (currentTimeStr === profile.endTime && !lastFiredKeys.has(keyEnd)) {
          lastFiredKeys.add(keyEnd);
          sendNotification(
            "⏱️ Fasting Window Starting",
            "Your eating window has ended. Time to start your fast timer!",
          );
        }
      }

      // Eating window starts (fast complete)
      if (profile.startTime) {
        const keyStart = `eating-start-${todayDateStr}-${profile.startTime}`;
        if (currentTimeStr === profile.startTime && !lastFiredKeys.has(keyStart)) {
          lastFiredKeys.add(keyStart);
          sendNotification(
            "🍽️ Eating Window Open",
            "Your fasting period has concluded. Enjoy your nourishing meal window!",
          );
        }
      }
    }
  };

  // Run initial check and set interval every 30 seconds
  checkReminders();
  checkTimerId = window.setInterval(checkReminders, 30000);
}

export function stopReminderScheduler() {
  if (checkTimerId) {
    clearInterval(checkTimerId);
    checkTimerId = null;
  }
}
