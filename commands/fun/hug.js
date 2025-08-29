import { EmbedBuilder } from 'discord.js';

export default {
  name: "hug",
  description: "Abraça alguém!",
  async execute(message) {
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("❌ Mencione alguém para abraçar!");
    }

    const gifs = [
      "https://media.tenor.com/2roX3uxz_68AAAAC/hug-anime.gif",
      "https://media.tenor.com/3bTxZ4HdrysAAAAC/anime-hug.gif"
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setDescription(`${message.author} deu um abraço em ${user} ❤️`)
      .setImage(gif)
      .setColor("#7506beff"); // cor rosa, pode mudar

    await message.channel.send({ embeds: [embed] });
  }
};
