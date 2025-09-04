import { Tag } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "addtag",
  description: "Adiciona uma nova tag à loja (admin only)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Você não tem permissão.");

    if (args.length < 2) return message.reply("❌ Use: !addtag {preço} {nome da tag com emojis}");

    const price = parseInt(args.shift());
    const name = args.join(" ");

    if (isNaN(price)) return message.reply("❌ Preço inválido.");

    const tag = await Tag.create({ name, price });
    const embed = new EmbedBuilder()
      .setTitle("🛒 Tag adicionada!")
      .setDescription(`✅ Tag **${name}** adicionada à loja por ${price} coins.`)
      .setColor("Green");

    return message.channel.send({ embeds: [embed] });
  }
};
