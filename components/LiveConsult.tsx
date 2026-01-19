import React, { useState, useEffect, useRef } from 'react';
import { connectLiveSession } from '../geminiService';
import { UserProfile, AIVoice } from '../types';
import SectionHero from './SectionHero';
import { decodeBase64, encodeBase64, decodeAudioData } from '../utils/audio';

interface LiveConsultProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const AICoreAvatar: React.FC<{ isActive: boolean, volume: number }> = ({ isActive, volume }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-700 ${isActive ? 'opacity-40' : 'opacity-10'}`} 
           style={{ 
             background: `conic-gradient(from 0deg, #3b82f6, #10b981, #8b5cf6, #3b82f6)`,
             transform: `rotate(${volume}deg) scale(${1 + (isActive ? 0.2 : 0)})`
           }} />
      <div className={`relative z-10 w-48 h-48 rounded-full bg-slate-900 border-4 border-white/5 flex items-center justify-center shadow-2xl transition-all ${isActive ? 'scale-110 shadow-clinical-500/20' : 'scale-100'}`}>
         <div className={`w-32 h-32 rounded-full border-2 border-clinical-500/30 flex items-center justify-center ${isActive ? 'animate-spin-slow' : ''}`}>
            <span className="text-6xl">{isActive ? '🌀' : '💤'}</span>
         </div>
      </div>
    </div>
  );
};

const LiveConsult: React.FC<LiveConsultProps> = ({ profile, onUpdateProfile }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Diagnostic Standby');
  const [micMuted, setMicMuted] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{role: 'user'|'doctor', text: string}[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  const currentTranscriptionsRef = useRef({ user: '', doctor: '' });

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    
    setIsActive(false);
    setStatus('Diagnostic Standby');
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    sessionPromiseRef.current = null;
  };

  const startSession = async () => {
    try {
      // 1. Initialize Audio Contexts
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      outputNodeRef.current = audioCtx.createGain();
      outputNodeRef.current.connect(audioCtx.destination);

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      
      // Ensure contexts are active
      await audioCtx.resume();
      await inputCtx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Establish Live Link
      sessionPromiseRef.current = connectLiveSession({
        onopen: () => {
          setStatus('Biological Stream Active');
          setIsActive(true);
          
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            if (micMuted || !sessionPromiseRef.current) return;
            
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            const pcmBlob = { 
              data: encodeBase64(new Uint8Array(int16.buffer)), 
              mimeType: 'audio/pcm;rate=16000' 
            };

            // CRITICAL: Call sendRealtimeInput only after session promise resolves
            sessionPromiseRef.current.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (msg: any) => {
          // Handle Transcriptions
          if (msg.serverContent?.inputTranscription) {
            currentTranscriptionsRef.current.user += msg.serverContent.inputTranscription.text;
          }
          if (msg.serverContent?.outputTranscription) {
            currentTranscriptionsRef.current.doctor += msg.serverContent.outputTranscription.text;
          }
          
          if (msg.serverContent?.turnComplete) {
            const userText = currentTranscriptionsRef.current.user.trim();
            const doctorText = currentTranscriptionsRef.current.doctor.trim();
            
            if (userText || doctorText) {
              setTranscriptions(prev => [
                ...prev, 
                ...(userText ? [{role: 'user' as const, text: userText}] : []),
                ...(doctorText ? [{role: 'doctor' as const, text: doctorText}] : [])
              ]);
            }
            currentTranscriptionsRef.current = { user: '', doctor: '' };
          }

          // Handle Audio Output
          const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData.data;
          if (base64 && audioContextRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            
            const audioData = decodeBase64(base64);
            const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.playbackRate.value = profile.speech_speed;
            source.connect(outputNodeRef.current!);
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += (buffer.duration / profile.speech_speed);
            
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          // Handle Interruptions
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => {
              try { s.stop(); } catch(e) {}
            });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e: any) => {
          console.error("Live API Error:", e);
          setStatus('Sync Failure');
          stopSession();
        },
        onclose: () => {
          setStatus('Diagnostic Standby');
          stopSession();
        }
      }, profile);

    } catch (err) { 
      console.error("Hardware Access Error:", err);
      setStatus('Hardware Access Denied'); 
    }
  };

  const voices: AIVoice[] = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
  const speeds = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero title="Live Consult" subtitle="Neural Triage Dialogue" icon="🎙️" color="#0ea5e9" />
      
      <div className="max-w-6xl mx-auto px-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Selection */}
        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Consultant Voice</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase italic">Select personality core</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {voices.map(v => (
              <button 
                key={v}
                disabled={isActive}
                onClick={() => onUpdateProfile({ ...profile, preferred_voice: v })}
                className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${profile.preferred_voice === v ? 'bg-clinical-600 border-clinical-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-transparent text-slate-500'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Selection */}
        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diction Speed</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase italic">Adjust temporal flow</p>
          </div>
          <div className="flex gap-2">
            {speeds.map(s => (
              <button 
                key={s}
                onClick={() => onUpdateProfile({ ...profile, speech_speed: s })}
                className={`w-12 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${profile.speech_speed === s ? 'bg-clinical-600 border-clinical-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-transparent text-slate-500'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 px-6">
        <div className="lg:col-span-5 bg-[#020617] rounded-[5rem] p-12 flex flex-col items-center justify-center space-y-10 border border-white/5 relative overflow-hidden">
          <AICoreAvatar isActive={isActive} volume={0} />
          <div className="text-center z-10 space-y-2">
            <p className="text-white text-2xl font-black uppercase tracking-tighter">{status}</p>
            {isActive && <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Link Established</div>}
          </div>
          
          <div className="flex flex-col gap-4 w-full z-10">
            {!isActive ? (
              <button onClick={startSession} className="bg-white text-slate-950 px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Start Session</button>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setMicMuted(!micMuted)} 
                  className={`px-12 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all border-2 ${micMuted ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-white/20 text-white hover:bg-white/10'}`}
                >
                  {micMuted ? '🔇 Mic Muted' : '🎤 Mic Active'}
                </button>
                <button onClick={stopSession} className="bg-rose-600 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all">End Session</button>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/50 rounded-[5rem] border border-slate-200 dark:border-white/5 h-[600px] flex flex-col overflow-hidden shadow-2xl">
           <div className="p-10 border-b border-slate-200 dark:border-white/5 font-black uppercase tracking-[0.4em] text-slate-400 flex justify-between items-center">
             <span>Biological Transcript</span>
             <div className="flex gap-2">
               <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-clinical-500 animate-pulse' : 'bg-slate-300'}`}></div>
               <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-clinical-500/50 animate-pulse [animation-delay:0.2s]' : 'bg-slate-300'}`}></div>
             </div>
           </div>
           <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
              {transcriptions.length === 0 && !isActive && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-400 space-y-4">
                  <span className="text-6xl">📡</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Link</p>
                </div>
              )}
              {transcriptions.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[80%] p-8 rounded-[2.5rem] font-bold text-sm leading-relaxed shadow-sm ${t.role === 'user' ? 'bg-clinical-600 text-white' : 'bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'}`}>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-2 opacity-50">{t.role === 'user' ? 'Patient' : profile.preferred_voice || 'Doctor'}</p>
                    {t.text}
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveConsult;