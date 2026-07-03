import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const auditDir = path.join(__dirname, '..', 'data', 'audit');

export interface AuditEntry {
  ts: string;
  kind: 'assistant' | 'analyze' | 'scan' | 'tts';
  promptPreview?: string;
  responsePreview?: string;
}

function ensureAuditDir() {
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });
}

export function appendAiAudit(userId: string, entry: AuditEntry) {
  ensureAuditDir();
  const file = path.join(auditDir, `${userId}.jsonl`);
  fs.appendFileSync(file, JSON.stringify(entry) + '\n');
}

export function readAiAudit(userId: string, limit = 30): AuditEntry[] {
  ensureAuditDir();
  const file = path.join(auditDir, `${userId}.jsonl`);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l));
}
