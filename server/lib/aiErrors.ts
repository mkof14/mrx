/** Map Gemini / network failures to HTTP responses for the client. */
export function normalizeAiError(err: unknown): { status: number; message: string; code: string } {
  const text = err instanceof Error ? err.message : String(err ?? '');
  const lower = text.toLowerCase();

  if (
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return {
      status: 429,
      code: 'QUOTA_EXCEEDED',
      message: 'AI request limit reached. Wait a minute and try again, or upgrade your Gemini API plan.'
    };
  }

  if (lower.includes('gemini_api_key') || lower.includes('not configured')) {
    return { status: 503, code: 'NOT_CONFIGURED', message: 'AI service is not configured on the server.' };
  }

  if (lower.includes('401') || lower.includes('403') || lower.includes('api key')) {
    return { status: 503, code: 'AUTH_FAILED', message: 'Invalid or expired Gemini API key.' };
  }

  return { status: 500, code: 'STREAM_FAILED', message: 'Assistant stream failed' };
}
