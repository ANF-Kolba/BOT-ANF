import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins, setDaily } from "../../utils/database.js";

export default {
  name: "daily",
  description: "Receba sua recompensa diária de ANF Coins",
  async execute(message) {
    const user = await getUser(message.author.id);
    const now = Date.now();
    const diff = now - (user.lastDaily || 0);

    if (diff < 24*60*60*1000) {
      const horas = Math.floor((24*60*60*1000 - diff)/3600000);
      const minutos = Math.floor(((24*60*60*1000 - diff)%3600000)/60000);
      return message.reply(`⏳ Você já recebeu sua diária! Tente novamente em ${horas}h ${minutos}m.`);
    }

    const valor = 100; // diário fixo
    await updateCoins(message.author.id, valor);
    await setDaily(message.author.id, now);

    const embed = new EmbedBuilder()
      .setTitle("💰 Recompensa diária")
      .setDescription(`${message.author} recebeu **${valor} ANF Coins**!`)
      .setColor("Green");

    message.channel.send({ embeds: [embed] });
  }
};
