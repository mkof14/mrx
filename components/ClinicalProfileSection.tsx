import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  variant?: 'compact' | 'full';
}

const COMMON_ADRS = [
  'Penicillin — rash',
  'NSAIDs — stomach pain',
  'Codeine — nausea',
  'SSRIs — insomnia',
  'Metformin — GI upset'
];

const COMMON_SUPPLEMENTS = ['Vitamin D', 'Magnesium', 'Omega-3', 'Probiotics', 'Melatonin', 'Iron'];

function TagList({
  items,
  onRemove,
  colorClass
}: {
  items: string[];
  onRemove: (index: number) => void;
  colorClass: string;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${colorClass}`}
        >
          {item}
          <button type="button" onClick={() => onRemove(i)} className="opacity-70 hover:opacity-100">
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

const ClinicalProfileSection: React.FC<Props> = ({ profile, setProfile, variant = 'full' }) => {
  const { t } = useI18n();
  const [newAdr, setNewAdr] = useState('');
  const [newSupplement, setNewSupplement] = useState('');
  const compact = variant === 'compact';

  const addToList = (field: 'adverse_drug_reactions' | 'current_supplements', value: string) => {
    const trimmed = value.trim();
    if (!trimmed || profile[field].includes(trimmed)) return;
    setProfile({ ...profile, [field]: [...profile[field], trimmed] });
  };

  const removeFromList = (field: 'adverse_drug_reactions' | 'current_supplements', index: number) => {
    const next = [...profile[field]];
    next.splice(index, 1);
    setProfile({ ...profile, [field]: next });
  };

  const selectClass = compact
    ? 'w-full bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark rounded-2xl p-4 text-sm font-semibold outline-none dark:text-white'
    : 'mrx-input';

  const inputClass = compact
    ? 'flex-1 bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark rounded-2xl p-4 font-semibold outline-none dark:text-white text-sm'
    : 'mrx-input flex-1';

  const labelClass = compact
    ? 'text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-4'
    : 'mrx-label';

  const showFemaleFields = profile.sex_at_birth === 'FEMALE' || profile.pregnancy_possible;

  return (
    <div className={compact ? 'space-y-6' : 'space-y-8 pt-6 border-t border-mrx-line dark:border-mrx-line-dark'}>
      {!compact && (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-500/10 rounded-2xl flex items-center justify-center text-xl">⚕️</div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{t('clinical.title')}</h3>
            <p className="text-xs text-gray-500">{t('clinical.desc')}</p>
          </div>
        </div>
      )}

      {compact && (
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
          {t('clinical.compactHint')}
        </p>
      )}

      <div className="space-y-3">
        <label className={labelClass}>{t('clinical.adr')}</label>
        <p className="text-[11px] text-gray-500 ml-1">{t('clinical.adrHint')}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAdr}
            onChange={(e) => setNewAdr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addToList('adverse_drug_reactions', newAdr);
                setNewAdr('');
              }
            }}
            placeholder={t('clinical.adrPh')}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              addToList('adverse_drug_reactions', newAdr);
              setNewAdr('');
            }}
            className="px-4 rounded-2xl bg-amber-600 text-white font-bold shrink-0"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_ADRS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => addToList('adverse_drug_reactions', a)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark"
            >
              {a}
            </button>
          ))}
        </div>
        <TagList
          items={profile.adverse_drug_reactions}
          onRemove={(i) => removeFromList('adverse_drug_reactions', i)}
          colorClass="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
        />
      </div>

      <div className="space-y-3">
        <label className={labelClass}>{t('clinical.supplements')}</label>
        <p className="text-[11px] text-gray-500 ml-1">{t('clinical.supplementsHint')}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSupplement}
            onChange={(e) => setNewSupplement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addToList('current_supplements', newSupplement);
                setNewSupplement('');
              }
            }}
            placeholder={t('clinical.supplementsPh')}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              addToList('current_supplements', newSupplement);
              setNewSupplement('');
            }}
            className="px-4 rounded-2xl bg-clinical-600 text-white font-bold shrink-0"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_SUPPLEMENTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addToList('current_supplements', s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark"
            >
              {s}
            </button>
          ))}
        </div>
        <TagList
          items={profile.current_supplements}
          onRemove={(i) => removeFromList('current_supplements', i)}
          colorClass="bg-clinical-500/10 text-clinical-600 dark:text-clinical-400 border-clinical-500/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelClass}>{t('clinical.smoking')}</label>
          <select
            value={profile.smoking_status || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                smoking_status: (e.target.value || null) as UserProfile['smoking_status']
              })
            }
            className={selectClass}
          >
            <option value="">{t('clinical.notSpecified')}</option>
            <option value="NEVER">{t('clinical.smokingNever')}</option>
            <option value="FORMER">{t('clinical.smokingFormer')}</option>
            <option value="CURRENT">{t('clinical.smokingCurrent')}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t('clinical.alcohol')}</label>
          <select
            value={profile.alcohol_use || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                alcohol_use: (e.target.value || null) as UserProfile['alcohol_use']
              })
            }
            className={selectClass}
          >
            <option value="">{t('clinical.notSpecified')}</option>
            <option value="NONE">{t('clinical.alcoholNone')}</option>
            <option value="OCCASIONAL">{t('clinical.alcoholOccasional')}</option>
            <option value="REGULAR">{t('clinical.alcoholRegular')}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t('clinical.kidney')}</label>
          <select
            value={profile.kidney_function || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                kidney_function: (e.target.value || null) as UserProfile['kidney_function']
              })
            }
            className={selectClass}
          >
            <option value="">{t('clinical.notSpecified')}</option>
            <option value="NORMAL">{t('clinical.kidneyNormal')}</option>
            <option value="REDUCED">{t('clinical.kidneyReduced')}</option>
            <option value="DIALYSIS">{t('clinical.kidneyDialysis')}</option>
            <option value="UNKNOWN">{t('clinical.kidneyUnknown')}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t('clinical.liver')}</label>
          <select
            value={profile.liver_function || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                liver_function: (e.target.value || null) as UserProfile['liver_function']
              })
            }
            className={selectClass}
          >
            <option value="">{t('clinical.notSpecified')}</option>
            <option value="NORMAL">{t('clinical.liverNormal')}</option>
            <option value="REDUCED">{t('clinical.liverReduced')}</option>
            <option value="UNKNOWN">{t('clinical.liverUnknown')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>{t('clinical.bloodThinner')}</label>
        <div className="flex flex-wrap gap-2">
          {[
            { val: true, label: t('clinical.yes') },
            { val: false, label: t('clinical.no') },
            { val: null, label: t('clinical.unknown') }
          ].map(({ val, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setProfile({ ...profile, on_blood_thinner: val })}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                profile.on_blood_thinner === val
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-mrx-inset dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showFemaleFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>{t('clinical.pregnant')}</label>
            <div className="flex gap-2">
              {[
                { val: true, label: t('clinical.yes') },
                { val: false, label: t('clinical.no') },
                { val: null, label: t('clinical.na') }
              ].map(({ val, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setProfile({ ...profile, is_pregnant: val })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                    profile.is_pregnant === val
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-mrx-inset dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>{t('clinical.breastfeeding')}</label>
            <div className="flex gap-2">
              {[
                { val: true, label: t('clinical.yes') },
                { val: false, label: t('clinical.no') },
                { val: null, label: t('clinical.na') }
              ].map(({ val, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setProfile({ ...profile, is_breastfeeding: val })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                    profile.is_breastfeeding === val
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-mrx-inset dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className={labelClass}>{t('clinical.pgx')}</label>
        <p className="text-[11px] text-gray-500 ml-1">{t('clinical.pgxHint')}</p>
        <textarea
          value={profile.pharmacogenomics_notes || ''}
          onChange={(e) => setProfile({ ...profile, pharmacogenomics_notes: e.target.value })}
          placeholder={t('clinical.pgxPh')}
          rows={compact ? 2 : 3}
          className={compact ? inputClass : 'mrx-input resize-none'}
        />
      </div>
    </div>
  );
};

export default ClinicalProfileSection;
