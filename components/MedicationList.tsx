
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
    'Sertraline', 'Zoloft', 'Escitalopram', 'Lexapro', 'Fluoxetine', 'Prozac',
    'Citalopram', 'Celexa', 'Paroxetine', 'Paxil', 'Vortioxetine', 'Trintellix',
    'Venlafaxine', 'Effexor', 'Duloxetine', 'Cymbalta', 'Desvenlafaxine', 'Pristiq',
    'Bupropion', 'Wellbutrin', 'Mirtazapine', 'Remeron', 'Trazodone', 'Desyrel',
    'Amitriptyline', 'Elavil', 'Nortriptyline', 'Pamelor', 'Alprazolam', 'Xanax',
    'Lorazepam', 'Ativan', 'Clonazepam', 'Klonopin', 'Diazepam', 'Valium', 'Buspirone',
    'Hydroxyzine', 'Quetiapine', 'Seroquel', 'Aripiprazole', 'Abilify', 'Risperidone',
    'Olanzapine', 'Zyprexa', 'Lithium', 'Valproate', 'Lamotrigine', 'Lamictal',
    'Gabapentin', 'Pregabalin', 'Methylphenidate', 'Ritalin', 'Concerta', 'Adderall', 'Vyvanse',
    'Metformin', 'Lisinopril', 'Amlodipine', 'Simvastatin', 'Omeprazole', 'Levothyroxine',
    'Aspirin', 'Ibuprofen', 'Naproxen', 'Acetaminophen', 'Atorvastatin', 'Rosuvastatin'
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

  /**
   * Subsequence fuzzy matching: checks if the query characters
   * appear in the target string in the same relative order.
   */
  const fuzzyMatch = (target: string, query: string) => {
    let qIdx = 0;
    let tIdx = 0;
    while (qIdx < query.length && tIdx < target.length) {
      if (query[qIdx] === target[tIdx]) qIdx++;
      tIdx++;
    }
    return qIdx === query.length;
  };

  const searchResults = useMemo(() => {
    const input = searchTerm.trim().toLowerCase();
    if (!input || selectedMed) return [];

    const results: SearchResult[] = [];
    
    // 1. Process clinical suggestions
    drugSuggestions.forEach(s => {
      const target = s.toLowerCase();
      let score = 0;
      
      if (target === input) {
        score = 10000; // Exact match priority
      } else if (target.startsWith(input)) {
        score = 8000 + (input.length / target.length * 500);
      } else if (target.includes(input)) {
        score = 6000 + (input.length / target.length * 500);
      } else if (fuzzyMatch(target, input)) {
        score = 4000 + (input.length / target.length * 500);
      }

      if (score > 0) {
        const res = resolveMedication(s);
        results.push({ 
          name: s, 
          isVerified: true, 
          score, 
          label: score === 10000 ? 'Clinical Match' : 'Verified Suggestion', 
          genericName: res.ingredients.join(', '), 
          route: res.route 
        });
      }
    });

    // Sort by score (Exact matches will be at top)
    results.sort((a, b) => b.score - a.score);

    // 2. Always show "Unverified Name" at the bottom as a fallback
    // This allows users to add custom names even if suggestions exist
    results.push({ 
      name: searchTerm.trim(), 
      isVerified: false, 
      score: -100, 
      label: 'Unverified Name', 
      genericName: 'Custom Entry' 
    });

    return results.slice(0, 10);
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

  // Helper to highlight matched characters
  const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const parts: React.ReactNode[] = [];
    
    let lastIdx = 0;
    let matchIdx = lowerText.indexOf(lowerHighlight);
    
    // Simple substring match highlighting
    if (matchIdx !== -1) {
      parts.push(text.substring(0, matchIdx));
      parts.push(<span key="match" className="text-clinical-600 dark:text-clinical-400 bg-clinical-500/10 rounded-sm font-black">{text.substring(matchIdx, matchIdx + highlight.length)}</span>);
      parts.push(text.substring(matchIdx + highlight.length));
    } else {
      // Subsequence match highlighting for fuzzy
      let hIdx = 0;
      for (let i = 0; i < text.length; i++) {
        if (hIdx < highlight.length && text[i].toLowerCase() === highlight[hIdx].toLowerCase()) {
          parts.push(<span key={i} className="text-clinical-600 dark:text-clinical-400 bg-clinical-500/10 rounded-sm font-black">{text[i]}</span>);
          hIdx++;
        } else {
          parts.push(text[i]);
        }
      }
    }
    
    return <>{parts}</>;
  };

  return (
    <div className="animate-in fade-in duration-700">
      <SectionHero 
        title="Inventory" 
        subtitle="Molecules & Supplements" 
        icon="💊" 
        color="#a855f7" 
      />

      <div className="max-w-4xl mx-auto space-y-12 px-6">
        {isAdding ? (
          <div className="bg-white dark:bg-[#0a192f] rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl p-8 md:p-14 space-y-12 relative overflow-visible">
            <div className="relative" ref={searchContainerRef}>
              <div className="flex justify-between items-center mb-6">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">1. Clinical Search</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-6 py-2 bg-clinical-500/10 text-clinical-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-clinical-500 hover:text-white transition-all"
                >
                  📷 {isScanning ? 'Decoding...' : 'Vision Scan'}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleScan} />
              </div>
              <input 
                type="text"
                value={searchTerm}
                autoFocus
                onFocus={() => setDropdownVisible(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedMed) setSelectedMed(null);
                }}
                placeholder="Search Molecule..."
                className="w-full bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 rounded-3xl py-6 px-10 text-xl font-black focus:border-clinical-600 outline-none transition-all dark:text-white"
              />
              {dropdownVisible && searchResults.length > 0 && !selectedMed && (
                <div className="absolute z-[100] w-full top-full mt-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  {searchResults.map((res, i) => (
                    <button key={i} onClick={() => selectMed(res)} className={`w-full text-left px-8 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center group transition-colors ${res.isVerified ? 'hover:bg-clinical-500/5' : 'hover:bg-slate-500/5'}`}>
                      <div className="flex flex-col">
                        <span className={`font-black uppercase text-sm ${res.isVerified ? 'text-slate-900 dark:text-white' : 'text-slate-500 italic'}`}>
                          <HighlightedText text={res.name} highlight={searchTerm} />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic tracking-wider">
                          {res.genericName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${
                          res.isVerified 
                            ? (res.score === 10000 ? 'bg-clinical-600 text-white border border-clinical-600' : 'bg-clinical-500/10 text-clinical-600 border border-clinical-500/20')
                            : 'bg-slate-100 dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/5 italic'
                        }`}>
                          {res.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-10">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">2. Configuration</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <input type="text" value={dose.amount} onChange={e => setDose({...dose, amount: e.target.value})} placeholder="Strength (e.g. 150)" className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-3xl p-6 text-xl font-black outline-none dark:text-white" />
                <select value={dose.unit} onChange={e => setDose({...dose, unit: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-3xl p-6 text-xl font-black outline-none dark:text-white">
                  <option>mg</option><option>mcg</option><option>ml</option><option>pills</option>
                </select>
                <select value={dose.frequency} onChange={e => setDose({...dose, frequency: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-3xl p-6 text-xl font-black outline-none dark:text-white">
                  <option value="1">Once Daily</option><option value="2">Twice Daily</option><option value="3">3x Daily</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6 pt-12 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={handleSave} 
                disabled={!searchTerm.trim()}
                className="flex-1 bg-clinical-600 text-white py-10 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Integrate
              </button>
              <button onClick={() => resetForm()} className="md:w-1/3 bg-slate-100 dark:bg-white/5 text-slate-400 py-10 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em]">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {medications.map(med => (
              <div key={med.id} className="bg-white dark:bg-[#0a192f] rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 shadow-2xl group transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-clinical-600/10 flex items-center justify-center text-5xl">💊</div>
                      <div>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">{med.display_name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{med.current_dose.amount} {med.current_dose.unit} • {med.current_dose.schedule_notes}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setMedications(medications.filter(m => m.id !== med.id))}
                    className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                   >
                    ✕
                   </button>
                </div>
              </div>
            ))}
            <button onClick={() => setIsAdding(true)} className="p-12 border-4 border-dashed border-slate-300 dark:border-white/10 rounded-[4rem] flex flex-col items-center justify-center gap-6 group hover:border-clinical-600 hover:bg-clinical-600/5 transition-all min-h-[250px]">
              <div className="text-6xl group-hover:rotate-90 transition-transform duration-500">➕</div>
              <span className="font-black text-sm uppercase tracking-[0.3em] text-slate-400 group-hover:text-clinical-600">Add New Protocol</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationList;
