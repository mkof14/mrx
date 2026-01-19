
import React, { useState } from 'react';
import { Medication, SymptomEntry, MedicationEvent, Viewpoint } from '../types';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SectionHero from './SectionHero';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  events: MedicationEvent[];
  theme: 'light' | 'dark';
}

const Timeline: React.FC<Props> = ({ medications, checkins, events, theme }) => {
  const [viewpoint, setViewpoint] = useState<Viewpoint>(Viewpoint.BALANCED);
  const isDark = theme === 'dark';

  const chartData = [...checkins].reverse().map(c => {
    const dayEvents = events.filter(e => e.event_iso.split('T')[0] === c.log_iso.split('T')[0]);
    return {
      date: new Date(c.log_iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      ...c.symptom_scales,
      event: dayEvents.length > 0 ? 9.5 : null,
      eventLabel: dayEvents.map(e => e.event_type).join(', ')
    };
  });

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero 
        title="Progress" 
        subtitle="Physiological Variance Timeline" 
        icon="📈" 
        color="#06b6d4" 
      />

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="bg-white dark:bg-[#0a192f] p-10 md:p-14 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl transition-all overflow-hidden">
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: textColor, fontWeight: 900}} dy={20} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    borderRadius: '32px', border: 'none', padding: '24px',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '40px', textTransform: 'uppercase' }} />
                <Line type="monotone" dataKey="sleep_quality" stroke="#af7ac5" strokeWidth={5} dot={false} name="Sleep" />
                <Line type="monotone" dataKey="mood_low" stroke="#48c9b0" strokeWidth={5} dot={false} name="Mood" />
                <Line type="monotone" dataKey="anxiety" stroke="#ec7063" strokeWidth={5} dot={false} name="Anxiety" />
                <Scatter dataKey="event" fill="#3b82f6" name="Med Event" shape="star" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
