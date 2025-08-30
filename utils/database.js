import Database from "better-sqlite3";

const db = new Database("economia.sqlite");

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  coins INTEGER DEFAULT 0,
  lastDaily INTEGER DEFAULT 0
)`).run();

export function getUser(id) {
  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) {
    db.prepare("INSERT INTO users (id, coins, lastDaily) VALUES (?, 0, 0)").run(id);
    user = { id, coins: 0, lastDaily: 0 };
  }
  return user;
}

export function updateCoins(id, amount) {
  const user = getUser(id);
  db.prepare("UPDATE users SET coins = ? WHERE id = ?").run(user.coins + amount, id);
}

export function setDaily(id, timestamp) {
  db.prepare("UPDATE users SET lastDaily = ? WHERE id = ?").run(timestamp, id);
}
// Criar tabela da loja
db.prepare(`CREATE TABLE IF NOT EXISTS shop (
  item TEXT PRIMARY KEY,
  price INTEGER
)`).run();

// Criar tabela de inventário
db.prepare(`CREATE TABLE IF NOT EXISTS inventory (
  userId TEXT,
  item TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
)`).run();

export function addItemToShop(item, price) {
  db.prepare("INSERT OR REPLACE INTO shop (item, price) VALUES (?, ?)").run(item, price);
}

export function getShop() {
  return db.prepare("SELECT * FROM shop").all();
}

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

  return { success: true, message: `✅ Você comprou **${itemName}** por ${item.price} moedas!` };
}

export function getInventory(userId) {
  return db.prepare("SELECT item FROM inventory WHERE userId = ?").all(userId);
}