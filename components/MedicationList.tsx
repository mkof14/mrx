
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Medication, MedicationEvent } from '../types';
import { resolveMedicationLocal } from '../utils/normalization';
import { scanMedicationImage, parseMedicationText } from '../geminiService';
import { api } from '../services/apiClient';
import PageShell from './PageShell';
import PageCard from './PageCard';
import BackButton from './BackButton';
import { useI18n } from '../i18n/I18nContext';
import { getLocaleMeta } from '../i18n/languages';
import {
  applyParsedMedication,
  frequencyLabel,
  type DoseFormState,
  type MedFillSource,
  type ParsedMedication
} from '../utils/medicationForm';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { PageGuide, PageSummaryRow } from './ui/PageGuide';

interface Props {
  medications: Medication[];
  medicationEvents: MedicationEvent[];
  onUpdate: (medications: Medication[], events: MedicationEvent[]) => void;
  onFirstMedAdded?: () => void;
}

interface SearchResult {
  name: string;
  isVerified: boolean;
  score: number;
  label: string;
}

const INPUT_MODES: { id: MedFillSource; icon: string; key: 'meds.inputType' | 'meds.inputPhoto' | 'meds.inputPaste' | 'meds.inputVoice' | 'meds.inputBarcode' }[] = [
  { id: 'type', icon: '⌨️', key: 'meds.inputType' },
  { id: 'photo', icon: '📷', key: 'meds.inputPhoto' },
  { id: 'paste', icon: '📋', key: 'meds.inputPaste' },
  { id: 'voice', icon: '🎤', key: 'meds.inputVoice' },
  { id: 'barcode', icon: '📊', key: 'meds.inputBarcode' }
];

const CARD_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

function scheduleDots(freq: number | null | undefined) {
  const n = Math.min(4, Math.max(1, freq || 1));
  return Array.from({ length: n }, (_, i) => i);
}

const MedicationList: React.FC<Props> = ({ medications, medicationEvents, onUpdate, onFirstMedAdded }) => {
  const { t, locale } = useI18n();
  const speechLang = getLocaleMeta(locale).speechCode;

  const [isAdding, setIsAdding] = useState(medications.length === 0);
  const [inputMode, setInputMode] = useState<MedFillSource>('type');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<SearchResult | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dose, setDose] = useState<DoseFormState>({
    amount: '',
    unit: 'mg',
    frequency: 1,
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [pasteText, setPasteText] = useState('');
  const [barcodeText, setBarcodeText] = useState('');
  const [fillSource, setFillSource] = useState<MedFillSource | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const drugSuggestions = [
    'Metformin', 'Lisinopril', 'Atorvastatin', 'Omeprazole', 'Amlodipine',
    'Ibuprofen', 'Aspirin', 'Paracetamol', 'Zoloft', 'Levothyroxine'
  ];

  useEffect(() => {
    const mode = sessionStorage.getItem('mrx_med_input');
    if (mode === 'barcode') {
      setIsAdding(true);
      setInputMode('barcode');
      sessionStorage.removeItem('mrx_med_input');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const searchResults = useMemo(() => {
    const input = searchTerm.trim().toLowerCase();
    if (!input || selectedMed) return [];

    const results: SearchResult[] = [];
    drugSuggestions.forEach((s) => {
      if (s.toLowerCase().includes(input)) {
        results.push({ name: s, isVerified: true, score: 1, label: t('meds.search') });
      }
    });
    results.push({ name: searchTerm, isVerified: false, score: -1, label: t('meds.namePlaceholder') });
    return results.slice(0, 6);
  }, [searchTerm, selectedMed, t]);

  const selectMed = (res: SearchResult) => {
    setSelectedMed(res);
    setSearchTerm(res.name);
    setDropdownVisible(false);
    setFillSource('type');
  };

  const applyFromParsed = useCallback(
    async (name: string, parsed: ParsedMedication, source: MedFillSource) => {
      setFormError(null);
      setSearchTerm(name);
      applyParsedMedication(parsed, setDose);
      setFillSource(source);
      setInputMode(source === 'photo' ? 'type' : source);

      try {
        const resolved = await api.medications.resolve(name);
        setSelectedMed({
          name,
          isVerified: resolved.source !== 'fallback',
          score: 1,
          label: resolved.source === 'rxnorm' ? 'RxNorm' : t('meds.save')
        });
      } catch {
        setSelectedMed({ name, isVerified: false, score: 0, label: t('meds.previewTitle') });
      }
    },
    [t]
  );

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setFormError(null);
    setInputMode('photo');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        const result = (await scanMedicationImage(base64, mimeType)) as ParsedMedication & { name?: string };
        if (result?.name) {
          await applyFromParsed(result.name, result, 'photo');
        } else {
          setFormError(t('meds.scanError'));
        }
      } catch {
        setFormError(t('meds.scanError'));
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleParseText = async (text: string, source: MedFillSource) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsParsing(true);
    setFormError(null);
    try {
      const result = (await parseMedicationText(trimmed, locale)) as ParsedMedication & { name?: string };
      if (result?.name) {
        await applyFromParsed(result.name, result, source);
        if (source === 'paste') setPasteText(trimmed);
      } else {
        setFormError(t('meds.parseError'));
      }
    } catch {
      setFormError(t('meds.parseError'));
    } finally {
      setIsParsing(false);
    }
  };

  const handleBarcodeLookup = async () => {
    const code = barcodeText.trim();
    if (!code) return;
    setIsParsing(true);
    setFormError(null);
    try {
      const resolved = await api.medications.resolveBarcode(code);
      if (resolved.display_name) {
        await applyFromParsed(resolved.display_name, { name: resolved.display_name }, 'barcode');
        setInputMode('type');
      } else {
        setFormError(t('meds.barcodeError'));
      }
    } catch {
      setFormError(t('meds.barcodeError'));
    } finally {
      setIsParsing(false);
    }
  };

  const startVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      setFormError(t('meds.voiceUnsupported'));
      return;
    }
    setFormError(null);
    setInputMode('voice');
    recognitionRef.current?.abort();

    const recognition = createSpeechRecognition(speechLang);
    if (!recognition) {
      setFormError(t('meds.voiceUnsupported'));
      return;
    }

    recognitionRef.current = recognition;
    let finalText = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (finalText.trim()) {
        await handleParseText(finalText, 'voice');
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSave = async () => {
    const finalName = selectedMed?.name || searchTerm.trim();
    if (!finalName || isSaving) return;

    setIsSaving(true);
    try {
      let activeIngredients: string[];
      let route: string;
      let rxcui: string | null = null;

      try {
        const resolved = await api.medications.resolve(finalName);
        activeIngredients = resolved.active_ingredients;
        route = resolved.route;
        rxcui = resolved.rxcui;
      } catch {
        const local = resolveMedicationLocal(finalName);
        activeIngredients = local.ingredients;
        route = local.route;
        rxcui = local.rxcui === 'UNKNOWN' ? null : local.rxcui;
      }

      const scheduleNote =
        dose.notes.trim() ||
        frequencyLabel(dose.frequency, (k) => t(k as 'meds.freq1'));

      const medId = Math.random().toString(36).substr(2, 9);
      const med: Medication = {
        id: medId,
        display_name: finalName,
        normalized: {
          active_ingredients: activeIngredients,
          route: route || 'Oral',
          form: null,
          rxcui
        },
        status: 'ACTIVE',
        current_dose: {
          amount: dose.amount || null,
          unit: dose.unit || null,
          frequency_per_day: dose.frequency || null,
          schedule_notes: scheduleNote
        }
      };

      const startEvent: MedicationEvent = {
        event_id: Math.random().toString(36).substr(2, 9),
        med_id: medId,
        event_type: 'START',
        event_iso: new Date(dose.startDate).toISOString(),
        dose_snapshot: {
          amount: dose.amount || null,
          unit: dose.unit || null,
          frequency_per_day: dose.frequency || null
        },
        notes: dose.notes || t('meds.save')
      };

      onUpdate([...medications, med], [startEvent, ...medicationEvents]);
      resetForm();
      if (medications.length === 0 && onFirstMedAdded) onFirstMedAdded();
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setSelectedMed(null);
    setSearchTerm('');
    setPasteText('');
    setFillSource(null);
    setFormError(null);
    setInputMode('type');
    setDropdownVisible(false);
    setDose({
      amount: '',
      unit: 'mg',
      frequency: 1,
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const fillSourceLabel =
    fillSource === 'photo'
      ? t('meds.filledFromPhoto')
      : fillSource === 'paste'
        ? t('meds.filledFromText')
        : fillSource === 'voice'
          ? t('meds.filledFromVoice')
          : null;

  const removeMed = (med: Medication) => {
    const stopEvent: MedicationEvent = {
      event_id: Math.random().toString(36).substr(2, 9),
      med_id: med.id,
      event_type: 'STOP',
      event_iso: new Date().toISOString(),
      dose_snapshot: {
        amount: med.current_dose.amount,
        unit: med.current_dose.unit,
        frequency_per_day: med.current_dose.frequency_per_day
      },
      notes: t('meds.remove')
    };
    onUpdate(
      medications.filter((m) => m.id !== med.id),
      [stopEvent, ...medicationEvents]
    );
  };

  const PreviewPanel = () => (
    <div className="rounded-2xl border border-mrx-line dark:border-mrx-line-dark bg-gradient-to-br from-clinical-500/5 to-violet-500/5 p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('meds.previewTitle')}</h4>
        {fillSourceLabel && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            ✓ {fillSourceLabel}
          </span>
        )}
      </div>
      {!searchTerm.trim() && !dose.amount ? (
        <p className="text-sm text-slate-400">{t('meds.previewEmpty')}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-2xl">💊</span>
            <div>
              <p className="text-xs text-slate-400">{t('meds.fieldName')}</p>
              <p className="font-bold text-slate-900 dark:text-white">{searchTerm || '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
              <p className="text-[10px] text-slate-400 uppercase">{t('meds.fieldDose')}</p>
              <p className="font-bold text-slate-800 dark:text-white">
                {dose.amount ? `${dose.amount} ${dose.unit}` : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20">
              <p className="text-[10px] text-slate-400 uppercase">{t('meds.fieldSchedule')}</p>
              <p className="font-bold text-slate-800 dark:text-white">
                {frequencyLabel(dose.frequency, (k) => t(k as 'meds.freq1'))}
              </p>
            </div>
          </div>
          {dose.notes && (
            <p className="text-xs text-slate-500 italic">{dose.notes}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <PageShell tabId="meds" narrow>
      {isAdding ? (
        <div className="space-y-6">
          <BackButton onClick={resetForm} />

          <PageCard padding="lg" className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('meds.inputTitle')}</h3>
              <p className="text-sm text-slate-500 mt-1">{t('meds.methodsHint')}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {INPUT_MODES.map(({ id, icon, key }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setInputMode(id);
                    setFormError(null);
                    if (id === 'photo') fileInputRef.current?.click();
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    inputMode === id
                      ? 'border-clinical-500 bg-clinical-500/10 shadow-mrx-sm'
                      : 'border-mrx-line dark:border-mrx-line-dark hover:border-clinical-400/50'
                  }`}
                >
                  <span className="text-2xl block mb-2">{icon}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{t(key)}</span>
                </button>
              ))}
            </div>

            <input
              type="file"
              accept="image/*,.pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={handleScan}
            />

            {inputMode === 'photo' && (
              <div className="p-6 rounded-2xl border-2 border-dashed border-clinical-400/40 bg-clinical-500/5 text-center space-y-3">
                <div className="text-4xl">{isScanning ? '⏳' : '📷'}</div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {isScanning ? t('meds.scanning') : t('meds.uploadHint')}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="mrx-btn-primary text-sm px-6 py-3"
                >
                  {isScanning ? t('meds.scanning') : t('meds.scan')}
                </button>
              </div>
            )}

            {inputMode === 'paste' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500">{t('meds.pasteLabel')}</label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={t('meds.pastePlaceholder')}
                  rows={4}
                  className="w-full mrx-input resize-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleParseText(pasteText, 'paste')}
                  disabled={!pasteText.trim() || isParsing}
                  className="w-full py-4 rounded-2xl bg-violet-600 text-white font-bold disabled:opacity-40"
                >
                  {isParsing ? t('meds.parsing') : t('meds.pasteBtn')}
                </button>
              </div>
            )}

            {inputMode === 'barcode' && (
              <div className="space-y-3 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-slate-600 dark:text-slate-300">{t('meds.barcodeHint')}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={barcodeText}
                  onChange={(e) => setBarcodeText(e.target.value)}
                  placeholder={t('meds.barcodePlaceholder')}
                  className="w-full mrx-input text-lg font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={handleBarcodeLookup}
                  disabled={!barcodeText.trim() || isParsing}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold disabled:opacity-40"
                >
                  {isParsing ? t('meds.parsing') : t('meds.barcodeBtn')}
                </button>
              </div>
            )}

            {inputMode === 'voice' && (
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center space-y-4">
                <div className={`text-5xl ${isListening ? 'animate-pulse' : ''}`}>🎤</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {isListening ? t('meds.voiceListening') : t('meds.voiceHint')}
                </p>
                <button
                  type="button"
                  onClick={isListening ? stopVoice : startVoice}
                  disabled={isParsing}
                  className={`px-8 py-4 rounded-2xl font-bold text-white ${
                    isListening ? 'bg-rose-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {isParsing ? t('meds.parsing') : isListening ? '■' : t('meds.voiceBtn')}
                </button>
              </div>
            )}

            {formError && <p className="text-sm text-rose-500 font-semibold">{formError}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="relative" ref={searchContainerRef}>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">{t('meds.search')}</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onFocus={() => setDropdownVisible(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedMed(null);
                      setFillSource('type');
                    }}
                    placeholder={t('meds.namePlaceholder')}
                    className="w-full mrx-input text-lg font-bold py-4"
                  />
                  {dropdownVisible && searchResults.length > 0 && !selectedMed && (
                    <div className="absolute z-[100] w-full top-full mt-2 bg-white dark:bg-mrx-panel-dark border border-mrx-line dark:border-mrx-line-dark rounded-2xl shadow-mrx-md overflow-hidden">
                      {searchResults.map((res, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectMed(res)}
                          className="w-full text-left px-6 py-3 border-b border-slate-50 dark:border-mrx-line-dark hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <p className="font-bold text-slate-900 dark:text-white">{res.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500">{t('meds.doseTitle')}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={dose.amount}
                      onChange={(e) => setDose({ ...dose, amount: e.target.value })}
                      placeholder={t('meds.dosePlaceholder')}
                      className="mrx-input font-bold"
                    />
                    <select
                      value={dose.unit}
                      onChange={(e) => setDose({ ...dose, unit: e.target.value })}
                      className="mrx-input font-bold"
                    >
                      <option>mg</option>
                      <option>pills</option>
                      <option>ml</option>
                      <option>mcg</option>
                    </select>
                    <select
                      value={dose.frequency}
                      onChange={(e) => setDose({ ...dose, frequency: parseInt(e.target.value, 10) })}
                      className="mrx-input font-bold"
                    >
                      <option value="1">{t('meds.freq1')}</option>
                      <option value="2">{t('meds.freq2')}</option>
                      <option value="3">{t('meds.freq3')}</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={dose.notes}
                    onChange={(e) => setDose({ ...dose, notes: e.target.value })}
                    placeholder={t('meds.notesPlaceholder')}
                    className="mrx-input text-sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <PreviewPanel />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-mrx-line dark:border-mrx-line-dark">
              <button
                type="button"
                onClick={handleSave}
                disabled={!searchTerm.trim() || isSaving}
                className="flex-1 bg-clinical-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-clinical-700 disabled:opacity-30"
              >
                {isSaving ? t('common.saving') : t('meds.save')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-5 rounded-2xl bg-mrx-inset dark:bg-mrx-inset-dark text-slate-500 font-semibold"
              >
                {t('meds.cancel')}
              </button>
            </div>
          </PageCard>
        </div>
      ) : medications.length === 0 ? (
        <div className="space-y-5">
          <PageGuide
            icon="💊"
            title={t('page.meds.guideTitle')}
            text={t('page.meds.guideText')}
            steps={[t('page.meds.guideStep1'), t('page.meds.guideStep2'), t('page.meds.guideStep3')]}
            accent="#8b5cf6"
          />
          <PageCard padding="lg" className="text-center space-y-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-clinical-500/10 items-center justify-center text-3xl">💊</div>
          <div className="space-y-2 max-w-md mx-auto">
            <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">{t('meds.emptyTitle')}</p>
            <p className="text-sm text-slate-500">{t('meds.methodsHint')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-lg opacity-80">
            <span title={t('meds.inputType')}>⌨️</span>
            <span title={t('meds.inputPhoto')}>📷</span>
            <span title={t('meds.inputPaste')}>📋</span>
            <span title={t('meds.inputVoice')}>🎤</span>
          </div>
          <button type="button" onClick={() => setIsAdding(true)} className="mrx-btn-primary px-10 py-4 text-base">
            {t('meds.addBtn')} →
          </button>
          </PageCard>
        </div>
      ) : (
        <div className="space-y-5">
          <PageGuide
            icon="💊"
            title={t('page.meds.guideTitle')}
            text={t('page.meds.guideText')}
            steps={[t('page.meds.guideStep1'), t('page.meds.guideStep2'), t('page.meds.guideStep3')]}
            accent="#8b5cf6"
          />

          <PageSummaryRow
            items={[
              { label: t('page.meds.chip1'), value: medications.length, color: '#8b5cf6', icon: '💊' },
              { label: t('page.meds.chip3'), value: medications.filter((m) => m.status === 'ACTIVE').length, color: '#10b981', icon: '✓' },
              { label: t('meds.methodsTitle'), value: '5', hint: '⌨️ 📷 📋 🎤 📊', color: '#2563eb', icon: '➕' },
              { label: t('home.dashboard.interactions'), value: '—', hint: t('page.meds.guideStep3'), color: '#f59e0b', icon: '🔍' }
            ]}
          />

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('meds.methodsTitle')}</p>
            <div className="flex flex-wrap gap-2">
              {INPUT_MODES.map(({ id, icon, key }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setIsAdding(true);
                    setInputMode(id);
                    if (id === 'photo') setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-mrx-line dark:border-mrx-line-dark bg-white dark:bg-mrx-panel-dark hover:border-clinical-500 hover:bg-clinical-500/5 transition-colors"
                >
                  <span>{icon}</span>
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-clinical-600 text-white flex items-center justify-center text-lg font-black shadow-mrx-sm">
                {medications.length}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('meds.count').replace('{count}', String(medications.length))}
                </p>
                <p className="text-xs text-slate-400">{t('meds.activeLabel')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mrx-btn-primary px-6 py-3 text-sm"
            >
              + {t('meds.addBtn')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {medications.map((med, idx) => {
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              const freq = med.current_dose.frequency_per_day;
              return (
                <div
                  key={med.id}
                  className="relative overflow-hidden rounded-2xl border border-mrx-line dark:border-mrx-line-dark bg-white dark:bg-mrx-panel-dark shadow-mrx-sm hover:shadow-mrx-md transition-all"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }} />
                  <div className="p-6 pl-7 flex gap-4">
                    <div
                      className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      💊
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{med.display_name}</h4>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5">
                        {med.current_dose.amount} {med.current_dose.unit}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{med.current_dose.schedule_notes}</p>
                      <div className="flex gap-1 mt-3">
                        {scheduleDots(freq).map((i) => (
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMed(med)}
                      className="shrink-0 w-9 h-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                      title={t('meds.remove')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-[140px] p-6 border-2 border-dashed border-mrx-line dark:border-mrx-line-dark rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-clinical-500 hover:bg-clinical-500/5 transition-all group"
            >
              <span className="text-3xl text-slate-300 group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold text-sm text-slate-400 group-hover:text-clinical-600">{t('meds.addAnother')}</span>
              <span className="text-[10px] text-slate-400">⌨️ 📷 📋 🎤</span>
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default MedicationList;
