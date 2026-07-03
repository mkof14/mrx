import React, { useEffect, useState } from 'react';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import {
  defaultReminderPrefs,
  ensureNotificationPermission,
  loadReminderPrefs,
  saveReminderPrefs,
  scheduleDailyReminder,
  type ReminderPrefs
} from '../utils/reminderScheduler';

const RemindersPanel: React.FC = () => {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<ReminderPrefs>(defaultReminderPrefs);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(loadReminderPrefs());
  }, []);

  const save = async (next: ReminderPrefs) => {
    setPrefs(next);
    saveReminderPrefs(next);
    if (next.enabled) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        setStatus(t('tools.reminderDenied'));
        return;
      }
      scheduleDailyReminder(next, t('tools.reminderTitle'), t('tools.reminderBody'));
      setStatus(t('tools.reminderSaved'));
    } else {
      setStatus(t('tools.reminderOff'));
    }
  };

  const timeValue = `${String(prefs.hour).padStart(2, '0')}:${String(prefs.minute).padStart(2, '0')}`;

  return (
    <PageCard padding="sm" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{t('tools.reminderHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('tools.reminderSub')}</p>
      </div>

      <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-mrx-inset dark:bg-mrx-inset-dark">
        <span className="text-sm font-semibold">{t('tools.reminderEnable')}</span>
        <input
          type="checkbox"
          checked={prefs.enabled}
          onChange={(e) => save({ ...prefs, enabled: e.target.checked })}
          className="w-5 h-5 accent-clinical-600"
        />
      </label>

      <div className="space-y-2">
        <label className="mrx-label">{t('tools.reminderTime')}</label>
        <input
          type="time"
          value={timeValue}
          onChange={(e) => {
            const [h, m] = e.target.value.split(':').map(Number);
            save({ ...prefs, hour: h, minute: m });
          }}
          className="mrx-input"
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={prefs.symptomReminder}
          onChange={(e) => save({ ...prefs, symptomReminder: e.target.checked })}
          className="accent-clinical-600"
        />
        {t('tools.reminderSymptoms')}
      </label>

      {status && <p className="text-xs text-emerald-600">{status}</p>}
      <p className="text-[11px] text-slate-400">{t('tools.reminderNote')}</p>
    </PageCard>
  );
};

export default RemindersPanel;
