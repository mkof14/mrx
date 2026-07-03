const TOKEN_KEY = 'mrx_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
  ts?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Cannot reach MRX server. Run npm run dev from the project root.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  auth: {
    register: (email: string, password: string, name?: string) =>
      api.post<{ token: string; user: { id: string; email: string }; profile: unknown }>(
        '/auth/register',
        { email, password, name }
      ),
    login: (email: string, password: string) =>
      api.post<{ token: string; user: { id: string; email: string }; profile: unknown }>(
        '/auth/login',
        { email, password }
      ),
    googleStatus: () => api.get<{ configured: boolean }>('/auth/google/status'),
    google: (credential: string) =>
      api.post<{ token: string; user: { id: string; email: string }; profile: unknown }>(
        '/auth/google',
        { credential }
      ),
    me: () => api.get<{ user: { id: string; email: string }; profile: unknown }>('/auth/me')
  },

  data: {
    bootstrap: () =>
      api.get<{
        profile: unknown;
        medications: unknown[];
        medicationEvents: unknown[];
        checkins: unknown[];
        analysisResult: unknown;
        chatMessages: ChatMessagePayload[];
        isAdmin?: boolean;
      }>('/data/bootstrap'),
    saveProfile: (profile: unknown) => api.put('/data/profile', profile),
    saveMedications: (medications: unknown[]) => api.put('/data/medications', medications),
    saveMedicationEvents: (events: unknown[]) => api.put('/data/medication-events', events),
    saveCheckins: (checkins: unknown[]) => api.put('/data/checkins', checkins),
    saveAnalysis: (analysis: unknown) => api.put('/data/analysis', analysis),
    saveChatMessages: (messages: ChatMessagePayload[]) => api.put('/data/chat-messages', { messages }),
    sync: (payload: {
      profile: unknown;
      medications: unknown[];
      medicationEvents: unknown[];
      checkins: unknown[];
    }) => api.put('/data/sync', payload),
    exportAll: () => api.get('/data/export'),
    deleteAccount: () => api.delete('/data/account')
  },

    ai: {
    status: () =>
      api.get<{
        configured: boolean;
        gemini: { configured: boolean; message: string };
        tts: { configured: boolean; provider: string | null; elevenlabs: boolean; message: string };
      }>('/ai/status'),
    analyze: (payload: {
      medications: unknown[];
      medicationEvents: unknown[];
      checkins: unknown[];
      viewpoint?: string;
    }) => api.post('/ai/analyze', payload),
    scan: (base64: string, mimeType?: string) => api.post('/ai/scan', { base64, mimeType }),
    parseMedication: (text: string, locale?: string) =>
      api.post<{ name?: string; strength?: string; unit?: string; frequency?: number; notes?: string }>(
        '/ai/parse-medication',
        { text, locale }
      ),
    tts: (text: string, voice?: string) =>
      api.post<{
        audio: string | null;
        format: 'mp3' | 'pcm';
        sampleRate?: number;
        provider: 'elevenlabs' | 'gemini';
        voice: string;
      }>('/ai/tts', { text, voice }),
    voices: () => api.get<{ provider: string | null; voices: string[] }>('/ai/voices'),
    diagnostic: () => api.post<{ configured: boolean; status: string; latency?: number; error?: string }>('/ai/diagnostic')
  },

  medications: {
    resolve: (name: string) =>
      api.post<{
        display_name: string;
        active_ingredients: string[];
        rxcui: string | null;
        route: string;
        source: string;
      }>('/medications/resolve', { name }),
    resolveBarcode: (code: string) =>
      api.post<{
        display_name: string;
        active_ingredients: string[];
        rxcui: string | null;
        route: string;
        source: string;
      }>('/medications/resolve-barcode', { code }),
    interactions: (medications: unknown[]) =>
      api.post<{ interactions: unknown[]; rxcui_count: number }>('/medications/interactions', { medications })
  },

  share: {
    createReport: (reportData: unknown, patientName?: string) =>
      api.post<{ token: string; url: string; expires_at: string; expires_days: number }>('/share/report', {
        reportData,
        patientName
      }),
    createCaregiver: (label: string) =>
      api.post<{ token: string; url: string; expires_at: string; label: string }>('/share/caregiver', { label })
  },

  billing: {
    status: () => api.get<{ configured: boolean; publishableKey: string | null }>('/billing/status'),
    checkout: () => api.post<{ url?: string; mock?: boolean; message?: string }>('/billing/checkout'),
    confirmMock: () => api.post<{ ok: boolean; profile: unknown }>('/billing/confirm-mock')
  },

  admin: {
    overview: () =>
      api.get<{
        userCount: number;
        totalMeds: number;
        totalCheckins: number;
        subscribedCount: number;
        users: Array<{
          id: string;
          email: string;
          created_at: string;
          medCount: number;
          checkinCount: number;
          isSubscribed: boolean;
        }>;
      }>('/admin/overview'),
    integrations: () => api.get<Record<string, unknown>>('/admin/integrations'),
    whoami: () => api.get<{ isAdmin: boolean; email: string }>('/admin/whoami')
  }
};

export async function streamAssistant(
  query: string,
  context: {
    locale?: string;
    capabilities?: boolean;
    history?: ChatMessagePayload[];
  },
  onChunk: (data: { text: string; groundingMetadata?: unknown }) => void
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED');
  }

  const payload = {
    query,
    context: {
      locale: context.locale,
      capabilities: context.capabilities ?? true
    },
    history: (context.history || []).map(({ role, content }) => ({ role, content }))
  };

  let res: Response;
  try {
    res = await fetch('/api/ai/assistant/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new ApiError(0, 'Cannot reach MRX server. Run npm run dev from the project root.', 'NETWORK');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || 'Stream failed', body.code);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new ApiError(502, 'No response stream', 'EMPTY_STREAM');

  const decoder = new TextDecoder();
  let buffer = '';
  let gotText = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') {
        if (!gotText) throw new ApiError(502, 'Empty AI response', 'EMPTY_RESPONSE');
        return;
      }
      try {
        const parsed = JSON.parse(data) as { text?: string };
        if (parsed.text) {
          gotText = true;
          onChunk({ text: parsed.text });
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  if (!gotText) throw new ApiError(502, 'Empty AI response', 'EMPTY_RESPONSE');
}
