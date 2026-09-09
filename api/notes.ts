// ==========================================
// ZAK'S SPIDER — NOTES API (/api/notes)
// Second Brain persistent notes management
// ==========================================

import { db } from './db.js';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const notes = await db.getNotes();
      return res.status(200).json({ success: true, notes });
    }

    if (req.method === 'POST') {
      const { note } = req.body || {};
      if (!note || !note.title) {
        return res.status(400).json({ success: false, error: 'Invalid note data' });
      }
      const saved = await db.saveNote(note);
      return res.status(200).json({ success: true, note: saved });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing note id' });
      }
      await db.deleteNote(String(id));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
