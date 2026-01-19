
import React, { useState, useEffect } from 'react';
import { generateHealthImage, editHealthImage } from '../geminiService';
import SectionHero from './SectionHero';

// Removed redundant declare global for Window.aistudio as it is already defined in the environment as AIStudio.

const CreativeStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [size, setSize] = useState<any>('1K');
  const [ratio, setRatio] = useState('1:1');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  // Mandatory check for API key selection for Gemini 3 Pro series models
  useEffect(() => {
    const checkKey = async () => {
      // Use type assertion to access aistudio safely since we removed the global declaration
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for non-AI Studio local environments
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  // Triggers the mandatory key selection dialog
  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume selection successful immediately to avoid race conditions
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateHealthImage(prompt, size, ratio);
      if (result) {
        setGeneratedImg(result);
      }
    } catch (error: any) {
      // If the request fails with an error message containing "Requested entity was not found.",
      // reset the key selection state and prompt the user to select a key again via openSelectKey().
      if (error?.message?.includes("Requested entity was not found.")) {
        setHasKey(false);
        const aistudio = (window as any).aistudio;
        if (aistudio) {
          await aistudio.openSelectKey();
          setHasKey(true);
        }
      }
    }
    setIsGenerating(false);
  };

  const handleEdit = async () => {
    if (!generatedImg || !editPrompt) return;
    setIsGenerating(true);
    try {
      const result = await editHealthImage(generatedImg.split(',')[1], editPrompt);
      if (result) setGeneratedImg(result);
    } catch (error: any) {
      // If the request fails with an error message containing "Requested entity was not found.",
      // reset the key selection state and prompt the user to select a key again via openSelectKey().
      if (error?.message?.includes("Requested entity was not found.")) {
        setHasKey(false);
        const aistudio = (window as any).aistudio;
        if (aistudio) {
          await aistudio.openSelectKey();
          setHasKey(true);
        }
      }
    }
    setIsGenerating(false);
  };

  // Enforce API key selection view
  if (hasKey === false) {
    return (
      <div className="animate-slide-up pb-32">
        <SectionHero title="Studio Lock" subtitle="Premium Neural Authorization" icon="🔒" color="#f43f5e" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-20 rounded-[5rem] text-center space-y-10 shadow-2xl">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter">API Key Required</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] leading-relaxed max-w-sm mx-auto">
              High-resolution health art synthesis requires a paid API key from a Google Cloud Project with billing enabled.
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block text-[10px] font-black text-clinical-600 uppercase tracking-widest hover:underline">
              View Billing Requirements Documentation ➔
            </a>
            <button 
              onClick={handleSelectKey}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-12 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-3xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Select Paid API Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero 
        title="Visual Studio" 
        subtitle="Bio-Concept Synthesis Engine" 
        icon="🎨" 
        color="#14b8a6" 
      />

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-[#0a192f] p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-10">
          <div className="space-y-6">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 italic">Creative Direction</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Neural pathway synchronization art..." className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-8 text-lg font-bold outline-none dark:text-white" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Resolution</label>
                <select value={size} onChange={e => setSize(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 font-bold text-[10px] uppercase outline-none dark:text-white">
                  <option value="1K">1K (Standard)</option>
                  <option value="2K">2K (High Res)</option>
                  <option value="4K">4K (Ultra Res)</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Aspect Ratio</label>
                <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 font-bold text-[10px] uppercase outline-none dark:text-white">
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                </select>
             </div>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !prompt} className="w-full bg-clinical-600 text-white py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all">Synthesize Art</button>
        </div>

        <div className="bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl relative min-h-[500px] flex items-center justify-center border border-white/5">
          {generatedImg ? (
            <div className="w-full h-full flex flex-col p-8 space-y-8 animate-in zoom-in-95">
               <img src={generatedImg} alt="Health Art" className="w-full h-auto rounded-[3rem] shadow-2xl border border-white/10" />
               <div className="space-y-4">
                 <input type="text" value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="Modify synthesized pattern..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-clinical-500" />
                 <button onClick={handleEdit} className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-slate-100 active:scale-95 transition-all">Apply Neural Shift</button>
               </div>
            </div>
          ) : (
            <div className="text-center space-y-6 opacity-30 text-white animate-pulse">
               <div className="text-9xl">🎨</div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Creation</p>
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center z-50 space-y-6">
               <div className="w-20 h-20 border-8 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-[9px] font-black text-clinical-500 uppercase tracking-[0.5em] animate-pulse">Synthesizing Pixels...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;
