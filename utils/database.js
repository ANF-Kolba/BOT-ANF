import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import Database from "better-sqlite3";

// Obtém o caminho completo do arquivo atual
const __filename = fileURLToPath(import.meta.url);
// Obtém o diretório atual do arquivo
const __dirname = dirname(__filename);

// Caminho absoluto para garantir persistência, salva em /db/economia.sqlite
const dbDir = join(__dirname, '..', 'db');

// Verifica se a pasta 'db' existe, se não, cria a pasta
if (!existsSync(dbDir)) {
  mkdirSync(dbDir);
}

// Caminho completo do banco de dados
const dbPath = join(dbDir, 'economia.sqlite');
const db = new Database(dbPath);

// Criar as tabelas caso não existam
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  coins INTEGER DEFAULT 0,
  lastDaily INTEGER DEFAULT 0
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS shop (
  item TEXT PRIMARY KEY,
  price INTEGER
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS inventory (
  userId TEXT,
  item TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
)`).run();

console.log("Banco de dados e tabelas criados ou verificados com sucesso.");
// Função para obter ou criar um usuário
export function getUser(id) {
  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) {
    // Cria o usuário com saldo 0 e lastDaily como 0
    db.prepare("INSERT INTO users (id, coins, lastDaily) VALUES (?, 0, 0)").run(id);
    user = { id, coins: 0, lastDaily: 0 };
  }
  return user;
};
// Função para atualizar as moedas de um usuário
export function updateCoins(id, amount) {
  const user = getUser(id);
  db.prepare("UPDATE users SET coins = ? WHERE id = ?").run(user.coins + amount, id);
};
// Função para atualizar o timestamp do último "daily"
export function setDaily(id, timestamp) {
  db.prepare("UPDATE users SET lastDaily = ? WHERE id = ?").run(timestamp, id);
};
// Função para adicionar um item à loja
export function addItemToShop(item, price) {
  db.prepare("INSERT OR REPLACE INTO shop (item, price) VALUES (?, ?)").run(item, price);
}

// Função para obter todos os itens da loja
export function getShop() {
  return db.prepare("SELECT * FROM shop").all();
}

// Função para comprar um item
export function buyItem(userId, itemName) {
  const item = db.prepare("SELECT * FROM shop WHERE item = ?").get(itemName);
  if (!item) return { success: false, message: "❌ Esse item não existe!" };

  const user = getUser(userId);
  if (user.coins < item.price) {
    return { success: false, message: "💸 Você não tem dinheiro suficiente!" };
  }

  // Remove moedas e adiciona item ao inventário
  updateCoins(userId, -item.price);
  db.prepare("INSERT INTO inventory (userId, item) VALUES (?, ?)").run(userId, itemName);

  return { success: true, message: `✅ Você comprou **${itemName}** por 💰 ${item.price} moedas!` };
}

// Função para obter os itens de um usuário no inventário
export function getInventory(userId) {
  return db.prepare("SELECT item FROM inventory WHERE userId = ?").all(userId);
}

