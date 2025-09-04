import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { initDB } from "./utils/database.js"; 

// Corrigir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar config.json
const configRaw = await fs.readFile(path.join(__dirname, "config.json"), "utf-8");
const config = JSON.parse(configRaw);

// Inicializar banco
await initDB();

// Criar cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Carregar comandos
const commandFolders = await fs.readdir(path.join(__dirname, "commands"));

for (const folder of commandFolders) {
  const commandFiles = (await fs.readdir(path.join(__dirname, "commands", folder)))
    .filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(__dirname, "commands", folder, file);
    try {
      const command = await import(`file://${filePath}`);
      if (command?.default?.name && typeof command.default.execute === "function") {
        command.default.category = folder;
        client.commands.set(command.default.name, command.default);
        console.log(`✅ Comando carregado: ${folder}/${command.default.name}`);
      } else {
        console.warn(`⚠️ Comando ignorado: ${filePath}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao carregar comando: ${filePath}`, err);
    }
  }
}

// Evento ready
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// Escutar mensagens
client.on("messageCreate", async message => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, config.prefix);
  } catch (err) {
    console.error(`❌ Erro ao executar comando ${commandName}:`, err);
    message.reply("❌ Ocorreu um erro ao executar esse comando!");
  }
});

// Login no Discord
client.login(process.env.DISCORD_TOKEN);

// Express para manter bot acordado
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot está rodando 🚀"));
app.listen(port, () => console.log(`🌐 Servidor HTTP rodando na porta ${port}`));
