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
  "https://media1.tenor.com/m/MbSf5DKcHwQAAAAd/anime-hug.gif",
  "https://media1.tenor.com/m/kf36zSCz-D0AAAAd/anime-hug-hug.gif",
  "https://media1.tenor.com/m/HBTbcCNvLRIAAAAC/syno-i-love-you-syno.gif",
  "https://media1.tenor.com/m/FYKsVaNI7lkAAAAd/anime-hug.gif",
  "https://media1.tenor.com/m/_4J8pjgYiKMAAAAd/anime-hug.gif",
  "https://media.tenor.com/images/[ID1]/anime-hug.gif", 
  "https://media.tenor.com/images/[ID2]/anime-hug-kawaii.gif",
  "https://media.tenor.com/images/[ID3]/anime-hug.gif",
  "https://media.tenor.com/images/13221040ff7f8cbb1a85b6565c4b8868/tenor.gif", 
  "https://media.tenor.com/images/22839308c0b4b9fb782ae8e5f7e6cb7c/tenor.gif", 
  "https://media.tenor.com/images/19674744a6dd192d45ce9cae16c235a4/tenor.gif", 
  "https://media.tenor.com/images/13964328c5a70aa7eea47aabea3e1e5a/tenor.gif",
  "https://media.tenor.com/images/[ID4]/hug-anime.gif"
];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setDescription(`${message.author} deu um abraço em ${user} ❤️`)
      .setImage(gif)
      .setColor("#aa69ff"); // cor rosa, pode mudar

    await message.channel.send({ embeds: [embed] });
  }
};
