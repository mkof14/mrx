
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Medication, SymptomEntry, UserProfile } from '../types';
import { getAssistantResponseStream } from '../geminiService';
import SectionHero from './SectionHero';

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
}

const HealthAssistant: React.FC<Props> = ({ medications, checkins, profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm your MRX Health Companion. I'm ready to analyze your ${medications.length} medications and ${checkins.length} recent logs.` }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

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

  return (
    <div className="animate-slide-up pb-32 h-[calc(100vh-160px)] flex flex-col">
      <SectionHero title="Neural Chat" subtitle="Pharmacological Intelligence" icon="🧠" color="#6366f1" />
      <div className="max-w-5xl mx-auto flex flex-col flex-1 w-full px-6 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 p-10 bg-white dark:bg-slate-900/40 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-8 rounded-[2.5rem] ${m.role === 'user' ? 'bg-clinical-600 text-white' : 'bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-100 dark:border-white/10'}`}>
                <div className="text-base font-bold leading-relaxed italic">{m.content}</div>
                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400">Sources & Grounding</p>
                    {m.groundingLinks.map((link, j) => (
                      <a key={j} href={link.uri} target="_blank" rel="noreferrer" className="block text-[10px] text-clinical-500 font-bold hover:underline">
                        🔗 {link.title || link.uri}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] px-10 py-6 text-base font-bold outline-none dark:text-white shadow-xl" placeholder="Ask about molecule kinetics..." />
          <button onClick={() => handleSend()} className="bg-clinical-600 text-white w-20 rounded-[2.5rem] text-2xl shadow-xl">➔</button>
        </div>
      </div>
    </div>
  );
};

export default HealthAssistant;
