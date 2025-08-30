import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import sqlite3 from "sqlite3"; // Importando o SQLite

// Corrigir __dirname e __filename com ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar config.json
const configRaw = await fs.readFile(path.join(__dirname, "config.json"), "utf-8");
const config = JSON.parse(configRaw);

// Criar cliente do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// 🔁 Carregar comandos automaticamente
const commandFolders = await fs.readdir(path.join(__dirname, "commands"));

for (const folder of commandFolders) {
  const commandFiles = await fs
    .readdir(path.join(__dirname, "commands", folder))
    .then(files => files.filter(file => file.endsWith(".js")));

  for (const file of commandFiles) {
    const filePath = path.join(__dirname, "commands", folder, file);
    try {
      const command = await import(`file://${filePath}`);

      if (command?.default?.name && typeof command.default.execute === "function") {
        // 👉 Adiciona a categoria ao comando
        command.default.category = folder;
        client.commands.set(command.default.name, command.default);
        console.log(`✅ Comando carregado: ${folder}/${command.default.name}`);
      } else {
        console.warn(`⚠️ Comando ignorado (sem exportação válida): ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao carregar comando: ${filePath}`);
      console.error(error);
    }
  }
}

// Criar conexão com o banco de dados SQLite
const db = new sqlite3.Database(process.env.DB_PATH || "/home/render/economia.sqlite", (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
  } else {
    console.log("Conexão com o banco de dados estabelecida.");
  }
});

// Criar a tabela de usuários (se não existir)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      saldo INTEGER
    );
  `);
});

// Evento quando o bot está pronto
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// Escutar mensagens
client.on("messageCreate", (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return; // Ignora mensagens do bot e sem prefixo

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args, config.prefix);
  } catch (error) {
    console.error(`❌ Erro ao executar comando ${commandName}:`, error);
    message.reply("❌ Ocorreu um erro ao executar esse comando!");
  }
});

// Login no Discord
client.login(process.env.DISCORD_TOKEN);

// 🖥️ Servidor Express para manter o bot acordado (Render ou Replit)
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot está rodando com sucesso 🚀");
});

app.listen(port, () => {
  console.log(`🌐 Servidor HTTP rodando na porta ${port}`);
});
