/** Prepare assistant text for natural speech (ElevenLabs / TTS). */
export function sanitizeTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'ссылка')
    .replace(/[•·▪►→]/g, '. ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Shorter spoken version for long replies — first ~2 sentences + tail cue. */
export function summarizeForVoice(text: string, maxChars = 520): string {
  const clean = sanitizeTextForSpeech(text);
  if (clean.length <= maxChars) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxChars) break;
    out += s;
  }
  if (out.length < 80) return clean.slice(0, maxChars);
  return out.trim();
}
