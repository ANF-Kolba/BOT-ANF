import { Sequelize, DataTypes } from "sequelize";

// ---------------------- CONEXÃO ----------------------
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

// ---------------------- MODELOS ----------------------

// Usuário
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastDaily: { type: DataTypes.DATE, allowNull: true },
  lastSteal: { type: DataTypes.DATE, allowNull: true },
  lastAdventure: { type: DataTypes.DATE, allowNull: true },
  lastScratch: { type: DataTypes.DATE, allowNull: true },
  equippedBanner: { type: DataTypes.INTEGER, allowNull: true },
  equippedIcon: { type: DataTypes.INTEGER, allowNull: true },
  equippedTagId: { type: DataTypes.INTEGER, allowNull: true }, // TAG equipada
}, { tableName: "Users" });

// Cosméticos (banner e ícone)
export const Cosmetic = sequelize.define("Cosmetic", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("banner", "icon"), allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "Cosmetics" });

// Tags equipáveis
export const Tag = sequelize.define("Tag", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Ex: "Fogo"
  tag: { type: DataTypes.STRING, allowNull: false },  // Ex: "FIRE"
  emoji: { type: DataTypes.STRING, allowNull: true }, // Ex: 🔥
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "Tags" });

// Inventário
export const Inventory = sequelize.define("Inventory", {
  userId: { type: DataTypes.STRING, references: { model: User, key: "id" } },
  item: { type: DataTypes.STRING, allowNull: true },
  cosmeticId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Cosmetic, key: "id" } },
  tagId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Tag, key: "id" } },
}, { tableName: "Inventories" });

// Loja
export const ShopItem = sequelize.define("ShopItem", {
  item: { type: DataTypes.STRING, primaryKey: true },
  price: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM("item", "role", "banner", "icon", "lootbox", "tag"), defaultValue: "item" },
  reference: { type: DataTypes.STRING, allowNull: true },
}, { tableName: "ShopItems" });

// ---------------------- RELAÇÕES ----------------------
User.hasMany(Inventory, { foreignKey: "userId" });
Inventory.belongsTo(User, { foreignKey: "userId" });

Cosmetic.hasMany(Inventory, { foreignKey: "cosmeticId" });
Inventory.belongsTo(Cosmetic, { foreignKey: "cosmeticId", as: "cosmetic" });

Tag.hasMany(Inventory, { foreignKey: "tagId" });
Inventory.belongsTo(Tag, { foreignKey: "tagId", as: "tag" });

// ---------------------- INICIALIZAÇÃO ----------------------
export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Banco PostgreSQL conectado e sincronizado!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  }
}

// ---------------------- FUNÇÕES ----------------------

// Usuário
export async function getUser(id) {
  let user = await User.findByPk(id);
  if (!user) user = await User.create({ id });
  return user;
}

export async function updateCoins(id, amount) {
  const user = await getUser(id);
  user.coins += amount;
  await user.save();
}

// Atualiza lastDaily
export async function setDaily(userId, date = new Date()) {
  const user = await getUser(userId);
  user.lastDaily = date;
  await user.save();
}

// Equipar tag
export async function equipTag(userId, tagId) {
  const user = await getUser(userId);
  user.equippedTagId = tagId;
  await user.save();
}

// Inventário
export async function getInventory(userId) {
  const inv = await Inventory.findAll({
    where: { userId },
    include: [
      { model: Cosmetic, as: "cosmetic" },
      { model: Tag, as: "tag" },
    ],
  });

  return inv.map(i => ({
    item: i.item,
    cosmetic: i.cosmetic
      ? { id: i.cosmetic.id, name: i.cosmetic.name, type: i.cosmetic.type, url: i.cosmetic.url }
      : null,
    tag: i.tag
      ? { id: i.tag.id, name: i.tag.name, tag: i.tag.tag, emoji: i.tag.emoji }
      : null,
  }));
}

export async function addItemToInventory(userId, itemName, cosmeticId = null, tagId = null) {
  await Inventory.create({ userId, item: itemName, cosmeticId, tagId });
}

export async function removeItemFromInventory(userId, itemName, cosmeticId = null, tagId = null) {
  const where = { userId };
  if (cosmeticId) where.cosmeticId = cosmeticId;
  else if (tagId) where.tagId = tagId;
  else where.item = itemName;

  const removed = await Inventory.destroy({ where, limit: 1 });
  return removed > 0;
}

export async function hasCosmetic(userId, cosmeticId) {
  const inv = await Inventory.findOne({ where: { userId, cosmeticId } });
  return !!inv;
}

export async function hasTag(userId, tagId) {
  const inv = await Inventory.findOne({ where: { userId, tagId } });
  return !!inv;
}

// Loja
export async function addItemToShop(item, price, type = "item", reference = null) {
  await ShopItem.upsert({ item, price, type, reference });
}

export async function getFullShop() {
  const shopItems = await ShopItem.findAll();
  const cosmetics = await Cosmetic.findAll();
  const tags = await Tag.findAll();

  const shopData = shopItems.map(i => ({
    name: i.item,
    price: i.price,
    type: i.type,
    reference: i.reference || null,
    url: null,
  }));

  const cosmeticsData = cosmetics.map(c => ({
    name: c.name,
    price: c.price,
    type: c.type,
    reference: null,
    url: c.url,
  }));

  const tagsData = tags.map(t => ({
    name: t.name,
    price: t.price,
    type: "tag",
    reference: t.emoji || null,
    tag: t.tag,
  }));

  return [...shopData, ...cosmeticsData, ...tagsData];
}
