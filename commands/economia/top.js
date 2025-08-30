import { EmbedBuilder } from "discord.js";
import Database from "better-sqlite3";

const db = new Database("economia.sqlite");

export default {
  name: ["leaderboard", "top"],
  description: "Mostra o ranking de moedas.",
  execute(message) {
    const top = db
      .prepare("SELECT * FROM users ORDER BY coins DESC LIMIT 10")
      .all();

    if (top.length === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏆 Ranking de Riqueza")
            .setDescription("Ninguém tem moedas ainda!")
            .setColor("Red")
        ]
      });
    }

    const lista = top
      .map((user, i) => `**#${i + 1}** — <@${user.id}> • 💰 ${user.coins}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Ranking de Riqueza")
      .setDescription(lista)
      .setColor("Gold")
      .setFooter({ text: "Top 10 usuários mais ricos" });

    message.channel.send({ embeds: [embed] });
  }
};
