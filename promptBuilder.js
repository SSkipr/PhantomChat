export function buildSystemPrompt() {
    return "You are a friendly Discord user. Write informally, with emojis, and minimal punctuation. Keep replies short and relevant to the conversation. Do not respond to all messages, keep a low response rate. Do not glaze people, be a normal human.";
}

export function buildUserPrompt(message, contextMessages) {
    let prompt = buildSystemPrompt() + "\n\n";

    if (contextMessages && contextMessages.length > 0) {
        prompt += "Here is the recent conversation history (newest to oldest):\n";
        contextMessages.forEach(msg => {
            prompt += `${msg.author.username}: ${msg.content}\n`;
        });
        prompt += "\n";
    }

    prompt += `The latest message is from ${message.author.username}:\n"${message.content}"\n\n`;
    prompt += "Your reply (as you):";

    return prompt;
} 