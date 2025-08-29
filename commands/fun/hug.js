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
  "https://tenor.com/view/hugs-anime-hug-anime-cute-blush-gif-21401206",
  "https://tenor.com/view/anime-hug-kawaii-hugs-gif-9862193",
  "https://tenor.com/view/anime-hug-gif-21597443",
  "https://tenor.com/view/anime-hug-gif-13221040",
  "https://tenor.com/view/anime-hug-surprised-sad-gif-12668473",
  "https://tenor.com/view/anime-hug-hug-hanakokun-yashiro-nene-gif-16852734",
  "https://tenor.com/view/anime-hug-gif-13964328",
  "https://tenor.com/view/anime-hug-gif-22264928",
  "https://tenor.com/view/anime-hug-gif-22952119",
  "https://tenor.com/view/hug-anime-hug-anime-cute-uwu-gif-17264448"
];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setDescription(`${message.author} deu um abraço em ${user} ❤️`)
      .setImage(gif)
      .setColor("#FF69B4"); // cor rosa, pode mudar

    await message.channel.send({ embeds: [embed] });
  }
};
