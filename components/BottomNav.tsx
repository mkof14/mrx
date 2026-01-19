
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'home', label: 'HOME', icon: '🏠', color: '#5dade2' },
    { id: 'profile', label: 'BIO', icon: '🧬', color: '#48c9b0' },
    { id: 'assistant', label: 'CHAT', icon: '🧠', color: '#3b82f6' },
    { id: 'live', label: 'LIVE', icon: '🎙️', color: '#60a5fa' },
    { id: 'checkin', label: 'FEEL', icon: '📝', color: '#eb984e' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex justify-around items-center h-20 px-2 z-50">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="flex flex-col items-center justify-center flex-1 h-full transition-all group relative"
        >
          <div 
            className={`text-2xl transition-all duration-300 ${activeTab === item.id ? 'scale-110 mb-1' : 'opacity-40 grayscale'}`}
            style={{ color: activeTab === item.id ? item.color : 'inherit' }}
          >
            {item.icon}
          </div>
          <span 
            className={`text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'opacity-100' : 'opacity-30'}`}
            style={{ color: activeTab === item.id ? item.color : 'inherit' }}
          >
            {item.label}
          </span>
          {activeTab === item.id && (
            <div className="absolute bottom-0 w-8 h-1 rounded-t-full" style={{ backgroundColor: item.color }}></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
