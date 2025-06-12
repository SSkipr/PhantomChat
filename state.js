import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

const exeDir = path.dirname(process.execPath);
const dbPath = path.join(exeDir, 'db.json');

const db = new Low(new JSONFile(dbPath), { repliedMessages: {} });

export async function initializeState() {
    await db.read();
}

export async function hasReplied(channelId, messageId) {
    await db.read();
    return db.data.repliedMessages[channelId]?.includes(messageId);
}

export async function markReplied(channelId, messageId) {
    if (!db.data.repliedMessages[channelId]) {
        db.data.repliedMessages[channelId] = [];
    }
    db.data.repliedMessages[channelId].push(messageId);
    await db.write();
} 