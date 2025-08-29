import config from "./config.json" assert { type: "json" };
// ou importar módulos:
import fs from "fs/promises";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

// Carregar comandos automaticamente
const commandFolders = fs.readdirSync(path.join(__dirname, "commands"));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands", folder)).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = await import(`./commands/${folder}/${file}`);
    client.commands.set(command.default.name, command.default);
  }
}

client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("❌ Ocorreu um erro ao executar esse comando!");
  }
});
client.login(process.env.DISCORD_TOKEN);

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot está rodando!');
});

app.listen(port, () => {
  console.log(`Servidor HTTP rodando na porta ${port}`);
});