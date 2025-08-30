import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// Obtém o caminho completo do arquivo atual
const __filename = fileURLToPath(import.meta.url);
// Obtém o diretório atual do arquivo
const __dirname = dirname(__filename);

// Caminho persistente no Render
const dbDirectory = '/home/render/db';  // Caminho persistente para o Render
const dbPath = join(dbDirectory, 'economia.sqlite');

// Verificar se o diretório existe e criá-lo, se não
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
  console.log(`Diretório '${dbDirectory}' criado.`);
}

// Log para verificar o caminho do banco de dados
console.log("Banco de dados localizado em:", dbPath);

// Criar a instância do banco de dados SQLite
const db = new Database(dbPath);

// Criar a tabela 'users' se não existir
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  coins INTEGER DEFAULT 0,
  lastDaily INTEGER DEFAULT 0
)`).run();

// Verificação se a tabela foi criada
console.log("Tabela 'users' criada ou já existente.");

// Criar a tabela 'shop' se não existir
db.prepare(`CREATE TABLE IF NOT EXISTS shop (
  item TEXT PRIMARY KEY,
  price INTEGER
)`).run();

// Criar a tabela 'inventory' se não existir
db.prepare(`CREATE TABLE IF NOT EXISTS inventory (
  userId TEXT,
  item TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
)`).run();

// Função para obter ou criar um usuário
export function getUser(id) {
  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) {
    // Se o usuário não existir, cria um novo
    db.prepare("INSERT INTO users (id, coins, lastDaily) VALUES (?, 0, 0)").run(id);
    user = { id, coins: 0, lastDaily: 0 };
    console.log(`Novo usuário criado com id: ${id}`);
  } else {
    console.log(`Usuário existente encontrado: ${id}`);
  }
  return user;
}

// Função para atualizar as moedas de um usuário
export function updateCoins(id, amount) {
  const user = getUser(id);
  db.prepare("UPDATE users SET coins = ? WHERE id = ?").run(user.coins + amount, id);
  console.log(`Moedas de ${id} atualizadas para ${user.coins + amount}`);
}

// Função para atualizar o timestamp do último "daily"
export function setDaily(id, timestamp) {
  db.prepare("UPDATE users SET lastDaily = ? WHERE id = ?").run(timestamp, id);
  console.log(`Timestamp do último daily atualizado para ${timestamp}`);
}

// Função para adicionar um item à loja
export function addItemToShop(item, price) {
  db.prepare("INSERT OR REPLACE INTO shop (item, price) VALUES (?, ?)").run(item, price);
  console.log(`Item adicionado/atualizado na loja: ${item} com preço ${price}`);
}

// Função para obter todos os itens da loja
export function getShop() {
  const shopItems = db.prepare("SELECT * FROM shop").all();
  console.log("Itens da loja:", shopItems);
  return shopItems;
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

  console.log(`Usuário ${userId} comprou o item: ${itemName} por ${item.price} moedas.`);
  return { success: true, message: `✅ Você comprou **${itemName}** por ${item.price} moedas!` };
}

// Função para obter os itens de um usuário no inventário
export function getInventory(userId) {
  const inventory = db.prepare("SELECT item FROM inventory WHERE userId = ?").all(userId);
  console.log(`Inventário do usuário ${userId}:`, inventory);
  return inventory;
}
