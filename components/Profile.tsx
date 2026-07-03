import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { parseAge } from '../utils/profileValidation';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import ClinicalProfileSection from './ClinicalProfileSection';
import { useI18n } from '../i18n/I18nContext';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const COMMON_CONDITIONS = [
  "Hypertension", "Type 2 Diabetes", "Asthma", "Anxiety", 
  "Depression", "GERD", "Arthritis", "Hypothyroidism",
  "Sleep Apnea", "Migraine", "ADHD", "IBS"
];

const COMMON_ALLERGIES = [
  "Penicillin", "Sulfa Drugs", "Aspirin", "NSAIDs",
  "Peanuts", "Dairy", "Shellfish", "Latex",
  "Pollen", "Mold", "Codeine", "Lactose"
];

const Profile: React.FC<ProfileProps> = ({ profile, setProfile }) => {
  const { t } = useI18n();
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // Conversion Helpers
  const KG_TO_LBS = 2.20462;
  const CM_TO_IN = 0.393701;

  const displayWeight = useMemo(() => {
    if (!profile.weight_kg) return '';
    return profile.preferred_units === 'METRIC' 
      ? profile.weight_kg 
      : Math.round(profile.weight_kg * KG_TO_LBS);
  }, [profile.weight_kg, profile.preferred_units]);

  const displayHeight = useMemo(() => {
    if (!profile.height_cm) return '';
    return profile.preferred_units === 'METRIC' 
      ? profile.height_cm 
      : Math.round(profile.height_cm * CM_TO_IN);
  }, [profile.height_cm, profile.preferred_units]);

  const handleWeightChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setProfile({ ...profile, weight_kg: null });
      return;
    }
    const finalKg = profile.preferred_units === 'METRIC' ? num : num / KG_TO_LBS;
    setProfile({ ...profile, weight_kg: finalKg });
  };

  const handleHeightChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setProfile({ ...profile, height_cm: null });
      return;
    }
    const finalCm = profile.preferred_units === 'METRIC' ? num : num / CM_TO_IN;
    setProfile({ ...profile, height_cm: finalCm });
  };

  const addCondition = (conditionName: string) => {
    const trimmed = conditionName.trim();
    if (trimmed && !profile.preexisting_conditions.includes(trimmed)) {
      setProfile({
        ...profile,
        preexisting_conditions: [...profile.preexisting_conditions, trimmed]
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    const updated = [...profile.preexisting_conditions];
    updated.splice(index, 1);
    setProfile({ ...profile, preexisting_conditions: updated });
  };

  const addAllergy = (allergyName: string) => {
    const trimmed = allergyName.trim();
    if (trimmed && !profile.known_allergies.includes(trimmed)) {
      setProfile({
        ...profile,
        known_allergies: [...profile.known_allergies, trimmed]
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    const updated = [...profile.known_allergies];
    updated.splice(index, 1);
    setProfile({ ...profile, known_allergies: updated });
  };

  return (
    <PageShell tabId="profile" narrow>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <PageCard className="lg:col-span-5 h-fit" padding="sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-clinical-500/10 rounded-2xl flex items-center justify-center text-xl">🧬</div>
              <PageSectionTitle>{t('profile.biometrics')}</PageSectionTitle>
            </div>
            <div className="flex p-1 bg-mrx-inset dark:bg-mrx-inset-dark rounded-xl border border-mrx-line dark:border-mrx-line-dark">
              <button 
                onClick={() => setProfile({ ...profile, preferred_units: 'METRIC' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${profile.preferred_units === 'METRIC' ? 'bg-mrx-panel dark:bg-mrx-panel-dark text-clinical-600 shadow-mrx-sm' : 'text-gray-500'}`}
              >
                {t('profile.metric')}
              </button>
              <button 
                onClick={() => setProfile({ ...profile, preferred_units: 'IMPERIAL' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${profile.preferred_units === 'IMPERIAL' ? 'bg-mrx-panel dark:bg-mrx-panel-dark text-clinical-600 shadow-mrx-sm' : 'text-gray-500'}`}
              >
                {t('profile.imperial')}
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="mrx-label">{t('profile.name')}</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder={t('profile.namePh')}
                className="mrx-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="mrx-label">{t('profile.age')}</label>
                <input
                  type="number"
                  value={profile.age_years ?? ''}
                  onChange={(e) => setProfile({ ...profile, age_years: parseAge(e.target.value) })}
                  className="mrx-input"
                />
              </div>
              <div className="space-y-2">
                <label className="mrx-label">{t('profile.sex')}</label>
                <select
                  value={profile.sex_at_birth || 'UNKNOWN'}
                  onChange={e => setProfile({ ...profile, sex_at_birth: e.target.value as any })}
                  className="mrx-input"
                >
                  <option value="MALE">{t('profile.sexMale')}</option>
                  <option value="FEMALE">{t('profile.sexFemale')}</option>
                  <option value="UNKNOWN">{t('profile.sexUnknown')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="mrx-label">
                  {t('profile.weight')} ({profile.preferred_units === 'METRIC' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="number"
                  value={displayWeight}
                  onChange={e => handleWeightChange(e.target.value)}
                  className="mrx-input"
                />
              </div>
              <div className="space-y-2">
                <label className="mrx-label">
                  {t('profile.height')} ({profile.preferred_units === 'METRIC' ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={displayHeight}
                  onChange={e => handleHeightChange(e.target.value)}
                  className="mrx-input"
                />
              </div>
            </div>
          </div>
        </PageCard>

        <PageCard className="lg:col-span-7 space-y-6" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-clinical-500/10 rounded-2xl flex items-center justify-center text-xl">📋</div>
            <PageSectionTitle>{t('profile.medHistory')}</PageSectionTitle>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="mrx-label mb-0">{t('profile.conditions')}</label>
                <span className="text-xs text-gray-400">{t('profile.conditionsHint')}</span>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCondition(newCondition)}
                  placeholder={t('profile.conditionPh')}
                  className="mrx-input flex-1"
                />
                <button
                  onClick={() => addCondition(newCondition)}
                  className="w-12 h-12 shrink-0 bg-clinical-600 text-white rounded-2xl font-bold text-xl shadow-mrx-sm hover:scale-105 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-400">{t('profile.common')}:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CONDITIONS.map(c => {
                    const isSelected = profile.preexisting_conditions.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => isSelected ? removeCondition(profile.preexisting_conditions.indexOf(c)) : addCondition(c)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-clinical-600 border-clinical-600 text-white'
                            : 'bg-mrx-inset dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark text-gray-500 hover:border-clinical-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-mrx-line dark:border-mrx-line-dark">
                {profile.preexisting_conditions.map((c, i) => (
                  <span key={i} className="px-3 py-1.5 bg-clinical-500/10 text-clinical-600 dark:text-clinical-400 rounded-full text-xs font-semibold flex items-center gap-2 border border-clinical-500/10">
                    {c}
                    <button onClick={() => removeCondition(i)} className="hover:text-clinical-800">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="mrx-label mb-0">{t('profile.allergies')}</label>
                <span className="text-xs text-gray-400">{t('profile.allergiesHint')}</span>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAllergy(newAllergy)}
                  placeholder={t('profile.allergyPh')}
                  className="mrx-input flex-1"
                />
                <button
                  onClick={() => addAllergy(newAllergy)}
                  className="w-12 h-12 shrink-0 bg-rose-500 text-white rounded-2xl font-bold text-xl shadow-mrx-sm hover:scale-105 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-400">{t('profile.triggers')}:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map(a => {
                    const isSelected = profile.known_allergies.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => isSelected ? removeAllergy(profile.known_allergies.indexOf(a)) : addAllergy(a)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'bg-mrx-inset dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark text-gray-500 hover:border-rose-400'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-mrx-line dark:border-mrx-line-dark">
                {profile.known_allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-semibold flex items-center gap-2 border border-rose-500/10">
                    {a}
                    <button onClick={() => removeAllergy(i)} className="hover:text-rose-800">×</button>
                  </span>
                ))}
              </div>
            </div>

            <ClinicalProfileSection profile={profile} setProfile={setProfile} />
          </div>
        </PageCard>
      </div>
    </PageShell>
  );
};

export default Profile;