import { EmbedBuilder } from "discord.js";
import { buyItem } from "../../utils/database.js";

export default {
  name: "buy",
  description: "Compra um item da loja.",
  execute(message, args) {
    if (!args.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Compra inválida")
            .setDescription("Digite o nome do item que deseja comprar.")
            .setColor("Red")
        ]
      });
    }

    const itemName = args.join(" ");
    const result = buyItem(message.author.id, itemName);

    const embed = new EmbedBuilder()
      .setTitle(result.success ? "✅ Compra realizada!" : "❌ Falha na compra")
      .setDescription(result.message)
      .setColor(result.success ? "Green" : "Red");

    message.reply({ embeds: [embed] });
  }
};