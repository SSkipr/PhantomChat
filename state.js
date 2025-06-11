import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const db = new Low(new JSONFile('db.json'), { repliedMessages: {} });
await db.read();

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