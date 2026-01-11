import { EmbedBuilder } from "discord.js";
import {
  getUser,
  getShopItemById,
  getShopItemByName,
  addItemToInventory,
  hasItem,
} from "../../utils/database.js";

export default {
  name: "buy",
  description: "Compra um item da loja pelo ID ou nome",
  async execute(message, args) {
    if (!args.length) {
      return message.reply("❌ Use: `!buy <id ou nome>`");
    }

    const user = await getUser(message.author.id);
    const input = args.join(" ");

    // 🔍 Buscar por ID ou nome
    const shopItem =
      !isNaN(input)
        ? await getShopItemById(Number(input))
        : await getShopItemByName(input);

    if (!shopItem || !shopItem.visible) {
      return message.reply("❌ Item não encontrado na loja.");
    }

    // 🚫 Já possui
    const alreadyHas = await hasItem(user.id, shopItem.id);
    if (alreadyHas) {
      return message.reply("❌ Você já possui este item.");
    }

    // 💰 Saldo
    if (user.coins < shopItem.price) {
      return message.reply("❌ Você não tem coins suficientes.");
    }

    // 💸 Compra
    user.coins -= shopItem.price;
    await user.save();
    await addItemToInventory(user.id, shopItem.id);

    const embed = new EmbedBuilder()
      .setTitle("✅ Compra realizada!")
      .setColor("Green")
      .addFields(
        { name: "🆔 ID", value: String(shopItem.id), inline: true },
        { name: "📦 Item", value: shopItem.name, inline: true },
        { name: "💰 Preço", value: `${shopItem.price} coins`, inline: true }
      );

    return message.channel.send({ embeds: [embed] });
  },
};
