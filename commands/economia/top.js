import { EmbedBuilder } from "discord.js";
import Database from "better-sqlite3";

const db = new Database("economia.sqlite");

export default {
  name: "top",
  description: "Mostra o ranking de moedas.",
  execute(message) {
    // Adicionando um log para verificar se o comando está sendo chamado
    console.log("Comando 'top' executado.");

    try {
      const top = db
        .prepare("SELECT * FROM users ORDER BY coins DESC LIMIT 10")
        .all();

      // Verificando se a consulta ao banco retornou dados
      console.log("Resultado da consulta ao banco:", top);

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

    } catch (error) {
      // Caso haja um erro na consulta ou em outro lugar
      console.error("Erro ao executar o comando 'top':", error);
      message.reply("❌ Ocorreu um erro ao buscar o ranking de moedas.");
    }
  }
};
