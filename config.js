import dotenv from 'dotenv';
import inquirer from 'inquirer';
import path from 'path';
import { DiscordClient } from './discordClient.js';

const exeDir = path.dirname(process.execPath);

dotenv.config({ path: path.join(exeDir, '.env') });

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
        {
            type: 'input',
            name: 'personality',
            message: 'Enter a personality for the bot (e.g., "sarcastic," "overly enthusiastic"). The default/recommended mode is to leave this blank:',
            default: '',
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
        channelIds: answers.channelIds ? answers.channelIds.split(',').map(id => id.trim()) : [],
        personality: answers.personality,
        geminiApiKey: process.env.GEMINI_API_KEY,
        userId: user.id,
    };

    if (config.channelIds.length === 0) {
        console.error('No channel IDs provided. Please try again.');
        return getConfig();
    }

    return config;
} 