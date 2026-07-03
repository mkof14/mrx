import React, { useEffect, useState } from 'react';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import SystemDiagnostics from './SystemDiagnostics';
import { api } from '../services/apiClient';
import { useI18n } from '../i18n/I18nContext';
import { PageSummaryRow } from './ui/PageGuide';

type AdminTab = 'overview' | 'connection' | 'users' | 'integrations';

interface AdminPanelProps {
  isAdmin?: boolean;
  initialTab?: AdminTab;
}

type Overview = {
  userCount: number;
  totalMeds: number;
  totalCheckins: number;
  subscribedCount: number;
  users: Array<{
    id: string;
    email: string;
    created_at: string;
    medCount: number;
    checkinCount: number;
    isSubscribed: boolean;
  }>;
};

type Integrations = {
  gemini: { configured: boolean; key: string | null };
  elevenlabs: { configured: boolean; key: string | null };
  google: { configured: boolean; clientId: string | null };
  stripe: { configured: boolean; priceId: string | null };
  clientOrigin: string | null;
  databasePath: string;
  jwtSecretSet: boolean;
  adminEmailsConfigured: boolean;
  redisConfigured: boolean;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isAdmin = false, initialTab = 'overview' }) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const tabs: { id: AdminTab; labelKey: 'admin.tabOverview' | 'admin.tabConnection' | 'admin.tabUsers' | 'admin.tabIntegrations'; icon: string }[] = [
    { id: 'overview', labelKey: 'admin.tabOverview', icon: '📊' },
    { id: 'connection', labelKey: 'admin.tabConnection', icon: '📡' },
    { id: 'users', labelKey: 'admin.tabUsers', icon: '👥' },
    { id: 'integrations', labelKey: 'admin.tabIntegrations', icon: '🔌' }
  ];

  useEffect(() => {
    if (!isAdmin) return;
    setLoadError(null);
    if (tab === 'overview' || tab === 'users') {
      api.admin.overview().then(setOverview).catch(() => setLoadError(t('admin.loadError')));
    } else if (tab === 'integrations') {
      api.admin.integrations().then((data) => setIntegrations(data as Integrations)).catch(() => setLoadError(t('admin.loadError')));
    }
  }, [tab, t, isAdmin]);

  return (
    <PageShell tabId="admin">
      <div className="space-y-4 max-w-6xl mx-auto">
        <PageCard padding="sm" className="bg-gradient-to-r from-slate-900 to-clinical-900 text-white border-0">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('admin.zoneLabel')}</p>
          <p className="text-sm mt-1 opacity-90">{t('admin.zoneDesc')}</p>
        </PageCard>

        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, labelKey, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                tab === id
                  ? 'bg-clinical-600 border-clinical-600 text-white shadow-mrx-sm'
                  : 'bg-white dark:bg-mrx-panel-dark border-mrx-line dark:border-mrx-line-dark text-slate-600 dark:text-zinc-300'
              }`}
            >
              <span className="text-sm">{icon}</span>
              {t(labelKey)}
            </button>
          ))}
        </div>

        {!isAdmin && (
          <PageCard padding="sm" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-sm">
            <p className="font-bold mb-1">{t('admin.accessDeniedTitle')}</p>
            <p className="text-xs opacity-90">{t('admin.accessDeniedHint')}</p>
          </PageCard>
        )}

        {loadError && (
          <PageCard padding="sm" className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-sm">
            {loadError}
          </PageCard>
        )}

        {tab === 'overview' && isAdmin && overview && (
          <div className="space-y-4">
            <PageSummaryRow
              items={[
                { label: t('admin.statUsers'), value: overview.userCount, color: '#2563eb' },
                { label: t('admin.statMeds'), value: overview.totalMeds, color: '#8b5cf6' },
                { label: t('admin.statCheckins'), value: overview.totalCheckins, color: '#f59e0b' },
                { label: t('admin.statSubscribed'), value: overview.subscribedCount, color: '#10b981' }
              ]}
            />
            <PageCard padding="sm">
              <PageSectionTitle className="mb-3">{t('admin.recentUsers')}</PageSectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-mrx-line dark:border-mrx-line-dark">
                      <th className="pb-2 pr-3 font-semibold">{t('admin.colEmail')}</th>
                      <th className="pb-2 pr-3 font-semibold">{t('admin.colMeds')}</th>
                      <th className="pb-2 pr-3 font-semibold">{t('admin.colCheckins')}</th>
                      <th className="pb-2 font-semibold">{t('admin.colJoined')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.users.map((u) => (
                      <tr key={u.id} className="border-b border-mrx-line/50 dark:border-mrx-line-dark/50">
                        <td className="py-2 pr-3 font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">
                          {u.email}
                          {u.isSubscribed && <span className="ml-1 text-emerald-500">✓</span>}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{u.medCount}</td>
                        <td className="py-2 pr-3 tabular-nums">{u.checkinCount}</td>
                        <td className="py-2 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageCard>
          </div>
        )}

        {tab === 'connection' && (
          <div className="rounded-2xl overflow-hidden border border-mrx-line dark:border-mrx-line-dark">
            <SystemDiagnostics embedded />
          </div>
        )}

        {tab === 'users' && isAdmin && overview && (
          <PageCard padding="sm">
            <PageSectionTitle className="mb-2">{t('admin.tabUsers')}</PageSectionTitle>
            <p className="text-xs text-slate-500 mb-4">{t('admin.usersHint')}</p>
            <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
              {overview.users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-400">
                      {u.medCount} meds · {u.checkinCount} logs · {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {u.isSubscribed && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600">
                      {t('admin.subscribed')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </PageCard>
        )}

        {tab === 'integrations' && isAdmin && integrations && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Gemini AI', ok: integrations.gemini.configured, detail: integrations.gemini.key || '—' },
              { name: 'ElevenLabs', ok: integrations.elevenlabs.configured, detail: integrations.elevenlabs.key || '—' },
              { name: 'Google Sign-In', ok: integrations.google.configured, detail: integrations.google.clientId || '—' },
              { name: 'Stripe', ok: integrations.stripe.configured, detail: integrations.stripe.priceId || '—' }
            ].map(({ name, ok, detail }) => (
              <PageCard key={name} padding="sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-bold">{name}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}
                  >
                    {ok ? t('admin.statusOk') : t('admin.statusOff')}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate">{detail}</p>
              </PageCard>
            ))}
            <PageCard padding="sm" className="md:col-span-2">
              <PageSectionTitle className="mb-3">{t('admin.serverConfig')}</PageSectionTitle>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between gap-2 p-2 rounded-lg bg-mrx-inset dark:bg-mrx-inset-dark">
                  <dt className="text-slate-500">CLIENT_ORIGIN</dt>
                  <dd className="font-mono truncate">{integrations.clientOrigin || '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 p-2 rounded-lg bg-mrx-inset dark:bg-mrx-inset-dark">
                  <dt className="text-slate-500">Database</dt>
                  <dd className="font-mono truncate text-right">{integrations.databasePath}</dd>
                </div>
                <div className="flex justify-between gap-2 p-2 rounded-lg bg-mrx-inset dark:bg-mrx-inset-dark">
                  <dt className="text-slate-500">Upstash Redis</dt>
                  <dd>{integrations.redisConfigured ? t('admin.statusOk') : t('admin.statusOff')}</dd>
                </div>
                <div className="flex justify-between gap-2 p-2 rounded-lg bg-mrx-inset dark:bg-mrx-inset-dark">
                  <dt className="text-slate-500">JWT_SECRET</dt>
                  <dd>{integrations.jwtSecretSet ? t('admin.statusOk') : t('admin.statusOff')}</dd>
                </div>
                <div className="flex justify-between gap-2 p-2 rounded-lg bg-mrx-inset dark:bg-mrx-inset-dark">
                  <dt className="text-slate-500">ADMIN_EMAILS</dt>
                  <dd>{integrations.adminEmailsConfigured ? t('admin.statusOk') : t('admin.statusOff')}</dd>
                </div>
              </dl>
            </PageCard>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default AdminPanel;
