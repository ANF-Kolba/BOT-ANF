import { EmbedBuilder } from "discord.js";
import { getInventory } from "../../utils/database.js";

export default {
  name: "inv",
  description: "Mostra seu inventário",
  async execute(message) {
    const items = await getInventory(message.author.id);

    if (!items.length) {
      return message.reply("📦 Seu inventário está vazio!");
    }

    // Separar lootboxes, cosméticos e tags
    const lootboxes = items.filter(i => i.item && i.item.toLowerCase() === "lootbox");
    const cosmetics = items.filter(i => i.cosmetic);
    const tags = items.filter(i => i.tag);

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username} — Inventário`)
      .setColor("Blue")
      .addFields(
        {
          name: "📦 Lootboxes",
          value: lootboxes.length
            ? lootboxes.map((_, idx) => `Lootbox #${idx + 1}`).join("\n")
            : "Nenhuma",
          inline: true,
        },
        {
          name: "🎨 Cosméticos",
          value: cosmetics.length
            ? cosmetics.map(c => {
                return `**${c.cosmetic.name}** (${c.cosmetic.type})`;
              }).join("\n")
            : "Nenhum",
          inline: true,
        },
        {
          name: "🏷️ Tags",
          value: tags.length
            ? tags.map(t => {
                const emoji = t.tag.emoji ? `${t.tag.emoji} ` : "";
                return `${emoji}**${t.tag.name}**`;
              }).join("\n")
            : "Nenhuma",
          inline: true,
        }
      );

    return message.channel.send({ embeds: [embed] });
  }
};
