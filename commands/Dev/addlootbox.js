import { addItemToShop } from "../../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "addlootbox",
  description: "Adiciona uma lootbox à loja",
   category: "dev",
  hidden: true,
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Sem permissão.");

    const name = args[0];
    const price = parseInt(args[1]) || 0;

    if (!name) return message.reply("❌ Use: !addlootbox {nome} {preço}");

    await addItemToShop(name, price, "lootbox");
    const embed = new EmbedBuilder()
      .setTitle("🎁 Lootbox adicionada!")
      .setDescription(`Lootbox **${name}** adicionada à loja por ${price} coins.`)
      .setColor("Green");

    return message.channel.send({ embeds: [embed] });
  }
};
