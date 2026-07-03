
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export interface TtsPlaybackPayload {
  audio: string | null;
  format?: 'mp3' | 'pcm';
  sampleRate?: number;
}

/** Reliable MP3 playback via HTMLAudioElement (works after user gesture). */
function playMp3Base64(base64: string, speechSpeed = 1): Promise<void> {
  const bytes = decodeBase64(base64);
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.playbackRate = Math.min(2, Math.max(0.5, speechSpeed));

  return new Promise((resolve, reject) => {
    const cleanup = () => URL.revokeObjectURL(url);
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('MP3 playback failed'));
    };
    void audio.play().catch((err) => {
      cleanup();
      reject(err);
    });
  });
}

export async function playTtsAudio(
  payload: TtsPlaybackPayload,
  speechSpeed = 1,
  existingCtx?: AudioContext | null
): Promise<AudioContext | null> {
  if (!payload.audio) {
    throw new Error('No audio data');
  }

  if (payload.format === 'mp3') {
    await playMp3Base64(payload.audio, speechSpeed);
    return existingCtx || null;
  }

  const audioCtx = existingCtx || new AudioContext();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const bytes = decodeBase64(payload.audio);
  const buffer = await decodeAudioData(bytes, audioCtx, payload.sampleRate || 24000, 1);

  await new Promise<void>((resolve, reject) => {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.min(2, Math.max(0.5, speechSpeed));
    source.connect(audioCtx.destination);
    source.onended = () => resolve();
    try {
      source.start(0);
    } catch (err) {
      reject(err);
    }
  });

  return audioCtx;
}
