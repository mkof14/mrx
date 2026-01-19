
import React from 'react';
import { RiskColor } from './types';

export interface SymptomCategory {
  id: string;
  label: string;
  icon: string;
  accent: string;
  description: string;
  lowBreakdown: string;
  highBreakdown: string;
  simpleHint: string;
  detailedExplanation?: string;
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { 
    id: 'sleep_quality', 
    label: 'Sleep Issues', 
    icon: '🌘', 
    accent: '#af7ac5',
    description: 'Tossing, turning, or waking up',
    simpleHint: 'Did you have trouble sleeping?',
    lowBreakdown: 'Slept perfectly; felt refreshed.',
    highBreakdown: 'Could not sleep; felt exhausted.',
    detailedExplanation: 'This score compares tonight\'s rest to your usual baseline. A low score (0-3) means your body rested deeply, and you woke up feeling refreshed and clear-headed. High scores (8-10) represent nights where sleep felt light, interrupted, or shorter than you needed, leaving you feeling drained. Please remember: it is completely normal for your sleep-wake cycle to shift temporarily during treatment adjustments—this data simply helps us optimize your dosage timing for maximum comfort.'
  },
  { 
    id: 'anxiety', 
    label: 'Anxiety Level', 
    icon: '🌪️', 
    accent: '#ec7063',
    description: 'Feeling on edge or worried',
    simpleHint: 'Do you feel "shaky" or "racing"?',
    lowBreakdown: 'Mind is quiet and steady.',
    highBreakdown: 'Panic or racing thoughts.',
    detailedExplanation: 'Anxiety is like an internal alarm system. A low score (0-3) means your mind and body feel steady and calm. A high score (8-10) reflects a sense of "racing" thoughts, jitters, or a tight feeling in your chest compared to your usual baseline. Many people feel a bit more "vibrant" or restless when starting a new treatment—this is often just your nervous system adjusting to the new balance.'
  },
  { 
    id: 'mood_low', 
    label: 'Low Mood', 
    icon: '🎭', 
    accent: '#48c9b0',
    description: 'Feeling "down" or "grey"',
    simpleHint: 'How heavy does your mood feel?',
    lowBreakdown: 'Feeling bright and positive.',
    highBreakdown: 'Feeling empty, sad, or "flat".',
    detailedExplanation: 'Mood is the "emotional brightness" of your day. A low score (0-3) means you feel capable, interested, and like your normal self. A high score (8-10) represents a feeling of "greyness," sadness, or a lack of interest compared to how you usually feel. Tracking this doesn\'t mean you are failing; it provides vital data to help your care team see if your treatment is effectively lifting that weight over time.'
  },
  { 
    id: 'irritability', 
    label: 'Short Fuse', 
    icon: '🗯️', 
    accent: '#d35400',
    description: 'Snappy or easily frustrated',
    simpleHint: 'Is your patience thin today?',
    lowBreakdown: 'Feeling patient and calm.',
    highBreakdown: 'Easily annoyed by small things.',
    detailedExplanation: 'This score reflects your "patience tank." A low score (0-3) means you have your usual amount of patience for daily life. A high score (8-10) means you feel "snappier" or more easily annoyed by small things than you normally would. This "shorter fuse" is a common and often temporary signal that your brain is working hard to process new therapeutic changes.'
  },
  { 
    id: 'energy_low', 
    label: 'Tiredness', 
    icon: '🔋', 
    accent: '#5dade2',
    description: 'Low physical energy',
    simpleHint: 'Does your body feel drained?',
    lowBreakdown: 'Body feels full of energy.',
    highBreakdown: 'Felt completely drained.',
    detailedExplanation: 'Energy levels describe your physical stamina. A low score (0-3) means you feel light and naturally ready to move. A high score (8-10) means your body feels heavier, slower, or more drained than is typical for you. This "physical drag" is a frequent adjustment sign; knowing when it happens helps us optimize your dosage timing to better match your daily energy needs.'
  },
  { 
    id: 'focus_low', 
    label: 'Brain Fog', 
    icon: '🔮', 
    accent: '#a569bd',
    description: 'Cloudy or slow thinking',
    simpleHint: 'Is it hard to concentrate?',
    lowBreakdown: 'Thinking is sharp and easy.',
    highBreakdown: 'Felt "spaced out" or confused.',
    detailedExplanation: 'Think of this score as the "clarity" of your internal lens. A low score (0-3) means your thinking feels crisp, words come easily, and you can focus on tasks without extra effort. A high score (8-10) means your mind feels a bit "cloudy" or heavy, and it takes more energy than usual to stay on track or find your train of thought. Please don\'t worry—this "brain fog" is a very common signal from your nervous system as it adapts to new biological changes. Sharing this data helps your doctor find the right balance for your unique biology.'
  },
  { 
    id: 'libido_low', 
    label: 'Sexual Health', 
    icon: '🌡️', 
    accent: '#f06292',
    description: 'Changes in sex drive or response',
    simpleHint: 'Does your drive feel different than usual?',
    lowBreakdown: 'Feeling like my usual self.',
    highBreakdown: 'Muted drive or physical response.',
    detailedExplanation: 'This score tracks any shifts in your natural sex drive or physical response compared to your usual self. A low score (0-3) simply means you feel like your normal, baseline self. Higher scores (4-10) indicate that your drive feels "quieter," more muted, or different than it usually does. Please be reassured: it is extremely common for medications to interact with the body\'s chemistry in ways that temporarily shift these feelings. Tracking this allows your care team to fine-tune your treatment plan to ensure it supports your overall vitality and quality of life.'
  },
  { 
    id: 'palpitations', 
    label: 'Heart Thumping', 
    icon: '💓', 
    accent: '#cd6155',
    description: 'Racing or skipping beats',
    simpleHint: 'Can you feel your heart beating?',
    lowBreakdown: 'Heart is quiet and steady.',
    highBreakdown: 'Thumping or skipping beats.',
    detailedExplanation: 'This score tracks how much you are "aware" of your heartbeat. A low score (0-3) means your heart is quiet and unnoticed, which is normal. A high score (8-10) means you can feel a thumping, racing, or "fluttering" sensation in your chest compared to your usual state. While often startling, this is frequently just a sign of your system reacting to a new stimulus—monitoring it helps us ensure your internal engine is running smoothly.'
  },
  { 
    id: 'nausea', 
    label: 'Stomach Comfort', 
    icon: '🌊', 
    accent: '#45b39d',
    description: 'Queasy or sick feeling',
    simpleHint: 'Is your stomach bothering you?',
    lowBreakdown: 'Stomach feels perfectly fine.',
    highBreakdown: 'Feeling sick or queasy.',
    detailedExplanation: 'Your gut has its own sensitive nervous system. A low score (0-3) means your stomach feels calm and settled. A high score (8-10) represents a feeling of being queasy or "seasick" compared to your normal appetite. This usually fades quickly as your body adapts. Knowing this helps your doctor decide if taking your medication with food might improve your comfort.'
  },
  { 
    id: 'headache', 
    label: 'Head Pressure', 
    icon: '⚡', 
    accent: '#52be80',
    description: 'Tension or throbbing',
    simpleHint: 'Does your head hurt?',
    lowBreakdown: 'Head feels clear and fine.',
    highBreakdown: 'Pressure or painful throbbing.',
    detailedExplanation: 'This tracks physical discomfort in your head. A low score (0-3) means your head feels clear and comfortable. A high score (8-10) reflects a sense of pressure, tightness, or throbbing that is unusual for you. Tracking the intensity helps us distinguish between a normal adjustment phase and a pattern that might require a slightly different approach to your treatment.'
  },
];

export const COLOR_MAP = {
  [RiskColor.RED]: 'bg-[#ef4444] text-white',
  [RiskColor.ORANGE]: 'bg-[#f59e0b] text-white',
  [RiskColor.YELLOW]: 'bg-[#fcd34d] text-black',
  [RiskColor.BLUE]: 'bg-[#3b82f6] text-white',
  [RiskColor.GRAY]: 'bg-[#94a3b8] text-white',
};

export const BORDER_COLOR_MAP = {
  [RiskColor.RED]: 'border-[#ef4444]',
  [RiskColor.ORANGE]: 'border-[#f59e0b]',
  [RiskColor.YELLOW]: 'border-[#fcd34d]',
  [RiskColor.BLUE]: 'border-[#3b82f6]',
  [RiskColor.GRAY]: 'border-[#94a3b8]',
};

export const TEXT_COLOR_MAP = {
  [RiskColor.RED]: 'text-[#ef4444]',
  [RiskColor.ORANGE]: 'text-[#f59e0b]',
  [RiskColor.YELLOW]: 'text-[#b45309]',
  [RiskColor.BLUE]: 'text-[#2563eb]',
  [RiskColor.GRAY]: 'text-[#64748b]',
};

export const INITIAL_SCORES = {
  sleep_quality: 0,
  anxiety: 0,
  mood_low: 0,
  irritability: 0,
  energy_low: 0,
  focus_low: 0,
  libido_low: 0,
  palpitations: 0,
  nausea: 0,
  headache: 0
};
