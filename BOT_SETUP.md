# Telegram bot setup

## 1. Create `.env`

Copy `.env.example` to `.env`.

Put your bot token into `BOT_TOKEN`.

Do not put the token into `index.html`, `script.js`, or `styles.css`.

## 2. Find your `ADMIN_CHAT_ID`

Leave `ADMIN_CHAT_ID` empty first.

Run:

```bash
npm run bot
```

Open your bot in Telegram and send:

```text
/start
```

The terminal will print:

```text
Your ADMIN_CHAT_ID is: 123456789
```

Copy that number into `.env`.

## 3. Restart the bot

Stop the terminal with `Ctrl+C`.

Run again:

```bash
npm run bot
```

Now messages from other users to the bot will be forwarded to your Telegram chat.
