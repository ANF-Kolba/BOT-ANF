import { EmbedBuilder } from "discord.js";
import { getInventory } from "../../utils/database.js";

export default {
  name: "inv",
  description: "Mostra seus itens comprados.",
  execute(message) {
    const inv = getInventory(message.author.id);

    if (inv.length === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📦 Inventário vazio")
            .setDescription("Você ainda não comprou nenhum item.")
            .setColor("Red")
        ]
      });
    }

    const lista = inv.map(i => `- ${i.item}`).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`📦 Inventário de ${message.author.username}`)
      .setDescription(lista)
      .setColor("Blue")
      .setFooter({ text: "Use !shop para ver os itens disponíveis." });

    message.reply({ embeds: [embed] });
  }
};