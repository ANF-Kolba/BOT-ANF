import { EmbedBuilder } from "discord.js";
import { ShopItem, Cosmetic, Tag } from "../../utils/database.js";

export default {
  name: "itemids",
  description: "Mostra os IDs reais dos itens da loja",
  category: "dev",
  hidden: true,

  async execute(message) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Sem permissão.");
    }

    const shopItems = await ShopItem.findAll();
    const cosmetics = await Cosmetic.findAll();
    const tags = await Tag.findAll();

    if (!shopItems.length && !cosmetics.length && !tags.length) {
      return message.reply("❌ Nenhum item encontrado no banco.");
    }

    const embed = new EmbedBuilder()
      .setTitle("🆔 IDs Reais dos Itens")
      .setColor("DarkGold");

    // 🛒 ShopItems (item, lootbox, role)
    if (shopItems.length) {
      embed.addFields({
        name: "🛒 ShopItems",
        value: shopItems
          .map(
            i =>
              `🆔 **${i.id}** | **${i.item}**\nTipo: \`${i.type}\` | 💰 ${i.price}`
          )
          .join("\n\n"),
      });
    }

    // 🎨 Cosméticos
    if (cosmetics.length) {
      embed.addFields({
        name: "🎨 Cosméticos",
        value: cosmetics
          .map(
            c =>
              `🆔 **${c.id}** | **${c.name}**\nTipo: \`${c.type}\` | 💰 ${c.price}`
          )
          .join("\n\n"),
      });
    }

    // 🏷️ Tags
    if (tags.length) {
      embed.addFields({
        name: "🏷️ Tags",
        value: tags
          .map(
            t =>
              `🆔 **${t.id}** | ${t.tag} **${t.name}** | 💰 ${t.price}`
          )
          .join("\n\n"),
      });
    }

    return message.channel.send({ embeds: [embed] });
  },
};
