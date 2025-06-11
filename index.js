import { getConfig } from './config.js';
import { DiscordClient } from './discordClient.js';
import { hasReplied, markReplied } from './state.js';
import { generateReply } from './aiClient.js';
import { buildUserPrompt } from './promptBuilder.js';

const CHECK_INTERVAL_MS = 10 * 1000; // 10 seconds

async function main() {
    console.log("Starting PhantomChat...");
    const config = await getConfig();
    const discordClient = new DiscordClient(config.discordToken);

    const lastMessageIds = {};
    config.channelIds.forEach(id => lastMessageIds[id] = null);


    console.log(`Monitoring channels: ${config.channelIds.join(', ')}`);

    setInterval(async () => {
        for (const channelId of config.channelIds) {
            try {
                const messages = await discordClient.fetchRecentMessages(channelId, { after: lastMessageIds[channelId] });

                if (!messages || messages.length === 0) {
                    continue;
                }

                lastMessageIds[channelId] = messages[0].id;

                for (const message of messages.reverse()) {
                    if (message.author.id === config.userId || await hasReplied(channelId, message.id)) {
                        continue;
                    }

                    console.log(`New message from ${message.author.username} in channel ${channelId}: "${message.content}"`);
                    
                    const contextMessages = await discordClient.fetchRecentMessages(channelId, { before: message.id, limit: 5 });

                    const prompt = buildUserPrompt(message, contextMessages?.reverse());
                    const reply = await generateReply(prompt, config.geminiApiKey);

                    if (reply) {
                        console.log(`Sending reply: "${reply}"`);
                        await discordClient.sendMessage(channelId, reply, message.id);
                        await markReplied(channelId, message.id);
                    }
                }
            } catch (error) {
                console.error(`Error processing channel ${channelId}:`, error);
            }
        }
    }, CHECK_INTERVAL_MS);
}

main().catch(console.error); 