import { EmbedBuilder } from "discord.js";
import { getUser } from "../../utils/database.js";

export default {
  name: "balance",
  description: "Veja seu saldo.",
  async execute(message) {
    const user = await getUser(message.author.id);

    const embed = new EmbedBuilder()
      .setTitle("💳 Saldo de ANF Coins")
      .setDescription(`Seu saldo é: **${user.coins} ANF Coins**`)
      .setColor("Blue")
      .setFooter({ text: "Use !shop para comprar itens." });

    message.reply({ embeds: [embed] });
  },
};