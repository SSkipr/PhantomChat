import fetch from 'node-fetch';

export class DiscordClient {
  constructor(token) {
    this.token = token;
  }

  async request(method, path, body) {
    const url = `https://discord.com/api/v10${path}`;
    const opts = {
      method,
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    };
    const res = await fetch(url, opts);
    if (res.status === 429) {
      const retryAfter = (await res.json()).retry_after;
      console.log(`Rate limited. Retrying after ${retryAfter} seconds.`);
      await new Promise(r => setTimeout(r, (retryAfter + 0.1) * 1000));
      return this.request(method, path, body);
    }
    if (!res.ok) {
        console.error(`Error fetching ${url}: ${res.statusText}`);
        return null;
    }
    return res.json();
  }

  validateToken() {
    return this.request('GET', '/users/@me');
  }

  fetchRecentMessages(channelId, options = {}) {
    const qs = new URLSearchParams({ limit: options.limit || 20 });
    if(options.after) {
        qs.set('after', options.after);
    }
    if(options.before) {
        qs.set('before', options.before);
    }
    return this.request('GET', `/channels/${channelId}/messages?${qs}`);
  }

  sendMessage(channelId, content, replyToId) {
    const body = { content };
    if (replyToId) {
      body.message_reference = { message_id: replyToId };
    }
    return this.request('POST', `/channels/${channelId}/messages`, body);
  }
} 