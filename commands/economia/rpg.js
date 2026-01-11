import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins, Inventory } from "../../utils/database.js";

export default {
  name: "rpg",
  description: "Vá em uma aventura e ganhe ANF Coins ou lootboxes!",
  async execute(message) {
    const user = await getUser(message.author.id);
    const now = Date.now();
    const cooldown = 60 * 60 * 1000; // 1 hora
    const diff = now - (user.lastAdventure?.getTime() || 0);

    if (diff < cooldown) {
      const restante = cooldown - diff;
      const minutos = Math.floor(restante / 60000);
      return message.reply(`⏳ Você já se aventurou! Tente novamente em ${minutos} minutos.`);
    }

    const eventos = [
      { texto: "⚔️ Você derrotou um goblin e ganhou 50 ANF Coins!", moedas: 50 },
      { texto: "👑 Você encontrou um tesouro e ganhou 100 ANF Coins!", moedas: 100 },
      { texto: "🐉 Você enfrentou um dragão mas perdeu 30 ANF Coins.", moedas: -30 },
      { texto: "🌲 Você se perdeu na floresta, nada aconteceu.", moedas: 0 },
      { texto: "🎁 Você encontrou uma Lootbox rara!", moedas: 0, lootbox: "lootbox rara" }
    ];

    const evento = eventos[Math.floor(Math.random() * eventos.length)];

    if (evento.moedas !== 0) await updateCoins(user.id, evento.moedas);
    if (evento.lootbox) await Inventory.create({ userId: user.id, item: evento.lootbox });

    user.lastAdventure = new Date(now);
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🗺️ Aventura")
      .setDescription(`${message.author} foi em uma aventura...\n\n${evento.texto}`)
      .setColor(evento.moedas >= 0 || evento.lootbox ? 0x00ff00 : 0xff0000)
      .setFooter({ text: "Você poderá se aventurar novamente em 1 hora!" });

    message.channel.send({ embeds: [embed] });
  }
};
