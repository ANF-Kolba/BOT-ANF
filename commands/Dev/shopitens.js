import { getShop } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "shoplist",
  category: "dev",
  hidden: true,
  async execute(message) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Sem permissão.");

    const items = await getShop({ includeHidden: true });

    if (!items.length)
      return message.reply("❌ Nenhum item na loja.");

    const embed = new EmbedBuilder()
      .setTitle("🛠️ Loja — Lista Completa")
      .setColor("DarkGold");

    items.forEach(i => {
      embed.addFields({
        name: `#${i.id} — ${i.item}`,
        value:
          `💰 ${i.price} coins\n` +
          `📦 Tipo: ${i.type}\n` +
          `👁️ Visível: ${i.inShop ? "Sim" : "Não"}`,
        inline: false,
      });
    });

    message.channel.send({ embeds: [embed] });
  },
};
