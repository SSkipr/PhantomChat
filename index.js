import { getConfig } from './config.js';
import { DiscordClient } from './discordClient.js';
import { hasReplied, markReplied } from './state.js';
import { generateReply } from './aiClient.js';
import { buildUserPrompt } from './promptBuilder.js';

const CHECK_INTERVAL_MS = 3 * 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    console.log("Starting PhantomChat...");
    const config = await getConfig();
    const discordClient = new DiscordClient(config.discordToken);

    const lastMessageIds = {};
    config.channelIds.forEach(id => (lastMessageIds[id] = null));

    console.log(`Monitoring channels: ${config.channelIds.join(', ')}`);

    async function poll() {
        for (const channelId of config.channelIds) {
            try {
                const messages = await discordClient.fetchRecentMessages(channelId, { after: lastMessageIds[channelId] });

                if (!messages || messages.length === 0) {
                    continue;
                }

                lastMessageIds[channelId] = messages[0].id;

                for (const message of messages.reverse()) { 
                    if (message.author.id === config.userId || (await hasReplied(channelId, message.id))) {
                        continue;
                    }

                    console.log(`New message from ${message.author.username} in channel ${channelId}: "${message.content}"`);

                    const contextMessages = await discordClient.fetchRecentMessages(channelId, { before: message.id, limit: 5 });

                    const prompt = buildUserPrompt(message, contextMessages?.reverse());
                    const reply = await generateReply(prompt, config.geminiApiKey);

                    if (reply) {
                        const delaySeconds = getRandomInt(5, 9);
                        console.log(`Waiting ${delaySeconds} seconds before replying...`);
                        await sleep(delaySeconds * 1000);

                        console.log(`Sending reply: "${reply}"`);
                        await discordClient.sendMessage(channelId, reply, message.id);
                        await markReplied(channelId, message.id);
                    }
                }
            } catch (error) {
                console.error(`Error processing channel ${channelId}:`, error);
            }
        }
        setTimeout(poll, CHECK_INTERVAL_MS);
    }

    poll();
}

main().catch(console.error); 