import { EmbedBuilder } from "discord.js";
import { ShopItem } from "../../utils/database.js";

export default {
  name: "addrole",
  description: "Adiciona um cargo à loja (admin only)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você não tem permissão para isso.");
    }

    if (args.length < 2) {
      return message.reply("❌ Use: `!addrole {nome-do-item} {@cargo} {preço}`");
    }

    // Separar nome do item, cargo e preço
    const role = message.mentions.roles.first();
    if (!role) return message.reply("❌ Você precisa mencionar o cargo.");

    // Remover a menção do cargo dos argumentos
    const mentionIndex = args.findIndex(a => a.includes(role.id));
    const itemName = args.slice(0, mentionIndex).join(" ");
    const priceArg = args.slice(mentionIndex + 1).join(" ");
    const price = parseInt(priceArg);

    if (isNaN(price) || price < 0) return message.reply("❌ Preço inválido.");

    // Adicionar à loja
    await ShopItem.upsert({
      item: itemName,
      price,
      type: "role",
      reference: role.id
    });

    const embed = new EmbedBuilder()
      .setTitle("🛒 Cargo adicionado à loja!")
      .setDescription(`✅ O cargo **${role.name}** foi adicionado à loja como **${itemName}** por ${price} coins.`)
      .setColor("Blue");

    return message.channel.send({ embeds: [embed] });
  }
};
