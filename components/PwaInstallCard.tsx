import React, { useEffect, useState } from 'react';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallCard: React.FC = () => {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setDeferred(null);
  };

  return (
    <PageCard padding="sm" className="space-y-4 text-center">
      <span className="text-5xl block">📲</span>
      <h2 className="text-lg font-bold">{t('tools.pwaTitle')}</h2>
      <p className="text-sm text-slate-500">{t('tools.pwaDesc')}</p>

      {installed ? (
        <p className="text-sm font-semibold text-emerald-600">{t('tools.pwaInstalled')}</p>
      ) : deferred ? (
        <button type="button" onClick={install} className="mrx-btn-primary px-8 py-3">
          {t('tools.pwaInstall')}
        </button>
      ) : (
        <div className="text-left text-xs text-slate-500 space-y-2 p-3 rounded-xl bg-mrx-inset dark:bg-mrx-inset-dark">
          <p>{t('tools.pwaIos')}</p>
          <p>{t('tools.pwaAndroid')}</p>
        </div>
      )}
    </PageCard>
  );
};

export default PwaInstallCard;
