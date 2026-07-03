const REMINDER_KEY = 'mrx_reminder_prefs';

export interface ReminderPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
  symptomReminder: boolean;
  medReminder: boolean;
}

export const defaultReminderPrefs = (): ReminderPrefs => ({
  enabled: false,
  hour: 9,
  minute: 0,
  symptomReminder: true,
  medReminder: false
});

export function loadReminderPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return defaultReminderPrefs();
    return { ...defaultReminderPrefs(), ...JSON.parse(raw) };
  } catch {
    return defaultReminderPrefs();
  }
}

export function saveReminderPrefs(prefs: ReminderPrefs) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(prefs));
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleDailyReminder(prefs: ReminderPrefs, title: string, body: string) {
  if (!prefs.enabled || Notification.permission !== 'granted') return;
  const now = new Date();
  const next = new Date();
  next.setHours(prefs.hour, prefs.minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  window.setTimeout(() => {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
    scheduleDailyReminder(prefs, title, body);
  }, delay);
}
