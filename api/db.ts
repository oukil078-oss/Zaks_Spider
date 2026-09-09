// ==========================================
// ZAK'S SPIDER — UNIVERSAL VERCEL DATABASE ENGINE
// Supports Vercel KV / Postgres with out-of-the-box in-memory fallback
// ==========================================

import type { BrainNoteItem, PentestCommandItem } from '../src/types';

// In-memory cache for warm serverless execution & local dev
let memoryNotes: BrainNoteItem[] = [];
let memoryCommands: PentestCommandItem[] = [];

// Helper: Vercel KV REST execution
async function kvFetch(command: string, ...args: any[]): Promise<any> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/${command}/${args.map(encodeURIComponent).join('/')}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch (e) {
    console.warn('[DB] KV fetch error:', e);
    return null;
  }
}

export const db = {
  // Notes Collection
  async getNotes(): Promise<BrainNoteItem[]> {
    // 1. Try Vercel KV
    const kvData = await kvFetch('get', 'spider:notes');
    if (kvData) {
      try {
        const parsed = typeof kvData === 'string' ? JSON.parse(kvData) : kvData;
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }

    // 2. Return memory cache
    return memoryNotes;
  },

  async saveNote(note: BrainNoteItem): Promise<BrainNoteItem> {
    const current = await this.getNotes();
    const idx = current.findIndex(n => n.id === note.id);
    let updated: BrainNoteItem[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...note, updated: new Date().toISOString() };
    } else {
      updated = [{ ...note, updated: new Date().toISOString() }, ...current];
    }

    memoryNotes = updated;

    // Try persisting to Vercel KV
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (url && token) {
      try {
        await fetch(`${url}/set/spider:notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(updated)),
        });
      } catch (e) {
        console.warn('[DB] Failed to save note to KV:', e);
      }
    }

    return note;
  },

  async deleteNote(id: string): Promise<boolean> {
    const current = await this.getNotes();
    const updated = current.filter(n => n.id !== id);
    memoryNotes = updated;

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (url && token) {
      try {
        await fetch(`${url}/set/spider:notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(updated)),
        });
      } catch {}
    }

    return true;
  },

  // Commands Collection
  async getCommands(): Promise<PentestCommandItem[]> {
    const kvData = await kvFetch('get', 'spider:commands');
    if (kvData) {
      try {
        const parsed = typeof kvData === 'string' ? JSON.parse(kvData) : kvData;
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return memoryCommands;
  },

  async saveCommand(command: PentestCommandItem): Promise<PentestCommandItem> {
    const current = await this.getCommands();
    const updated = [command, ...current.filter(c => c.id !== command.id)];
    memoryCommands = updated;

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (url && token) {
      try {
        await fetch(`${url}/set/spider:commands`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(updated)),
        });
      } catch {}
    }

    return command;
  },
};
