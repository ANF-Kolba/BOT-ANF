import { ShopItem } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "addcosmetico",
  description: "Adiciona um banner ou ícone à loja",
  category: "dev",
  hidden: true,
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Sem permissão.");

    const type = args[0]?.toLowerCase(); // banner ou icon
    if (!["banner", "icon"].includes(type))
      return message.reply("❌ Tipo inválido! Use banner ou icon.");

    const price = parseInt(args[args.length - 1]) || 0;
    const url = args[args.length - 2];

    if (!url) return message.reply("❌ É necessário informar a URL do item.");

    // Nome composto: pega tudo entre type e url
    const name = args.slice(1, args.length - 2).join(" ");
    if (!name) return message.reply("❌ É necessário informar o nome do item.");

    // Criar item no banco
    const item = await ShopItem.create({ type, name, url, price });

    const embed = new EmbedBuilder()
      .setTitle("🎨 Item adicionado à loja!")
      .setDescription(`**${item.name}** (${item.type}) adicionado com sucesso.`)
      .setImage(item.url)
      .setColor("Blue");

    return message.channel.send({ embeds: [embed] });
  },
};
