
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Medication, MedicationEvent } from '../types';
import { resolveMedication } from '../utils/normalization';
import { scanMedicationImage } from '../geminiService';
import SectionHero from './SectionHero';

interface Props {
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
  medicationEvents: MedicationEvent[];
  setMedicationEvents: React.Dispatch<React.SetStateAction<MedicationEvent[]>>;
  onFirstMedAdded?: () => void;
}

interface SearchResult {
  name: string;
  isVerified: boolean;
  score: number;
  label: string;
  genericName?: string;
  route?: string;
}

const MedicationList: React.FC<Props> = ({ medications, setMedications, medicationEvents, setMedicationEvents, onFirstMedAdded }) => {
  const [isAdding, setIsAdding] = useState(medications.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<SearchResult | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dose, setDose] = useState({ amount: '', unit: 'mg', frequency: 1, startDate: new Date().toISOString().split('T')[0], notes: '' });
  const [isScanning, setIsScanning] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drugSuggestions = [
    'Zoloft', 'Lexapro', 'Prozac', 'Celexa', 'Wellbutrin', 'Xanax', 'Ativan', 'Klonopin',
    'Advil', 'Tylenol', 'Ibuprofen', 'Metformin', 'Lisinopril', 'Aspirin', 'Naproxen'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const input = searchTerm.trim().toLowerCase();
    if (!input || selectedMed) return [];

    const results: SearchResult[] = [];
    drugSuggestions.forEach(s => {
      const target = s.toLowerCase();
      if (target.includes(input)) {
        results.push({ name: s, isVerified: true, score: 1, label: 'Verified Medicine' });
      }
    });

    results.push({ name: searchTerm, isVerified: false, score: -1, label: 'Other Name' });
    return results.slice(0, 6);
  }, [searchTerm, selectedMed]);

  const selectMed = (res: SearchResult) => {
    setSelectedMed(res);
    setSearchTerm(res.name);
    setDropdownVisible(false);
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await scanMedicationImage(base64);
      if (result) {
        setSearchTerm(result.name);
        setDose(d => ({ ...d, amount: result.strength || '', unit: result.unit || 'mg', frequency: result.frequency || 1 }));
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const finalName = selectedMed?.name || searchTerm.trim();
    if (!finalName) return;
    const med: Medication = {
      id: Math.random().toString(36).substr(2, 9),
      display_name: finalName,
      normalized: { active_ingredients: [finalName], route: 'Oral', form: null },
      status: 'ACTIVE',
      current_dose: { 
        amount: dose.amount || null, 
        unit: dose.unit || null, 
        frequency_per_day: dose.frequency || null, 
        schedule_notes: `${dose.frequency} time(s) daily` 
      }
    };
    setMedications(prev => [...prev, med]);
    resetForm();
    if (onFirstMedAdded) onFirstMedAdded();
  };

  const resetForm = () => {
    setIsAdding(false);
    setSelectedMed(null);
    setSearchTerm('');
    setDropdownVisible(false);
    setDose({ amount: '', unit: 'mg', frequency: 1, startDate: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div className="animate-in fade-in duration-700">
      <SectionHero 
        title="My Medicine Cabinet" 
        subtitle="Keep track of what you're taking" 
        icon="💊" 
        color="#8b5cf6" 
      />

      <div className="max-w-4xl mx-auto space-y-8 px-6">
        {isAdding ? (
          <div className="bg-white dark:bg-[#0a192f] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl p-8 md:p-12 space-y-10 relative">
            <div className="relative" ref={searchContainerRef}>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Find your medicine</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:bg-blue-50 p-2 rounded-lg transition-all"
                >
                  📷 {isScanning ? 'Reading label...' : 'Take a photo'}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleScan} />
              </div>
              <input 
                type="text"
                value={searchTerm}
                onFocus={() => setDropdownVisible(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name (e.g. Aspirin)"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-5 px-8 text-xl font-bold focus:ring-2 ring-blue-500/20 outline-none transition-all dark:text-white"
              />
              {dropdownVisible && searchResults.length > 0 && !selectedMed && (
                <div className="absolute z-[100] w-full top-full mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  {searchResults.map((res, i) => (
                    <button key={i} onClick={() => selectMed(res)} className="w-full text-left px-8 py-4 border-b border-slate-50 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <p className="font-bold text-slate-900 dark:text-white">{res.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{res.label}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-widest">How much do you take?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" value={dose.amount} onChange={e => setDose({...dose, amount: e.target.value})} placeholder="Dose (e.g. 100)" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-bold outline-none dark:text-white" />
                <select value={dose.unit} onChange={e => setDose({...dose, unit: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-bold outline-none dark:text-white">
                  <option>mg</option><option>pills</option><option>ml</option>
                </select>
                <select value={dose.frequency} onChange={e => setDose({...dose, frequency: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-bold outline-none dark:text-white">
                  <option value="1">Once a day</option><option value="2">Twice a day</option><option value="3">3 times a day</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <button 
                onClick={handleSave} 
                disabled={!searchTerm.trim()}
                className="flex-1 bg-blue-600 text-white py-6 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30"
              >
                Save Medication
              </button>
              <button onClick={() => resetForm()} className="px-10 bg-slate-100 dark:bg-white/5 text-slate-400 py-6 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {medications.map(med => (
              <div key={med.id} className="bg-white dark:bg-[#0a192f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-xl group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-4xl">💊</div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{med.display_name}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{med.current_dose.amount} {med.current_dose.unit} • {med.current_dose.schedule_notes}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setMedications(medications.filter(m => m.id !== med.id))}
                    className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                   >
                    ✕
                   </button>
                </div>
              </div>
            ))}
            <button onClick={() => setIsAdding(true)} className="p-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all min-h-[160px]">
              <div className="text-4xl text-slate-300 group-hover:scale-110 transition-transform">➕</div>
              <span className="font-bold text-sm text-slate-400 group-hover:text-blue-600">Add Another Medicine</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationList;
