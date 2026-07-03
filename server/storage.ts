import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DbSchema } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DB_REDIS_KEY = 'mrx:database';

function resolveDbPaths(): { dataDir: string; dbFile: string } {
  if (process.env.DATABASE_PATH) {
    return {
      dataDir: path.dirname(process.env.DATABASE_PATH),
      dbFile: process.env.DATABASE_PATH
    };
  }
  // Vercel serverless filesystem is read-only except /tmp
  if (process.env.VERCEL) {
    return { dataDir: '/tmp', dbFile: '/tmp/mrx.json' };
  }
  const dataDir = path.join(__dirname, '..', 'data');
  return { dataDir, dbFile: path.join(dataDir, 'mrx.json') };
}

const { dataDir, dbFile } = resolveDbPaths();

function redisEnv(): { url?: string; token?: string } {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  };
}

export function isRedisConfigured(): boolean {
  const { url, token } = redisEnv();
  return Boolean(url && token);
}

export function getStorageMode(): 'redis' | 'file' {
  return isRedisConfigured() ? 'redis' : 'file';
}

export function getDatabasePathLabel(): string {
  if (isRedisConfigured()) return 'Upstash Redis (persistent)';
  return dbFile;
}

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function ensureStorageReady() {
  if (isRedisConfigured()) return;
  ensureDir();
}

export function normalizeDb(raw: DbSchema): DbSchema {
  if (!raw.share_links) raw.share_links = {};
  if (!raw.caregiver_invites) raw.caregiver_invites = {};
  if (!raw.chat_messages) raw.chat_messages = {};
  return raw;
}

export async function loadDatabase(createEmpty: () => DbSchema): Promise<DbSchema> {
  if (isRedisConfigured()) {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    const data = await redis.get<DbSchema>(DB_REDIS_KEY);
    if (data && typeof data === 'object') {
      return normalizeDb(data);
    }
    const fresh = createEmpty();
    await redis.set(DB_REDIS_KEY, fresh);
    return fresh;
  }

  ensureDir();
  if (!fs.existsSync(dbFile)) {
    const fresh = createEmpty();
    fs.writeFileSync(dbFile, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  return normalizeDb(JSON.parse(fs.readFileSync(dbFile, 'utf-8')) as DbSchema);
}

export async function saveDatabase(data: DbSchema): Promise<void> {
  if (isRedisConfigured()) {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    await redis.set(DB_REDIS_KEY, data);
    return;
  }

  ensureDir();
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}
