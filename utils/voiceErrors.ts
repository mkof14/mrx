import { ApiError } from '../services/apiClient';

export interface VoiceErrorMessages {
  default: string;
  quota?: string;
  network?: string;
  config?: string;
}

export function resolveVoiceError(err: unknown, messages: VoiceErrorMessages): string {
  if (err instanceof ApiError) {
    if (err.code === 'QUOTA_EXCEEDED' || err.status === 429) {
      return messages.quota || messages.default;
    }
    if (
      err.code === 'NOT_CONFIGURED' ||
      err.code === 'AUTH_FAILED' ||
      err.code === 'AUTH_REQUIRED' ||
      err.status === 503
    ) {
      return messages.config || messages.default;
    }
    if (err.code === 'NETWORK' || err.status === 0) {
      return messages.network || messages.default;
    }
    if (err.code === 'EMPTY_RESPONSE' || err.code === 'EMPTY_STREAM') {
      return messages.network || messages.default;
    }
    if (err.status === 401) {
      return messages.config || messages.default;
    }
    if (err.message && err.message !== 'Stream failed') {
      return err.message;
    }
  }
  return messages.default;
}
