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

                    // Start "typing" in the channel
                    await discordClient.sendTyping(channelId);

                    const contextMessages = await discordClient.fetchRecentMessages(channelId, { before: message.id, limit: 5 });

                    const prompt = buildUserPrompt(message, contextMessages?.reverse(), config.personality);
                    const reply = await generateReply(prompt, config.geminiApiKey);

                    if (reply) {
                        // Dynamic delay based on reply length (words * 200ms, with a 3s base)
                        const wordCount = reply.split(' ').length;
                        const dynamicDelayMs = 3000 + (wordCount * 200);
                        console.log(`Waiting ${dynamicDelayMs / 1000} seconds before replying (dynamic)...`);
                        await sleep(dynamicDelayMs);
                        
                        const shouldReplyToUser = Math.random() <= 0.3;

                        if (shouldReplyToUser) {
                            console.log(`Sending as a direct reply to ${message.author.username}: "${reply}"`);
                            await discordClient.sendMessage(channelId, reply, message.id);
                        } else {
                            console.log(`Sending as a new message in the channel: "${reply}"`);
                            await discordClient.sendMessage(channelId, reply);
                        }
                        
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