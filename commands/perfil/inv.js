import { EmbedBuilder } from "discord.js";
import { getInventory } from "../../utils/database.js";

export default {
  name: "inv",
  description: "Mostra seu inventário",
  async execute(message) {
    const inventory = await getInventory(message.author.id);

    if (!inventory.length) {
      return message.reply("📦 Seu inventário está vazio!");
    }

    // 📦 Lootboxes
    const lootboxes = inventory.filter(i => i.shopItem && i.shopItem.type === "lootbox");

    // 🎨 Cosméticos
    const cosmetics = inventory.filter(i => i.shopItem && ["banner", "icon"].includes(i.shopItem.type));

    // 🏷️ Tags
    const tags = inventory.filter(i => i.shopItem && i.shopItem.type === "tag");

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username} — Inventário`)
      .setColor("Blue")
      .addFields(
        {
          name: "📦 Lootboxes",
          value: lootboxes.length
            ? lootboxes.map((i, idx) => `#${idx + 1} — **${i.shopItem.name}**`).join("\n")
            : "Nenhuma",
          inline: false,
        },
        {
          name: "🎨 Cosméticos",
          value: cosmetics.length
            ? cosmetics.map(c => `**${c.shopItem.name}** (${c.shopItem.type})`).join("\n")
            : "Nenhum",
          inline: false,
        },
        {
          name: "🏷️ Tags",
          value: tags.length
            ? tags.map(t => `**${t.shopItem.name}**`).join("\n")
            : "Nenhuma",
          inline: false,
        }
      );

    return message.channel.send({ embeds: [embed] });
  },
};
