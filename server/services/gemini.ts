import { GoogleGenAI, Type, Modality } from '@google/genai';
import { extractRxcuis } from './rxnorm.js';
import { fetchVerifiedInteractions, mergeInteractionFindings } from './drugInteractions.js';
import { sanitizeTextForSpeech } from '../lib/ttsText.js';
import { formatClinicalProfileSummary } from '../lib/clinicalContext.js';
import { normalizeChatHistory } from '../lib/chatHistory.js';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }
  return new GoogleGenAI({ apiKey });
}

const MODELS = {
  pro: process.env.GEMINI_MODEL_PRO || 'gemini-2.5-pro',
  flash: process.env.GEMINI_MODEL_FLASH || 'gemini-2.5-flash',
  /** Voice/chat assistant — Flash has much better free-tier quota than Pro. */
  assistant: process.env.GEMINI_MODEL_ASSISTANT || process.env.GEMINI_MODEL_FLASH || 'gemini-2.5-flash',
  tts: process.env.GEMINI_MODEL_TTS || 'gemini-2.5-flash-preview-tts'
};

const VIEWPOINT_INSTRUCTIONS: Record<string, string> = {
  CONSERVATIVE:
    'Use a conservative clinical lens. Flag even minor or theoretical interactions. Prefer caution over reassurance. Highlight allergy risks prominently.',
  BALANCED:
    'Use balanced clinical judgment. Report established interactions and meaningful symptom correlations without over-alarming.',
  EXPLORATORY:
    'Use an exploratory lens. Note subtle temporal patterns and hypotheses worth discussing with a clinician, while clearly labeling uncertainty.'
};

export async function analyzeMedicationData(
  medications: unknown[],
  medicationEvents: unknown[],
  checkins: unknown[],
  userProfile: Record<string, unknown>,
  viewpoint = 'BALANCED'
) {
  const ai = getClient();
  const model = MODELS.pro;

  const rxcuis = extractRxcuis(medications);
  const verifiedInteractions = await fetchVerifiedInteractions(rxcuis);
  const verifiedBlock =
    verifiedInteractions.length > 0
      ? `\nVERIFIED RxNav INTERACTIONS (authoritative baseline — incorporate and do not contradict):\n${JSON.stringify(verifiedInteractions)}`
      : '';

  const systemInstruction = `
    You are the BioMath Core MRX engine. Perform a professional clinical analysis.
    
    ANALYSIS VIEWPOINT: ${viewpoint}
    ${VIEWPOINT_INSTRUCTIONS[viewpoint] || VIEWPOINT_INSTRUCTIONS.BALANCED}
    
    PATIENT CONTEXT:
    ${formatClinicalProfileSummary(userProfile)}
    ${verifiedBlock}

    REASONING PROTOCOL:
    1. Check every medication ingredient against ALLERGIES and past ADVERSE DRUG REACTIONS.
    2. Cross-check supplements/OTC for interaction and duplication risks.
    3. Adjust for kidney/liver function, pregnancy/breastfeeding, anticoagulant use, smoking/alcohol.
    4. Analyze symptom correlations before/after med events.
    5. Identify CYP450 / pharmacogenomics implications when notes are present.
    6. Flag high-risk stability deviations.
    7. When RxNav verified interactions are provided, include them in interaction_findings.
    
    OUTPUT: Strict JSON for clinical reports.
    DISCLAIMER: This is observational data only, not medical advice.
  `;

  const prompt = `Perform pharmacological analysis on the following dataset: ${JSON.stringify({ medications, medicationEvents, checkins: checkins.slice(0, 10) })}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executive_summary: {
            type: Type.OBJECT,
            properties: {
              summary_plain: { type: Type.STRING },
              smart_advice: { type: Type.ARRAY, items: { type: Type.STRING } },
              doctor_discussion_points: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          interaction_findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ingredient_a: { type: Type.STRING },
                ingredient_b: { type: Type.STRING },
                severity_color: { type: Type.STRING },
                summary_plain: { type: Type.STRING },
                mechanism: { type: Type.STRING },
                watch_for: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          safety_flags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                flag_type: { type: Type.STRING },
                risk_color: { type: Type.STRING },
                trigger_plain: { type: Type.STRING },
                user_action_plain: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  parsed.interaction_findings = mergeInteractionFindings(
    verifiedInteractions,
    parsed.interaction_findings || []
  );
  parsed.verified_interaction_count = verifiedInteractions.length;
  parsed.viewpoint = viewpoint;
  return parsed;
}

export async function scanMedicationImage(base64: string, mimeType = 'image/jpeg') {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODELS.flash,
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        {
          text:
            'Read this medication package, prescription page, or pharmacy label. Return JSON with name (drug name), strength (dose amount as string), unit (mg, ml, pills, etc.), frequency (times per day as number), notes (schedule instructions if visible).'
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          strength: { type: Type.STRING },
          unit: { type: Type.STRING },
          frequency: { type: Type.NUMBER },
          notes: { type: Type.STRING }
        },
        required: ['name']
      }
    }
  });
  return JSON.parse(response.text || 'null');
}

export async function parseMedicationText(text: string, locale = 'en') {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODELS.flash,
    contents: {
      parts: [
        {
          text: `Extract ONE medication from this text (prescription, list, doctor note, or spoken dictation). User locale: ${locale}. Return JSON with name, strength, unit (mg/ml/pills), frequency (times per day as number), notes (schedule if any). Text:\n${text}`
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          strength: { type: Type.STRING },
          unit: { type: Type.STRING },
          frequency: { type: Type.NUMBER },
          notes: { type: Type.STRING }
        },
        required: ['name']
      }
    }
  });
  return JSON.parse(response.text || 'null');
}

export async function getAssistantResponseStream(
  query: string,
  context: {
    medications: unknown[];
    logs: unknown[];
    profile: Record<string, unknown>;
    analysisResult?: Record<string, unknown> | null;
    locale?: string;
    capabilities?: boolean;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
) {
  const ai = getClient();
  const locale = context.locale || 'en';
  const profile = context.profile;
  const analysis = context.analysisResult;
  const exec = analysis?.executive_summary as
    | { summary_plain?: string; smart_advice?: string[]; doctor_discussion_points?: string[] }
    | undefined;

  const analysisBlock = analysis
    ? `
    LATEST AI ANALYSIS:
    Summary: ${exec?.summary_plain || 'N/A'}
    Smart advice: ${JSON.stringify(exec?.smart_advice || [])}
    Doctor discussion points: ${JSON.stringify(exec?.doctor_discussion_points || [])}
    Interactions: ${JSON.stringify(analysis.interaction_findings || [])}
    Safety flags: ${JSON.stringify(analysis.safety_flags || [])}
    `
    : '';

  const appGuide = context.capabilities
    ? `MRX sections: Overview, My Pills, How I Feel, Trends, Interactions, Reports, Ask MRX, Safety, Bio Profile, Settings.`
    : '';

  const systemInstruction = `
    You are MRX Voice — a warm, human health companion (not a cold robot).
    RESPOND IN LANGUAGE CODE: ${locale}.

    ${formatClinicalProfileSummary(profile)}

    MEDS: ${JSON.stringify(context.medications)}
    RECENT SYMPTOMS: ${JSON.stringify((context.logs || []).slice(0, 8))}
    ${analysisBlock}
    ${appGuide}

    You remember prior chat turns. Refer back naturally when helpful.

    STYLE: Empathetic clinician-friend. Short sentences for voice. Personalized advice from THEIR data.
    Use smart_advice when available. Never diagnose. Encourage doctor contact for red flags.
  `;

  const prior = normalizeChatHistory(context.history || [])
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.content }]
    }));

  const contents = [...prior, { role: 'user' as const, parts: [{ text: query }] }];

  const runStream = (model: string) =>
    ai.models.generateContentStream({
      model,
      contents,
      config: { systemInstruction }
    });

  try {
    return await runStream(MODELS.assistant);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const quotaHit =
      msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.toLowerCase().includes('quota');
    if (quotaHit && MODELS.assistant !== MODELS.flash) {
      return runStream(MODELS.flash);
    }
    throw err;
  }
}

export async function generateSpeech(text: string, voice = 'Zephyr') {
  const ai = getClient();
  const spokenText = sanitizeTextForSpeech(text);
  const response = await ai.models.generateContent({
      model: MODELS.tts,
    contents: [{ parts: [{ text: spokenText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice }
        }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
}

export async function runDiagnosticPing() {
  const ai = getClient();
  const start = Date.now();
  const response = await ai.models.generateContent({
    model: MODELS.flash,
    contents: 'Perform a system heartbeat check. Return "HEALTH_OK" and current timestamp.'
  });
  const text = response.text || '';
  if (!text.includes('HEALTH_OK')) {
    throw new Error('Unexpected diagnostic response');
  }
  return Date.now() - start;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}
