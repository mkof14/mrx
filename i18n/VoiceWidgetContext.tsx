import React, { createContext, useContext, useState, useCallback } from 'react';

interface VoiceWidgetContextValue {
  isOpen: boolean;
  openVoice: () => void;
  closeVoice: () => void;
  toggleVoice: () => void;
}

const VoiceWidgetContext = createContext<VoiceWidgetContextValue | null>(null);

export function VoiceWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openVoice = useCallback(() => setIsOpen(true), []);
  const closeVoice = useCallback(() => setIsOpen(false), []);
  const toggleVoice = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <VoiceWidgetContext.Provider value={{ isOpen, openVoice, closeVoice, toggleVoice }}>
      {children}
    </VoiceWidgetContext.Provider>
  );
}

export function useVoiceWidget() {
  const ctx = useContext(VoiceWidgetContext);
  if (!ctx) throw new Error('useVoiceWidget must be used within VoiceWidgetProvider');
  return ctx;
}
