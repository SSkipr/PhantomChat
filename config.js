import dotenv from 'dotenv';
import inquirer from 'inquirer';
import { DiscordClient } from './discordClient.js';

dotenv.config();

let config = null;

export async function getConfig() {
    if (config) {
        return config;
    }

    const answers = await inquirer.prompt([
        {
            type: 'password',
            name: 'discordToken',
            message: 'Enter your Discord user token:',
            mask: '*',
        },
        {
            type: 'input',
            name: 'channelIds',
            message: 'Enter comma-separated channel IDs to monitor:',
        },
    ]);

    const discordClient = new DiscordClient(answers.discordToken);
    const user = await discordClient.validateToken();

    if (!user) {
        console.error('Invalid Discord token. Please try again.');
        return getConfig();
    }

    console.log(`Logged in as: ${user.username}#${user.discriminator}`);


    config = {
        discordToken: answers.discordToken,
        channelIds: answers.channelIds.split(',').map(id => id.trim()),
        geminiApiKey: process.env.GEMINI_API_KEY,
        userId: user.id,
    };

    return config;
} 