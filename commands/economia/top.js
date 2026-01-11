import { EmbedBuilder } from "discord.js";
import { User } from "../../utils/database.js";

export default {
  name: "top",
  description: "Mostra os jogadores com mais ANF Coins",
  async execute(message) {
    try {
      // Pega os 10 usuários com mais coins
      const topUsers = await User.findAll({
        order: [["coins", "DESC"]],
        limit: 10
      });

      if (!topUsers.length) return message.reply("❌ Nenhum usuário encontrado.");

      const description = topUsers
        .map((user, index) => `**${index + 1}.** <@${user.id}> — **${user.coins} ANF Coins**`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🏆 Ranking de ANF Coins")
        .setDescription(description)
        .setColor("Gold")
        .setFooter({ text: "Quem será o maior colecionador de ANF Coins?" });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Erro no comando top:", err);
      message.reply("❌ Ocorreu um erro ao tentar exibir o ranking.");
    }
  }
};
