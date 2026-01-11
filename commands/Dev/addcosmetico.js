import { Cosmetic, ShopItem } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "addcosmetic",
  description: "Adiciona banner ou ícone e coloca na loja",
  category: "dev",
  hidden: true,

  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Sem permissão.");
    }

    const type = args[0]?.toLowerCase();
    const price = parseInt(args[args.length - 1]);
    const url = args[args.length - 2];
    const name = args.slice(1, -2).join(" ");

    if (!["banner", "icon"].includes(type)) {
      return message.reply("❌ Use banner ou icon.");
    }

    if (!name || !url || isNaN(price)) {
      return message.reply(
        "❌ Use: !addcosmetic <banner|icon> <nome> <url> <preço>"
      );
    }

    const exists = await Cosmetic.findOne({ where: { name, type } });
    if (exists) {
      return message.reply("❌ Cosmético já existe.");
    }

    // 🎨 cria cosmético
    const cosmetic = await Cosmetic.create({ name, type, url, price });

    // 🛒 cria item na loja
    await ShopItem.create({
      item: name,
      price,
      type,
      reference: cosmetic.id.toString(),
    });

    const embed = new EmbedBuilder()
      .setTitle("🎨 Cosmético adicionado!")
      .setDescription(
        `**${name}** (${type})\n💰 ${price} coins\n🆔 ID: ${cosmetic.id}`
      )
      .setImage(url)
      .setColor("Green");

    return message.channel.send({ embeds: [embed] });
  },
};
