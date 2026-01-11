import { Sequelize, DataTypes, Op } from "sequelize";
import pg from "pg";

/* ================== CONEXÃO ================== */
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

/* ================== MODELOS ================== */

// 👤 Usuário
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastDaily: { type: DataTypes.DATE },
  description: { type: DataTypes.STRING, defaultValue: "Sem descrição." },
}, { tableName: "Users" });

// 🛒 Loja
export const ShopItem = sequelize.define("ShopItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM("item", "banner", "icon", "lootbox", "tag", "role"),
    allowNull: false,
  },
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
  reference: { type: DataTypes.STRING },
  visible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "ShopItems" });

// 🎨 Cosméticos
export const Cosmetic = sequelize.define("Cosmetic", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("banner", "icon"), allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "Cosmetics" });

// 🏷️ Tags
export const Tag = sequelize.define("Tag", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  emoji: { type: DataTypes.STRING, defaultValue: "🔥" },
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "Tags" });

// 🎒 Inventário
export const Inventory = sequelize.define("Inventory", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.STRING },
  shopItemId: { type: DataTypes.INTEGER },
  equipped: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: "Inventories" });

/* ================== RELAÇÕES ================== */

User.hasMany(Inventory, { foreignKey: "userId" });
Inventory.belongsTo(User, { foreignKey: "userId" });

ShopItem.hasMany(Inventory, { foreignKey: "shopItemId" });
Inventory.belongsTo(ShopItem, { foreignKey: "shopItemId" });

/* ================== INIT ================== */

export async function initDB() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log("✅ Banco sincronizado");
}

/* ================== FUNÇÕES ================== */

// 👤 Usuário
export async function getUser(id) {
  const [user] = await User.findOrCreate({ where: { id } });
  return user;
}

export async function updateCoins(id, amount) {
  const user = await getUser(id);
  user.coins += amount;
  await user.save();
}

export async function setDaily(id, date) {
  const user = await getUser(id);
  user.lastDaily = date;
  await user.save();
}

// 🛒 Loja
export async function getShop() {
  return ShopItem.findAll({ where: { visible: true } });
}

export async function getShopItemById(id) {
  return ShopItem.findByPk(id);
}

export async function getShopItemByName(name) {
  return ShopItem.findOne({
    where: { name: { [Op.iLike]: name } },
  });
}

export async function addItemToShop(data) {
  return ShopItem.create(data);
}

export async function hideShopItem(id) {
  return ShopItem.update({ visible: false }, { where: { id } });
}

export async function showShopItem(id) {
  return ShopItem.update({ visible: true }, { where: { id } });
}

export async function updateShopPrice(id, price) {
  return ShopItem.update({ price }, { where: { id } });
}

// 🎒 Inventárioz
export async function addItemToInventory(userId, shopItemId) {
  return Inventory.create({ userId, shopItemId });
}

export async function hasItem(userId, shopItemId) {
  const item = await Inventory.findOne({ where: { userId, shopItemId } });
  return !!item;
}

export async function getInventory(userId) {
  return Inventory.findAll({
    where: { userId },
    include: [ShopItem],
  });
}
