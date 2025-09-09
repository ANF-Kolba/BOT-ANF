import { Cosmetic } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "addcosmetic",
  description: "Adiciona um banner ou ícone ao banco | Use: !addcosmetic {banner|icon} {nome} {url} {preço}",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Sem permissão.");

    const type = args[0]?.toLowerCase(); // banner ou icon
    const name = args[1];
    const url = args[2];
    const price = parseInt(args[3]) || 0;

    if (!["banner", "icon"].includes(type)) return message.reply("❌ Tipo inválido! Use banner ou icon.");
    if (!name || !url) return message.reply("❌ Use: !addcosmetic {banner|icon} {nome} {url} {preço}");

    const exists = await Cosmetic.findOne({ where: { name, type } });
    if (exists) return message.reply("❌ Cosmético já existe.");

    const cosmetic = await Cosmetic.create({ name, type, url, price });

    const embed = new EmbedBuilder()
      .setTitle("🎨 Cosmético adicionado!")
      .setDescription(`**${cosmetic.name}** (${cosmetic.type}) adicionado ao banco.`)
      .setImage(cosmetic.url)
      .setColor("Blue");

    return message.channel.send({ embeds: [embed] });
  }
};
