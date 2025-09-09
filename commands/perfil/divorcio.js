import { getUser } from "../../utils/database.js";

export default {
  name: "divórcio",
  description: "Divorcie-se 😢",
  async execute(message) {
    const autor = await getUser(message.author.id);

    if (!autor.marriedWith) {
      return message.reply("❌ Você não está casado.");
    }

    const parceiro = await getUser(autor.marriedWith);

    autor.marriedWith = null;
    parceiro.marriedWith = null;

    await autor.save();
    await parceiro.save();

    message.channel.send(`💔 ${message.author} se divorciou de <@${parceiro.id}>.`);
  },
};
