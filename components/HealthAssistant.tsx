import React, { useState, useRef, useEffect } from 'react';
import { Medication, SymptomEntry, UserProfile, AIVoice } from '../types';
import { getAssistantResponseStream, generateSpeech } from '../geminiService';
import SectionHero from './SectionHero';
import { decodeBase64, decodeAudioData } from '../utils/audio';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  groundingLinks?: { title: string, uri: string }[];
}

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  profile: UserProfile;
  onUpdateProfile?: (p: UserProfile) => void;
}

const HealthAssistant: React.FC<Props> = ({ medications, checkins, profile, onUpdateProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm your MRX Health Companion. I'm ready to analyze your ${medications.length} medications and ${checkins.length} recent logs.` }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReading, setIsReading] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isProcessing]);

  const handleSend = async (customText?: string) => {
    const query = (customText || input).trim();
    if (!query || isProcessing) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsProcessing(true);

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
      const stream = await getAssistantResponseStream(query, { medications, logs: checkins, profile });
      let fullContent = '';
      let links: any[] = [];
      
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) fullContent += text;
        const metadata = chunk.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
           links = metadata.groundingChunks.filter(c => c.web).map(c => c.web);
        }
        
        setMessages(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          last.content = fullContent;
          last.groundingLinks = links;
          return next;
        });
      }
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1].isStreaming = false;
        return next;
      });
    } catch (e) {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: "Neural sync interrupted. Check connection." }]);
    } finally { setIsProcessing(false); }
  };

  const handleReadAloud = async (text: string, index: number) => {
    if (isReading !== null) return;
    setIsReading(index);
    try {
      const audioCtx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      
      const base64Audio = await generateSpeech(text, profile.preferred_voice);
      if (base64Audio) {
        const buffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = profile.speech_speed;
        source.connect(audioCtx.destination);
        source.start();
        source.onended = () => setIsReading(null);
      } else {
        setIsReading(null);
      }
    } catch (e) {
      console.error(e);
      setIsReading(null);
    }
  };

  const voices: AIVoice[] = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
  const speeds = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="animate-slide-up flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-6rem)]">
      <div className="shrink-0">
        <SectionHero title="Neural Chat" subtitle="Pharmacological Intelligence" icon="🧠" color="#6366f1" />
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 max-w-5xl mx-auto w-full px-6 mb-8 lg:mb-4">
        {/* Voice Selection Controls */}
        <div className="shrink-0 flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md w-full md:w-auto">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Voice Core:</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {voices.map(v => (
                <button 
                  key={v}
                  onClick={() => onUpdateProfile && onUpdateProfile({ ...profile, preferred_voice: v })}
                  className={`px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest border transition-all ${profile.preferred_voice === v ? 'bg-clinical-600 border-clinical-600 text-white' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md w-full md:w-auto">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Diction:</span>
            <div className="flex gap-1">
              {speeds.map(s => (
                <button 
                  key={s}
                  onClick={() => onUpdateProfile && onUpdateProfile({ ...profile, speech_speed: s })}
                  className={`w-10 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest border transition-all ${profile.speech_speed === s ? 'bg-clinical-600 border-clinical-600 text-white' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat History Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 p-8 md:p-10 bg-white dark:bg-slate-900/40 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl custom-scrollbar relative min-h-0">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none italic font-black text-6xl uppercase tracking-tighter hidden md:block">Companion</div>
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[90%] md:max-w-[80%] p-6 md:p-8 rounded-[2.5rem] shadow-sm relative group ${m.role === 'user' ? 'bg-clinical-600 text-white' : 'bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white border border-slate-100 dark:border-white/10'}`}>
                <div className="text-sm md:text-base font-bold leading-relaxed italic">{m.content}</div>
                
                {m.role === 'assistant' && !m.isStreaming && m.content && (
                  <button 
                    onClick={() => handleReadAloud(m.content, i)}
                    className={`absolute -bottom-4 right-10 w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-xl transition-all hover:scale-110 active:scale-90 ${isReading === i ? 'bg-clinical-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-clinical-500'}`}
                  >
                    {isReading === i ? '🔊' : '🔈'}
                  </button>
                )}

                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Biological Grounding Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {m.groundingLinks.map((link, j) => (
                        <a key={j} href={link.uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-[9px] text-clinical-600 font-bold hover:bg-clinical-500/10 transition-colors">
                          🔗 {link.title || 'Source Path'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
               <div className="p-6 bg-white dark:bg-white/5 rounded-[2rem] flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-clinical-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-clinical-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-clinical-500 animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="shrink-0 mt-6 mb-8 flex gap-3 p-2 bg-slate-900/5 dark:bg-white/5 rounded-[3rem] backdrop-blur-md">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-clinical-500 rounded-[2.5rem] px-8 py-5 text-sm md:text-base font-bold outline-none dark:text-white shadow-lg transition-all" 
            placeholder="Ask about molecule kinetics..." 
          />
          <button 
            onClick={() => handleSend()} 
            disabled={isProcessing || !input.trim()}
            className="bg-clinical-600 text-white w-16 md:w-20 rounded-[2.5rem] text-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthAssistant;