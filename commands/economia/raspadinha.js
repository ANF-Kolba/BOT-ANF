import { EmbedBuilder } from "discord.js";
import { User, Inventory, updateCoins, getUser } from "../../utils/database.js";

export default {
  name: "raspadinha",
  description: "Teste sua sorte na raspadinha e ganhe ANF Coins ou Lootbox!",
  async execute(message) {
    try {
      const user = await getUser(message.author.id);

      const now = Date.now();
      const cooldown = 12 * 60 * 60 * 1000; // 12 horas
      const diff = now - (user.lastScratch || 0);

      if (diff < cooldown) {
        const restante = cooldown - diff;
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);
        return message.reply(`⏳ Você já usou a raspadinha! Tente novamente em ${horas}h ${minutos}m.`);
      }

      const premios = [
        { texto: "Nada... que azar! 😭", valor: 0, cor: "Red" },
        { texto: "🎉 Você ganhou 10 ANF Coins!", valor: 10, cor: "Green" },
        { texto: "🎉 Você ganhou 50 ANF Coins!", valor: 50, cor: "Green" },
        { texto: "🎉 Você ganhou 100 ANF Coins!", valor: 100, cor: "Green" },
        { texto: "🎁 Você ganhou uma Lootbox!", valor: 0, lootbox: true, cor: "Gold" }
      ];

      const premio = premios[Math.floor(Math.random() * premios.length)];

      // Adiciona moedas
      if (premio.valor > 0) {
        await updateCoins(message.author.id, premio.valor);
      }

      // Adiciona lootbox
      if (premio.lootbox) {
        await Inventory.create({ userId: message.author.id, item: "Lootbox" });
      }

      // Atualiza cooldown
      user.lastScratch = now;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("🎰 Raspadinha!")
        .setDescription(`${message.author} ${premio.texto}`)
        .setColor(premio.cor)
        .setFooter({ text: "Você poderá jogar novamente em 12 horas!" });

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Erro no comando raspadinha:", err);
      message.reply("❌ Ocorreu um erro ao jogar a raspadinha.");
    }
  }
};
