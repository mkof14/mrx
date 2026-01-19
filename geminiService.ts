
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Viewpoint, UserProfile } from './types';

const MRX_VISUAL_STYLE = "Clinical high-tech biological art, futuristic medical interface, microscopic cellular detail, sleek professional laboratory aesthetic, 8k resolution, clean minimal healthcare design, soft blue and emerald lighting.";

/**
 * BioMath Core — MRX Analysis Engine
 */
export async function analyzeMedicationData(
  medications: any[], 
  medicationEvents: any[],
  checkins: any[], 
  viewpoint: Viewpoint,
  userProfile: UserProfile
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview'; 
  
  const systemInstruction = `
    You are the BioMath Core MRX engine. Perform a professional clinical analysis.
    
    PATIENT CONTEXT:
    Name: ${userProfile.name} | Age: ${userProfile.age_years} | Sex: ${userProfile.sex_at_birth}
    Allergies: ${userProfile.known_allergies.join(', ') || 'None reported'}
    Conditions: ${userProfile.preexisting_conditions.join(', ') || 'None reported'}

    REASONING PROTOCOL:
    1. Check every medication ingredient against the patient's ALLERGY list.
    2. Analyze symptom correlations before/after med events.
    3. Identify potential metabolic interactions (CYP450 etc).
    4. Flag high-risk stability deviations.
    
    OUTPUT: Strict JSON for clinical reports.
  `;

  const prompt = `Perform pharmacological analysis on the following dataset: ${JSON.stringify({ medications, medicationEvents, checkins: checkins.slice(0, 10) })}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 },
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

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis Engine Failure:", error);
    return null;
  }
}

/**
 * Vision-based Medication Scanner
 */
export async function scanMedicationImage(base64: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType: 'image/png' } },
          { text: "Identify this medication label. Return JSON with 'name', 'strength', 'unit', and 'frequency' (per day)." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            strength: { type: Type.STRING },
            unit: { type: Type.STRING },
            frequency: { type: Type.NUMBER }
          },
          required: ["name"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) { return null; }
}

/**
 * Health Assistant with Google Search Grounding
 */
export async function getAssistantResponseStream(query: string, context: { medications: any[], logs: any[], profile: UserProfile }) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are the MRX Neural Companion. You have access to the user's clinical profile:
    Meds: ${JSON.stringify(context.medications)}
    Allergies: ${context.profile.known_allergies.join(', ')}
    
    GUIDELINE:
    - Use Google Search for the latest pharmacological data.
    - If suggesting an OTC med or supplement, check the user's ALLERGY list first.
    - Always cite sources when using Google Search data.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: query,
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });
    return responseStream;
  } catch (error) {
    console.error("Stream Failure:", error);
    throw error;
  }
}

/**
 * Text-to-Speech (TTS) Generation
 */
export async function generateSpeech(text: string, voice: string = 'Zephyr') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Clinical Report: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });
    // Correctly accessing text property from candidates
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Generation Failure:", error);
    return null;
  }
}

/**
 * High-Resolution Bio-Art Generator
 */
export async function generateHealthImage(prompt: string, size: "1K"|"2K"|"4K" = "1K", aspectRatio: string = "1:1") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-image-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `${MRX_VISUAL_STYLE} Concept: ${prompt}` }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: size }
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { throw error; }
}

/**
 * Image Editing for Health Concepts
 */
export async function editHealthImage(base64: string, prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType: 'image/png' } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { throw error; }
}

/**
 * Live Audio Session
 */
export function connectLiveSession(callbacks: any, userProfile: UserProfile) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: userProfile.preferred_voice || 'Zephyr' },
        },
      },
      systemInstruction: "You are Dr. BioMath. Provide calm, clinical consultation based on biological data. Be concise.",
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    }
  });
}
