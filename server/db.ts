import { getDatabasePathLabel, loadDatabase, saveDatabase } from './storage.js';

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

let writeQueue: Promise<void> = Promise.resolve();
let activeDb: DbSchema | null = null;

function emptyDb(): DbSchema {
  return {
    users: [],
    profiles: {},
    medications: {},
    medication_events: {},
    checkins: {},
    analyses: {},
    chat_messages: {},
    share_links: {},
    caregiver_invites: {}
  };
}

function readDb(): DbSchema {
  if (!activeDb) {
    throw new Error('Database not loaded — call attachDatabase() first');
  }
  return activeDb;
}

async function persistDb(db: DbSchema) {
  await saveDatabase(db);
}

function mutateDb<T>(fn: (db: DbSchema) => T): Promise<T> {
  const task = writeQueue.then(async () => {
    if (!activeDb) {
      activeDb = await loadDatabase(emptyDb);
    }
    const result = fn(activeDb);
    await persistDb(activeDb);
    return result;
  });
  writeQueue = task.then(() => undefined).catch(() => undefined);
  return task;
}

export async function attachDatabase() {
  activeDb = await loadDatabase(emptyDb);
}

export function detachDatabase() {
  activeDb = null;
}

export async function initDatabase() {
  await attachDatabase();
}

export { getDatabasePathLabel };

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

  getAdminOverview() {
    const data = readDb();
    let totalMeds = 0;
    let totalCheckins = 0;
    let subscribed = 0;

    const users = data.users.map((u) => {
      const medCount = (data.medications[u.id] || []).length;
      const checkinCount = (data.checkins[u.id] || []).length;
      totalMeds += medCount;
      totalCheckins += checkinCount;
      let isSubscribed = false;
      try {
        const p = data.profiles[u.id] ? JSON.parse(data.profiles[u.id]) : null;
        isSubscribed = Boolean(p?.is_subscribed);
        if (isSubscribed) subscribed += 1;
      } catch {
        /* ignore */
      }
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        medCount,
        checkinCount,
        isSubscribed
      };
    });

    return {
      userCount: data.users.length,
      totalMeds,
      totalCheckins,
      subscribedCount: subscribed,
      users: users.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 50)
    };
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
