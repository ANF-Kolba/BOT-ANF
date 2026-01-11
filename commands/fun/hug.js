import { EmbedBuilder } from 'discord.js';

export default {
  name: "hug",
  description: "Abraça alguém!",
  async execute(message) {
    console.log(`Comando hug chamado por ${message.author.tag}`);

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("❌ Mencione alguém para abraçar!");
    }

    const gifs = [
  "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
  "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
  "https://media.giphy.com/media/3ZnBrkqoaI2hq/giphy.gif",
  "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
  "https://media.giphy.com/media/svXXBgduBsJ1u/giphy.gif",
  "https://media.giphy.com/media/49mdjsMrH7oze/giphy.gif",
  "https://media.giphy.com/media/3oEduV5V6dXk6g9t4I/giphy.gif",
  "https://media.giphy.com/media/3oEduV5V6dXk6g9t4I/giphy.gif",
  "https://media.giphy.com/media/3oEduV5V6dXk6g9t4I/giphy.gif",
  "https://media.giphy.com/media/3oEduV5V6dXk6g9t4I/giphy.gif"
];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setDescription(`${message.author} deu um abraço em ${user} ❤️`)
      .setImage(gif)
      .setColor("#aa69ff");

    await message.channel.send({ embeds: [embed] });
  }
};
