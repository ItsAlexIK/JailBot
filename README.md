# 🚓 JailBot - Discord Voice Jail Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A Discord bot that allows server admins to "jail" users by moving them into a specific voice channel and optionally setting a jail time. Useful for moderation or fun!

## ✨ Features

- Slash commands `/jail` and `/unjail`
- Move users to a jail voice channel
- Optional jail duration: `10m`, `1h`, `2d` etc.
- Auto-release users after their time is up
- Stores jailed user data in a JSON file
- Permission-restricted to administrators

## 📢 Important Notice

This bot **records voice audio** from the users moved to the jail voice channel.  
**Recording functionality is implemented for educational purposes only.**  

The author does **not take any legal responsibility** for misuse of this bot or any recordings made with it.  
Please ensure you comply with your local laws and obtain proper consent before recording any voice communication.

## 🚀 Commands

### `/jail`

> Jails a user in the voice channel

**Options:**
- `user` (required): The user to jail
- `czas` (optional): Time like `30s`, `10m`, `1h`, `2d`

### `/unjail`

> Releases a user from jail

**Options:**
- `user` (required): The user to unjail

## 🛠️ Setup

1. Clone the repo and install dependencies:

```
git clone https://github.com/ItsAlexIK/JailBot.git
cd JailBot
npm install
```

2. Create a `.env` file with the following:

```
DISCORD_TOKEN=your-bot-token
GUILD_ID=your-guild-id
JAIL_VOICE_CHANNEL_ID=your-jail-voice-channel-id
```

3. Run the bot:

```
npm start
```

## 🧪 Example

```bash
/jail user:@Troll czas:10m
```

> ⛓️ This moves the user into a designated jail voice channel for 10 minutes.

## 🧑‍💻 Author

- [Discord](https://discord.com/users/551023598203043840)
- [GitHub](https://github.com/ItsAlexIK)

---

> Made with ❤️ by ItsAlexIK
