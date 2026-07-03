import React, { useState } from 'react';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../services/apiClient';

const CaregiverInvitePanel: React.FC = () => {
  const { t } = useI18n();
  const [label, setLabel] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    setLoading(true);
    try {
      const res = await api.share.createCaregiver(label || t('tools.caregiverDefaultLabel'));
      setLink(res.url);
    } catch {
      setLink(null);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!link) return;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageCard padding="sm" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{t('tools.caregiverHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('tools.caregiverSub')}</p>
      </div>

      <div className="space-y-2">
        <label className="mrx-label">{t('tools.caregiverLabel')}</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('tools.caregiverLabelPh')}
          className="mrx-input"
        />
      </div>

      <button type="button" onClick={create} disabled={loading} className="w-full mrx-btn-primary py-3">
        {loading ? t('common.loading') : t('tools.caregiverCreate')}
      </button>

      {link && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t('tools.caregiverLinkReady')}</p>
          <p className="text-[11px] break-all text-slate-600 dark:text-slate-400">{link}</p>
          <button type="button" onClick={copy} className="text-xs font-bold text-clinical-600">
            {copied ? t('report.copied') : t('tools.copyLink')}
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-400">{t('tools.caregiverNote')}</p>
    </PageCard>
  );
};

export default CaregiverInvitePanel;
