
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { parseAge, validateProfileBasics } from '../utils/profileValidation';
import ClinicalProfileSection from './ClinicalProfileSection';
import MrxLogo from './MrxLogo';
import ThemeToggle from './ThemeToggle';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../services/apiClient';

const COMMON_ALLERGIES = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'NSAIDs', 'Codeine', 'Latex'];

interface Props {
  onComplete: (profile: UserProfile) => void;
  initialProfile: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AccountSetup: React.FC<Props> = ({ onComplete, initialProfile, theme, toggleTheme }) => {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    onboarded: false,
    is_subscribed: false
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [newAllergy, setNewAllergy] = useState('');

  const KG_TO_LBS = 2.20462;
  const CM_TO_IN = 0.393701;
  const price = billingCycle === 'monthly' ? 4.99 : 49.9;
  const features = ['onboard.feature1', 'onboard.feature2', 'onboard.feature3', 'onboard.feature4'] as const;

  const addAllergy = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || profile.known_allergies.includes(trimmed)) return;
    setProfile((p) => ({
      ...p,
      known_allergies: [...p.known_allergies, trimmed],
      allergies_confirmed_none: false
    }));
    setNewAllergy('');
  };

  const validateStep2 = () => {
    const normalized = {
      ...profile,
      age_years: profile.age_years && profile.age_years > 0 ? profile.age_years : null
    };
    const result = validateProfileBasics(normalized, true);
    if (!result.valid) {
      if (result.errors.includes('name')) setFormError(t('onboard.errName'));
      else if (result.errors.includes('age')) setFormError(t('onboard.errAge'));
      else if (result.errors.includes('allergies')) setFormError(t('onboard.errAllergies'));
      else setFormError(t('onboard.errGeneric'));
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => prev + 1);
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setFormError(null);
    try {
      const res = await api.billing.checkout();
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      if (res.mock) {
        const confirmed = await api.billing.confirmMock();
        if (confirmed.profile) {
          setProfile((p) => ({ ...p, ...(confirmed.profile as UserProfile) }));
        } else {
          setProfile((p) => ({ ...p, is_subscribed: true }));
        }
        handleNext();
      }
    } catch {
      setFormError(t('onboard.errGeneric'));
    } finally {
      setIsProcessing(false);
    }
  };

  const finish = () => {
    onComplete({ ...profile, onboarded: true });
  };

  return (
    <div className="min-h-screen bg-mrx-canvas dark:bg-mrx-canvas-dark flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-clinical-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="fixed top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50 max-w-2xl mx-auto w-full">
        <MrxLogo size="sm" />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-all ${step >= i ? 'bg-clinical-600' : 'bg-slate-200 dark:bg-slate-800'}`}
              />
            ))}
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <div className="max-w-lg w-full mrx-card dark:bg-mrx-panel-dark rounded-2xl shadow-mrx-lg border border-mrx-line dark:border-mrx-line-dark relative z-10 mt-16">
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-semibold text-clinical-600 uppercase tracking-wide">
                {t('onboard.stepLabel').replace('{step}', '1')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('onboard.planTitle')}
              </h2>
              <p className="text-sm text-slate-500">{t('onboard.planSubtitle')}</p>
            </div>

            <div className="bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl p-5 space-y-5 border border-mrx-line dark:border-mrx-line-dark">
              <div className="flex items-center justify-center gap-4">
                <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-clinical-600' : 'text-slate-400'}`}>
                  {t('onboard.monthly')}
                </span>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full p-0.5 transition-all flex items-center"
                >
                  <div
                    className={`w-5 h-5 bg-clinical-600 rounded-full shadow-sm transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </button>
                <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-clinical-600' : 'text-slate-400'}`}>
                  {t('onboard.yearly')} <span className="text-emerald-500 ml-1">{t('onboard.discount')}</span>
                </span>
              </div>

              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">${price}</span>
                  <span className="text-xs text-slate-400">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-2">{t('onboard.trialNote')}</p>
              </div>

              <ul className="grid grid-cols-2 gap-2">
                {features.map((key) => (
                  <li key={key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-5 h-5 bg-clinical-500/10 text-clinical-600 rounded-full flex items-center justify-center text-[10px] shrink-0">
                      ✔
                    </span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full mrx-btn-primary py-4 disabled:opacity-50"
            >
              {isProcessing ? t('onboard.initializing') : t('onboard.startTrial')}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-5 animate-in fade-in duration-500 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-clinical-600 uppercase tracking-wide">
                {t('onboard.stepLabel').replace('{step}', '2')}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('onboard.profileTitle')}</h2>
              <p className="text-sm text-slate-500">{t('onboard.profileDesc')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="mrx-label">{t('profile.name')}</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mrx-input"
                  placeholder={t('profile.namePh')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="mrx-label">{t('profile.age')}</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={profile.age_years ?? ''}
                    onChange={(e) => setProfile({ ...profile, age_years: parseAge(e.target.value) })}
                    className="mrx-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="mrx-label">{t('profile.sex')}</label>
                  <select
                    value={profile.sex_at_birth || 'UNKNOWN'}
                    onChange={(e) => setProfile({ ...profile, sex_at_birth: e.target.value as UserProfile['sex_at_birth'] })}
                    className="mrx-input"
                  >
                    <option value="MALE">{t('profile.sexMale')}</option>
                    <option value="FEMALE">{t('profile.sexFemale')}</option>
                    <option value="UNKNOWN">{t('profile.sexUnknown')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="mrx-label">
                    {t('profile.weight')} ({profile.preferred_units === 'METRIC' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    value={
                      profile.weight_kg
                        ? profile.preferred_units === 'METRIC'
                          ? profile.weight_kg
                          : Math.round(profile.weight_kg * KG_TO_LBS)
                        : ''
                    }
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (Number.isNaN(num)) {
                        setProfile({ ...profile, weight_kg: null });
                        return;
                      }
                      setProfile({
                        ...profile,
                        weight_kg: profile.preferred_units === 'METRIC' ? num : num / KG_TO_LBS
                      });
                    }}
                    className="mrx-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="mrx-label">
                    {t('profile.height')} ({profile.preferred_units === 'METRIC' ? 'cm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={
                      profile.height_cm
                        ? profile.preferred_units === 'METRIC'
                          ? profile.height_cm
                          : Math.round(profile.height_cm * CM_TO_IN)
                        : ''
                    }
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (Number.isNaN(num)) {
                        setProfile({ ...profile, height_cm: null });
                        return;
                      }
                      setProfile({
                        ...profile,
                        height_cm: profile.preferred_units === 'METRIC' ? num : num / CM_TO_IN
                      });
                    }}
                    className="mrx-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="mrx-label">{t('profile.allergies')}</label>
                <p className="text-[11px] text-slate-400 -mt-1">{t('profile.allergiesHint')}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAllergy(newAllergy)}
                    placeholder={t('profile.allergyPh')}
                    className="mrx-input flex-1"
                  />
                  <button type="button" onClick={() => addAllergy(newAllergy)} className="px-4 rounded-xl bg-rose-500 text-white font-bold">
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ALLERGIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => addAllergy(a)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark"
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.known_allergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, known_allergies: [], allergies_confirmed_none: true }))}
                  className={`text-xs font-semibold underline ${profile.allergies_confirmed_none ? 'text-emerald-600' : 'text-gray-500'}`}
                >
                  {t('profile.noAllergies')}
                </button>
              </div>

              <ClinicalProfileSection profile={profile} setProfile={setProfile} variant="compact" />
            </div>

            {formError && <p className="text-sm text-rose-600 text-center">{formError}</p>}

            <button type="button" onClick={handleNext} className="w-full mrx-btn-primary py-4">
              {t('onboard.continue')} →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-500">
            <div className="mx-auto w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-4xl shadow-mrx-md">
              ✔
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('onboard.readyTitle')}</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">{t('onboard.readyDesc')}</p>
            </div>
            <button type="button" onClick={finish} className="w-full mrx-btn-primary py-4">
              {t('onboard.enterDashboard')} →
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[1000] bg-mrx-overlay-dark/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">{t('onboard.settingUp')}</h3>
            <p className="text-xs text-slate-300">{t('onboard.settingUpDesc')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSetup;
