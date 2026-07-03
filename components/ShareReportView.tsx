import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

const ShareReportView: React.FC<{ token: string }> = ({ token }) => {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/report/${token}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError('Network error'));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mrx-canvas dark:bg-mrx-canvas-dark">
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mrx-canvas dark:bg-mrx-canvas-dark">
        <div className="w-10 h-10 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data.reportData?.executive_summary?.summary_plain || '';

  return (
    <div className="min-h-screen bg-white dark:bg-mrx-canvas-dark p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1">{t('report.docTitle')}</h1>
      <p className="text-sm text-slate-500 mb-4">
        {data.patientName} · {t('tools.shareReadOnly')}
      </p>
      <div className="prose dark:prose-invert text-sm whitespace-pre-wrap mb-6">{summary}</div>
      <p className="text-xs text-slate-400 border-t pt-4">{t('report.footerDisclaimer')}</p>
    </div>
  );
};

export default ShareReportView;
