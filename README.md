# PhantomChat v1

An automated Discord chat agent that uses Google's Gemini API to generate and send conversational replies as a user.

---

## ⚠️ Important Disclaimer

This project automates a user account using a **user token**. This is in **direct violation of Discord's Terms of Service** and can result in your account being disabled. Use this software at your own risk. For a TOS-compliant alternative, consider building a Discord bot using an official bot token and the Discord API. This is intended as Educational Purposes ONLY!

## Features

*   **AI-Powered Replies:** Leverages the Google Gemini API to generate context-aware, human-like responses.
*   **Customizable Personality:** Define a custom personality for the bot at startup (e.g., "sarcastic," "overly enthusiastic") to tailor its tone and style.
*   **Realistic Behavior:**
    *   **"Typing" Indicator:** The bot will appear to be typing before it sends a message.
    *   **Dynamic Delay:** The wait time before replying is based on the length of the generated message.
    *   **Randomized Replies:** The bot will randomly decide whether to send a message as a direct reply to a user or as a new, standalone message in the channel.
*   **Channel Monitoring:** Actively monitors one or more specified Discord channels for new messages.
*   **Stateful Memory:** Remembers which messages it has replied to (using a local `db.json` file) to avoid duplicates, even after restarting.

## Tech Stack

*   **Runtime:** Node.js (v18+)
*   **API:** Google Gemini API
*   **Dependencies:**
    *   `node-fetch`: For making HTTP requests to the Discord and Gemini APIs.
    *   `inquirer`: For interactive command-line prompts to gather configuration.
    *   `lowdb`: For a simple, local JSON database to store state.
    *   `dotenv`: For managing environment variables.

## Setup and Installation (or just run the [compiled version w/ Installation Setup Step 3](https://github.com/SSkipr/PhantomChat/releases))

1.  **Clone the repository (just [install](https://github.com/SSkipr/PhantomChat/archive/refs/heads/main.zip) it):**
    ```bash
    git clone https://github.com/SSkipr/PhantomChat.git
    cd PhantomChat
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your [Google Gemini API](https://aistudio.google.com/apikey) key (which is free):
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

## How to Run (or just run the [compiled version w/ Installation Setup Step 3](https://github.com/SSkipr/PhantomChat/releases))

1.  **Start the application from your terminal:**
    ```bash
    npm start
    ```
    Alternatively, you can run `node index.js`.

2.  **Follow the prompts:**
    *   You will be asked to enter your **[Discord user token](https://www.youtube.com/watch?v=5SRwnLYdpJs&t=51s)**.
    *   You will be asked for a comma-separated list of **Discord channel IDs** to monitor.
    *   You will be asked to provide an optional **personality**.

Once configured, the agent will start monitoring the specified channels and replying to messages.
