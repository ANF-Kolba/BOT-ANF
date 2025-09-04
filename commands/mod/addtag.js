import { Tag } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "addtag",
  description: "Adiciona uma nova tag à loja (admin only)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Você não tem permissão.");

    if (args.length < 3)
      return message.reply("❌ Use: !addtag {preço} {nome da tag} {emoji}");

    const price = parseInt(args.shift());
    const emoji = args.pop(); // último argumento é o emoji
    const name = args.join(" "); // tudo que sobrou é o nome

    if (isNaN(price)) return message.reply("❌ Preço inválido.");
    if (!emoji) return message.reply("❌ Você precisa colocar um emoji para a tag.");

    const tag = await Tag.create({ name, tag: emoji, price });

    const embed = new EmbedBuilder()
      .setTitle("🛒 Tag adicionada!")
      .setDescription(`✅ Tag **${name} ${emoji}** adicionada à loja por ${price} coins.`)
      .setColor("Green");

    return message.channel.send({ embeds: [embed] });
  }
};
