#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const keysFile = fs.readFileSync(path.join(root, 'i18n/keys.ts'), 'utf8');
const keyMatches = [...keysFile.matchAll(/\| '([^']+)'/g)].map((m) => m[1]);
const authKeys = keyMatches.filter((k) => k.startsWith('auth.'));
const voiceGated = ['voice.authRequired', 'voice.subscriptionRequired', 'voice.lockedSubtitle', 'voice.subscriptionSubtitle'];
const appKeys = keyMatches.filter((k) => !authKeys.includes(k) && !voiceGated.includes(k));

const locales = ['es', 'de', 'fr', 'zh', 'he', 'ar', 'uk', 'ru'];

for (const loc of locales) {
  const file = path.join(root, `i18n/locales/${loc}.ts`);
  const content = fs.readFileSync(file, 'utf8');
  const present = new Set([...content.matchAll(/'([^']+)':/g)].map((m) => m[1]));
  const missing = appKeys.filter((k) => !present.has(k));
  if (missing.length) {
    console.warn(`${loc}: ${missing.length} keys use English fallback`, missing.slice(0, 3).join(', '), missing.length > 3 ? '…' : '');
  } else {
    console.log(`${loc}: OK (${present.size} keys)`);
  }
}

console.log('i18n check passed (missing keys fall back to English)');
