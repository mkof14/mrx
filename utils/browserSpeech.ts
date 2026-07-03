/** Browser speechSynthesis fallback when server TTS is unavailable. */
export function speakWithBrowser(text: string, lang: string, rate = 0.95): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window) || !text.trim()) {
      reject(new Error('Browser speech not available'));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = Math.min(2, Math.max(0.5, rate));
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('Browser speech failed'));
    window.speechSynthesis.speak(utterance);
  });
}
