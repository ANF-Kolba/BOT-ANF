import { EmbedBuilder } from "discord.js";
import { getShop } from "../../utils/database.js";

export default {
  name: "shop",
  description: "Mostra os itens da loja.",
  execute(message) {
    const shop = getShop();

    if (shop.length === 0) {
      return message.reply("🏪 A loja está vazia!");
    }

    const embed = new EmbedBuilder()
      .setTitle("🏪 Loja disponível")
      .setDescription(
        shop.map(item => `**${item.item}** — 💰 ${item.price}`).join("\n")
      )
      .setColor("Gold")
      .setFooter({ text: "Use !buy <item> para comprar." });

    message.channel.send({ embeds: [embed] });
  }
};