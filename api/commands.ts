// ==========================================
// ZAK'S SPIDER — COMMANDS API (/api/commands)
// Pentest Commands catalog and custom payload storage
// ==========================================

import { db } from './db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const customCommands = await db.getCommands();
      return res.status(200).json({ success: true, commands: customCommands });
    }

    if (req.method === 'POST') {
      const { command } = req.body || {};
      if (!command || !command.title || !command.command) {
        return res.status(400).json({ success: false, error: 'Invalid command data' });
      }
      const saved = await db.saveCommand(command);
      return res.status(200).json({ success: true, command: saved });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
