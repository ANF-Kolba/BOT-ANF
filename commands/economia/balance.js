import { EmbedBuilder } from "discord.js";
import { getUser } from "../../utils/database.js";

export default {
  name: ["balance", "bank"],  // Comando aceita tanto !balance quanto !bank
  description: "Veja seu saldo.",
  execute(message) {
    const user = getUser(message.author.id);

    const embed = new EmbedBuilder()
      .setTitle("💳 Saldo Bancário")
      .setDescription(`Seu saldo é: **${user.coins} moedas**`)
      .setColor("Blue")
      .setFooter({ text: "Use !shop para comprar itens." });

    message.reply({ embeds: [embed] });
  }
};