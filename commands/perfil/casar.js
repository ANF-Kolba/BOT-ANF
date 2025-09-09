import { EmbedBuilder } from "discord.js";
import { getUser, User } from "../../utils/database.js";

export default {
  name: "casar",
  description: "Case-se com alguém 💍",
  async execute(message) {
    const alvo = message.mentions.users.first();
    if (!alvo) {
      return message.reply("❌ Você precisa mencionar alguém para casar!");
    }
    if (alvo.id === message.author.id) {
      return message.reply("❌ Você não pode casar consigo mesmo!");
    }

    const autor = await getUser(message.author.id);
    const parceiro = await getUser(alvo.id);

    if (autor.marriedWith) {
      return message.reply("❌ Você já está casado!");
    }
    if (parceiro.marriedWith) {
      return message.reply("❌ Esse usuário já está casado!");
    }

    const embed = new EmbedBuilder()
      .setTitle("💍 Pedido de Casamento")
      .setDescription(`${alvo}, você aceita se casar com ${message.author}?`)
      .setColor("Pink");

    const msg = await message.channel.send({ content: `${alvo}`, embeds: [embed] });

    try {
      const filter = (m) =>
        m.author.id === alvo.id &&
        ["sim", "aceito", "aceitar", "não", "nao", "recusar"].includes(m.content.toLowerCase());

      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
      const resposta = collected.first()?.content.toLowerCase();

      if (["sim", "aceito", "aceitar"].includes(resposta)) {
        autor.marriedWith = alvo.id;
        parceiro.marriedWith = message.author.id;
        await autor.save();
        await parceiro.save();

        return message.channel.send(
          `🎉 Parabéns ${message.author} e ${alvo}, agora vocês estão **casados**! 💖`
        );
      } else {
        return message.channel.send(`💔 ${alvo} recusou o pedido de casamento.`);
      }
    } catch {
      return message.channel.send("⌛ O pedido de casamento expirou.");
    }
  },
};
