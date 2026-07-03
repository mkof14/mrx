export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const ERROR_SNIPPETS = [
  'connection interrupted',
  'соединение прервано',
  'conexión interrumpida',
  'verbindung unterbrochen',
  'connexion interrompue',
  '连接中断',
  'neural sync interrupted',
  'stream failed',
  'assistant stream failed'
];

export function isChatErrorPlaceholder(content: string): boolean {
  const lower = content.trim().toLowerCase();
  return ERROR_SNIPPETS.some((s) => lower.includes(s));
}

/** Keep only valid turns for Gemini multi-turn chat. */
export function normalizeChatHistory(raw: unknown, maxTurns = 14): ChatTurn[] {
  if (!Array.isArray(raw)) return [];

  const turns: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const role = row.role === 'user' ? 'user' : row.role === 'assistant' ? 'assistant' : null;
    const content = typeof row.content === 'string' ? row.content.trim() : '';
    if (!role || !content || isChatErrorPlaceholder(content)) continue;
    turns.push({ role, content });
  }

  const merged: ChatTurn[] = [];
  for (const turn of turns) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === turn.role) {
      prev.content = turn.content;
      continue;
    }
    merged.push({ ...turn });
  }

  if (merged.length > 0 && merged[0].role === 'user') {
    merged.unshift({
      role: 'assistant',
      content: 'Hello! I am MRX Voice, your medication safety companion.'
    });
  }

  return merged.slice(-maxTurns);
}
