import { EmbedBuilder } from "discord.js";
import { getFullShop } from "../../utils/database.js";

export default {
  name: "shop",
  description: "Mostra todos os itens disponíveis na loja",
  async execute(message) {
    const items = await getFullShop();
    if (!items.length) return message.reply("❌ A loja está vazia!");

    const embed = new EmbedBuilder()
      .setTitle("🛒 Loja de ANF")
      .setColor("Gold");

    items.forEach(item => {
      let typeIcon = "📦";

      switch (item.type) {
        case "role": typeIcon = "🎭"; break;
        case "banner": typeIcon = "🖼️"; break;
        case "icon": typeIcon = "✨"; break;
        case "lootbox": typeIcon = "🎁"; break;
      }

      embed.addFields({
        name: `${typeIcon} ${item.name}`,
        value: `Preço: **${item.price} ANF Coins**${item.type === "role" ? `\nCargo ID: ${item.reference}` : ""}${item.url ? `\n[Visualizar](${item.url})` : ""}`,
        inline: false,
      });
    });

    return message.channel.send({ embeds: [embed] });
  }
};
