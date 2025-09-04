import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins } from "../../utils/database.js";

export default {
  name: "roubar",
  description: "Tente roubar ANF Coins de outro jogador (cuidado com a polícia!)",
  async execute(message) {
    const alvo = message.mentions.users.first();
    if (!alvo) return message.reply("❌ Mencione alguém para roubar!");
    if (alvo.id === message.author.id) return message.reply("❌ Você não pode se roubar!");

    const user = await getUser(message.author.id);
    const vitima = await getUser(alvo.id);

    const now = Date.now();
    const cooldown = 12 * 60 * 60 * 1000; // 12h
    const diff = now - (user.lastSteal || 0);

    if (diff < cooldown) {
      const restante = cooldown - diff;
      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);
      return message.reply(`⏳ Você já roubou recentemente! Tente novamente em ${horas}h ${minutos}m.`);
    }

    // chance da polícia pegar
    const policiaChance = Math.random();
    if (policiaChance < 0.05) { // 5% chance
      const perda = Math.floor(Math.random() * 101) + 100; // 100 a 200 ANF Coins
      const lost = Math.min(perda, user.coins);
      await updateCoins(user.id, -lost);

      const embed = new EmbedBuilder()
        .setTitle("🚨 Polícia!")
        .setDescription(`${message.author} foi pego pela polícia e perdeu **${lost} ANF Coins**!`)
        .setColor("Red");

      user.lastSteal = now;
      await user.save();

      return message.channel.send({ embeds: [embed] });
    }

    // roubo normal
    const porcentagem = Math.random() * 0.1; // até 10%
    const roubado = Math.min(vitima.coins, Math.floor(vitima.coins * porcentagem));
    await updateCoins(user.id, roubado);
    await updateCoins(vitima.id, -roubado);

    user.lastSteal = now;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🕵️ Roubo realizado!")
      .setDescription(`${message.author} roubou **${roubado} ANF Coins** de ${alvo}!`)
      .setColor("DarkPurple");

    message.channel.send({ embeds: [embed] });
  }
};
