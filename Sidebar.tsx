
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const items = [
    { id: 'home', label: 'HOME', icon: '🏠', color: '#3b82f6' },
    { id: 'profile', label: 'BIO-PROFILE', icon: '🧬', color: '#10b981' },
    { id: 'assistant', label: 'NEURAL CHAT', icon: '🧠', color: '#6366f1' },
    { id: 'live', label: 'LIVE CONSULT', icon: '🎙️', color: '#0ea5e9' },
    { id: 'studio', label: 'VISUAL STUDIO', icon: '🎨', color: '#14b8a6' },
    { id: 'timeline', label: 'PROGRESS', icon: '📈', color: '#06b6d4' },
    { id: 'interactions', label: 'SAFETY MATRIX', icon: '🧩', color: '#f59e0b' },
    { id: 'meds', label: 'MY MEDS', icon: '💊', color: '#a855f7' },
    { id: 'checkin', label: 'HOW I FEEL', icon: '📝', color: '#f59e0b' },
    { id: 'reports', label: 'FOR DOCTOR', icon: '📋', color: '#f43f5e' },
    { id: 'safety', label: 'EMERGENCY', icon: '🚨', color: '#ef4444' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️', color: '#64748b' },
    { id: 'legal', label: 'LEGAL', icon: '⚖️', color: '#94a3b8' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col bg-[#020617] dark:bg-[#030712] text-slate-400 shrink-0 border-r border-slate-800 dark:border-white/5 transition-all duration-500 ease-in-out relative overflow-visible z-50 ${
        isCollapsed ? 'w-20' : 'w-52'
      }`}
    >
      {/* Branding Area */}
      <div className={`p-6 mb-1 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="relative group cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="w-9 h-9 bg-clinical-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:rotate-12">
            ⬡
          </div>
        </div>
        {!isCollapsed && (
          <div className="text-[10px] font-black text-white tracking-[0.2em] uppercase animate-in fade-in slide-in-from-left-2 duration-500">
            MRX<span className="text-clinical-500">.</span>HEALTH
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-0 overflow-y-auto custom-scrollbar pt-2">
        {items.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center rounded-xl transition-all duration-300 group relative py-2 ${
                isCollapsed ? 'justify-center px-0' : 'px-4 gap-2.5'
              } ${
                isActive 
                  ? 'bg-white/5 text-white' 
                  : 'hover:bg-white/[0.03] hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Light */}
              {isActive && (
                <div 
                  className="absolute left-0 w-1 h-3 rounded-r-full transition-all duration-500" 
                  style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                ></div>
              )}

              {/* Icon */}
              <span className={`text-base transition-all duration-500 ${
                isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'
              }`}>
                {item.icon}
              </span>

              {/* Label - Ultra Condensed Style (Extreme scale-x) */}
              {!isCollapsed && (
                <span 
                  className={`font-black text-[9px] tracking-tighter uppercase origin-left transition-all duration-300 scale-x-[0.75] whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  style={{ color: isActive ? item.color : undefined }}
                >
                  {item.label}
                </span>
              )}

              {/* Tooltip for Collapsed State */}
              {isCollapsed && (
                <div className="absolute left-20 px-3 py-2 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-2xl border border-white/10 z-[100]">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center transition-all group ${
            isCollapsed ? 'justify-center' : 'px-3 gap-3'
          }`}
        >
          <span className={`text-[10px] opacity-40 group-hover:opacity-100 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}>
            ◀
          </span>
          {!isCollapsed && (
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400 scale-x-75">
              Contract Link
            </span>
          )}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 1px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
      `}} />
    </aside>
  );
};

export default Sidebar;
