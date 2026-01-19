import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import SectionHero from './SectionHero';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile }) => {
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

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile({
        ...profile,
        preexisting_conditions: [...profile.preexisting_conditions, newCondition.trim()]
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    const updated = [...profile.preexisting_conditions];
    updated.splice(index, 1);
    setProfile({ ...profile, preexisting_conditions: updated });
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile({
        ...profile,
        known_allergies: [...profile.known_allergies, newAllergy.trim()]
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
    <div className="max-w-4xl mx-auto space-y-12 animate-slide-up pb-32">
      <SectionHero 
        title="Bio-Profile" 
        subtitle="Physiological Baseline" 
        icon="🧬" 
        color="#10b981" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Biometrics */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-clinical-500/10 rounded-2xl flex items-center justify-center text-2xl">🧬</div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Biometrics</h3>
            </div>
            
            <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-300/50 dark:border-white/10">
              <button 
                onClick={() => setProfile({ ...profile, preferred_units: 'METRIC' })}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${profile.preferred_units === 'METRIC' ? 'bg-white dark:bg-slate-800 text-clinical-600 shadow-sm' : 'text-slate-500'}`}
              >
                Metric
              </button>
              <button 
                onClick={() => setProfile({ ...profile, preferred_units: 'IMPERIAL' })}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${profile.preferred_units === 'IMPERIAL' ? 'bg-white dark:bg-slate-800 text-clinical-600 shadow-sm' : 'text-slate-500'}`}
              >
                Imperial
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">Legal Name / Alias</label>
              <input 
                type="text" 
                value={profile.name || ''} 
                onChange={e => setProfile({...profile, name: e.target.value})}
                placeholder="How should Dr. BioMath address you?"
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">Age (Years)</label>
                 <input 
                   type="number" 
                   value={profile.age_years || ''} 
                   onChange={e => setProfile({...profile, age_years: parseInt(e.target.value) || 0})}
                   className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">Sex</label>
                 <select 
                   value={profile.sex_at_birth || 'UNKNOWN'} 
                   onChange={e => setProfile({...profile, sex_at_birth: e.target.value as any})}
                   className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm outline-none dark:text-white"
                 >
                   <option value="MALE">Male</option>
                   <option value="FEMALE">Female</option>
                   <option value="UNKNOWN">Other</option>
                 </select>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">
                   Weight ({profile.preferred_units === 'METRIC' ? 'KG' : 'LBS'})
                 </label>
                 <input 
                   type="number" 
                   value={displayWeight} 
                   onChange={e => handleWeightChange(e.target.value)}
                   className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">
                   Height ({profile.preferred_units === 'METRIC' ? 'CM' : 'IN'})
                 </label>
                 <input 
                   type="number" 
                   value={displayHeight} 
                   onChange={e => handleHeightChange(e.target.value)}
                   className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-clinical-500/10 rounded-2xl flex items-center justify-center text-2xl">📋</div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Medical History</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Pre-existing Conditions</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCondition()}
                  placeholder="e.g. Hypertension, Diabetes..."
                  className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white shadow-inner"
                />
                <button 
                  onClick={addCondition} 
                  className="w-14 h-14 bg-clinical-600 text-white rounded-2xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.preexisting_conditions.map((c, i) => (
                  <span key={i} className="px-4 py-2 bg-clinical-500/10 text-clinical-600 dark:bg-clinical-500/20 dark:text-clinical-400 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-clinical-500/10">
                    {c}
                    <button onClick={() => removeCondition(i)} className="w-5 h-5 rounded-full hover:bg-clinical-500 hover:text-white flex items-center justify-center transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Known Allergies</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAllergy()}
                  placeholder="e.g. Penicillin, Peanuts..."
                  className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white shadow-inner"
                />
                <button 
                  onClick={addAllergy} 
                  className="w-14 h-14 bg-rose-500 text-white rounded-2xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.known_allergies.map((a, i) => (
                  <span key={i} className="px-4 py-2 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-rose-500/10">
                    {a}
                    <button onClick={() => removeAllergy(i)} className="w-5 h-5 rounded-full hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;