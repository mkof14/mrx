
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const items = [
    { id: 'home', label: 'DASHBOARD', icon: '🏠', color: '#3b82f6' },
    { id: 'profile', label: 'MY PROFILE', icon: '🧬', color: '#10b981' },
    { id: 'assistant', label: 'ASK ME', icon: '🧠', color: '#6366f1' },
    { id: 'live', label: 'LIVE HELP', icon: '🎙️', color: '#0ea5e9' },
    { id: 'studio', label: 'IMAGES', icon: '🎨', color: '#14b8a6' },
    { id: 'timeline', label: 'PROGRESS', icon: '📈', color: '#06b6d4' },
    { id: 'interactions', label: 'SAFETY CHECK', icon: '🧩', color: '#f59e0b' },
    { id: 'meds', label: 'MY PILLS', icon: '💊', color: '#a855f7' },
    { id: 'checkin', label: 'HOW I FEEL', icon: '📝', color: '#f59e0b' },
    { id: 'reports', label: 'FOR DOCTOR', icon: '📋', color: '#f43f5e' },
    { id: 'safety', label: 'EMERGENCY', icon: '🚨', color: '#ef4444' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️', color: '#64748b' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col bg-[#020617] dark:bg-[#030712] text-slate-400 shrink-0 border-r border-slate-800 dark:border-white/5 transition-all duration-500 ease-in-out relative overflow-visible z-50 ${
        isCollapsed ? 'w-20' : 'w-52'
      }`}
    >
      <div className={`p-6 mb-1 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="relative group cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="w-9 h-9 bg-clinical-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:rotate-12">
            M
          </div>
        </div>
        {!isCollapsed && (
          <div className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
            MRX<span className="text-clinical-500">.</span>HEALTH
          </div>
        )}
      </div>

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
              {isActive && (
                <div 
                  className="absolute left-0 w-1 h-3 rounded-r-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
              )}
              <span className={`text-base transition-all duration-500 ${isActive ? 'scale-110' : 'grayscale opacity-50'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className={`font-black text-[9px] tracking-tighter uppercase whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <span className="text-[10px] opacity-40">◀</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
