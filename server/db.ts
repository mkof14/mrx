import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(__dirname, '..', 'data');
const dbFile = process.env.DATABASE_PATH || path.join(dataDir, 'mrx.json');

export interface DbSchema {
  users: Array<{
    id: string;
    email: string;
    password_hash: string;
    google_id?: string;
    created_at: string;
  }>;
  profiles: Record<string, string>;
  medications: Record<string, string[]>;
  medication_events: Record<string, string[]>;
  checkins: Record<string, string[]>;
  analyses: Record<string, string>;
  chat_messages: Record<string, string[]>;
  share_links?: Record<string, string>;
  caregiver_invites?: Record<string, string>;
}

const emptyDb = (): DbSchema => ({
  users: [],
  profiles: {},
  medications: {},
  medication_events: {},
  checkins: {},
  analyses: {},
  chat_messages: {},
  share_links: {},
  caregiver_invites: {}
});

let writeQueue: Promise<void> = Promise.resolve();

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readDb(): DbSchema {
  ensureDir();
  if (!fs.existsSync(dbFile)) {
    const db = emptyDb();
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    return db;
  }
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8')) as DbSchema;
  if (!db.share_links) db.share_links = {};
  if (!db.caregiver_invites) db.caregiver_invites = {};
  if (!db.chat_messages) db.chat_messages = {};
  return db;
}

function writeDb(db: DbSchema) {
  ensureDir();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function mutateDb<T>(fn: (db: DbSchema) => T): Promise<T> {
  const task = writeQueue.then(() => {
    const data = readDb();
    const result = fn(data);
    writeDb(data);
    return result;
  });
  writeQueue = task.then(() => undefined).catch(() => undefined);
  return task;
}

export function initDatabase() {
  readDb();
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export const db = {
  findUserByEmail(email: string) {
    return readDb().users.find((u) => u.email === email);
  },

  findUserByGoogleId(googleId: string) {
    return readDb().users.find((u) => u.google_id === googleId);
  },

  async createUser(id: string, email: string, passwordHash: string, googleId?: string) {
    return mutateDb((data) => {
      data.users.push({
        id,
        email,
        password_hash: passwordHash,
        google_id: googleId,
        created_at: new Date().toISOString()
      });
      data.medications[id] = [];
      data.medication_events[id] = [];
      data.checkins[id] = [];
      data.chat_messages[id] = [];
    });
  },

  getProfile(userId: string) {
    const data = readDb();
    if (!data.profiles[userId]) return null;
    try {
      return JSON.parse(data.profiles[userId]);
    } catch {
      return null;
    }
  },

  async saveProfile(userId: string, profile: unknown) {
    return mutateDb((data) => {
      data.profiles[userId] = JSON.stringify(profile);
    });
  },

  getMedications(userId: string) {
    const data = readDb();
    return (data.medications[userId] || []).map((r) => JSON.parse(r));
  },

  async saveMedications(userId: string, medications: unknown[]) {
    return mutateDb((data) => {
      data.medications[userId] = medications.map((m) => JSON.stringify(m));
    });
  },

  getMedicationEvents(userId: string) {
    const data = readDb();
    return (data.medication_events[userId] || []).map((r) => JSON.parse(r));
  },

  async saveMedicationEvents(userId: string, events: unknown[]) {
    return mutateDb((data) => {
      data.medication_events[userId] = events.map((e) => JSON.stringify(e));
    });
  },

  getCheckins(userId: string) {
    const data = readDb();
    return (data.checkins[userId] || []).map((r) => JSON.parse(r));
  },

  async saveCheckins(userId: string, checkins: unknown[]) {
    return mutateDb((data) => {
      data.checkins[userId] = checkins.map((c) => JSON.stringify(c));
    });
  },

  getLatestAnalysis(userId: string) {
    const data = readDb();
    return data.analyses[userId] ? JSON.parse(data.analyses[userId]) : null;
  },

  async saveAnalysis(userId: string, analysis: unknown) {
    return mutateDb((data) => {
      data.analyses[userId] = JSON.stringify(analysis);
    });
  },

  getChatMessages(userId: string) {
    const data = readDb();
    if (!data.chat_messages) data.chat_messages = {};
    return (data.chat_messages[userId] || []).map((r) => JSON.parse(r));
  },

  async saveChatMessages(userId: string, messages: unknown[]) {
    return mutateDb((data) => {
      if (!data.chat_messages) data.chat_messages = {};
      const capped = messages.slice(-80);
      data.chat_messages[userId] = capped.map((m) => JSON.stringify(m));
    });
  },

  async syncAll(
    userId: string,
    payload: {
      profile: unknown;
      medications: unknown[];
      medicationEvents: unknown[];
      checkins: unknown[];
    }
  ) {
    return mutateDb((data) => {
      data.profiles[userId] = JSON.stringify(payload.profile);
      data.medications[userId] = payload.medications.map((m) => JSON.stringify(m));
      data.medication_events[userId] = payload.medicationEvents.map((e) => JSON.stringify(e));
      data.checkins[userId] = payload.checkins.map((c) => JSON.stringify(c));
    });
  },

  async linkGoogleAccount(userId: string, googleId: string) {
    return mutateDb((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (user) user.google_id = googleId;
    });
  },

  async deleteUser(userId: string) {
    return mutateDb((data) => {
      data.users = data.users.filter((u) => u.id !== userId);
      delete data.profiles[userId];
      delete data.medications[userId];
      delete data.medication_events[userId];
      delete data.checkins[userId];
      delete data.analyses[userId];
      if (data.chat_messages) delete data.chat_messages[userId];
      if (data.share_links) {
        for (const [tok, raw] of Object.entries(data.share_links)) {
          try {
            if (JSON.parse(raw).userId === userId) delete data.share_links[tok];
          } catch {
            /* ignore */
          }
        }
      }
      if (data.caregiver_invites) {
        for (const [tok, raw] of Object.entries(data.caregiver_invites)) {
          try {
            if (JSON.parse(raw).userId === userId) delete data.caregiver_invites[tok];
          } catch {
            /* ignore */
          }
        }
      }
    });
  },

  async createShareLink(token: string, payload: unknown) {
    return mutateDb((data) => {
      if (!data.share_links) data.share_links = {};
      data.share_links[token] = JSON.stringify(payload);
    });
  },

  getShareLink(token: string) {
    const data = readDb();
    const raw = data.share_links?.[token];
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        userId: string;
        patientName: string;
        reportData: unknown;
        created_at: string;
        expires_at: string;
      };
    } catch {
      return null;
    }
  },

  async createCaregiverInvite(token: string, payload: unknown) {
    return mutateDb((data) => {
      if (!data.caregiver_invites) data.caregiver_invites = {};
      data.caregiver_invites[token] = JSON.stringify(payload);
    });
  },

  getCaregiverInvite(token: string) {
    const data = readDb();
    const raw = data.caregiver_invites?.[token];
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        userId: string;
        label: string;
        created_at: string;
        expires_at: string;
        snapshot?: {
          patientName: string;
          medCount: number;
          lastCheckin: string | null;
          wellness: number | null;
          warningCount: number;
        };
      };
    } catch {
      return null;
    }
  }
};
