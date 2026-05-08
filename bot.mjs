import { readFileSync, existsSync } from "node:fs";

loadEnv();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

let offset = 0;

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is missing. Create .env from .env.example and paste your bot token there.");
  process.exit(1);
}

console.log("Bot is running.");

if (!ADMIN_CHAT_ID) {
  console.log("ADMIN_CHAT_ID is empty.");
  console.log("Open your bot in Telegram, send /start, then look here for your chat id.");
}

while (true) {
  try {
    const updates = await getUpdates();

    for (const update of updates) {
      offset = update.update_id + 1;
      await handleUpdate(update);
    }
  } catch (error) {
    console.error("Polling error:", error.message);
    await wait(2500);
  }
}

async function handleUpdate(update) {
  const message = update.message;

  if (!message) return;

  const chatId = message.chat.id;
  const text = message.text || "";

  if (!ADMIN_CHAT_ID) {
    console.log(`Your ADMIN_CHAT_ID is: ${chatId}`);
    await sendMessage(chatId, "Я вижу твое сообщение. Скопируй ADMIN_CHAT_ID из консоли в .env и перезапусти бота.");
    return;
  }

  if (String(chatId) === String(ADMIN_CHAT_ID)) {
    await sendMessage(chatId, "Бот работает. Теперь сообщения посетителей будут приходить сюда.");
    return;
  }

  if (text === "/start") {
    await sendMessage(chatId, "Привет! Напиши сообщение, и я передам его владельцу.");
    return;
  }

  const sender = formatSender(message.from);
  const forwardedText = [
    "Новое сообщение с лендинга",
    "",
    `От: ${sender}`,
    `Chat ID: ${chatId}`,
    "",
    text || "[Пользователь отправил не текстовое сообщение]",
  ].join("\n");

  await sendMessage(ADMIN_CHAT_ID, forwardedText);
  await sendMessage(chatId, "Спасибо! Сообщение отправлено.");
}

async function getUpdates() {
  const url = new URL(`${API_URL}/getUpdates`);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("timeout", "25");
  url.searchParams.set("allowed_updates", JSON.stringify(["message"]));

  const response = await fetch(url);
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || "getUpdates failed");
  }

  return data.result;
}

async function sendMessage(chatId, text) {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || "sendMessage failed");
  }

  return data.result;
}

function formatSender(from) {
  if (!from) return "Без имени";
  if (from.username) return `@${from.username}`;

  return [from.first_name, from.last_name].filter(Boolean).join(" ") || "Без имени";
}

function loadEnv() {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
