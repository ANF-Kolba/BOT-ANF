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