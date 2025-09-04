import { EmbedBuilder } from "discord.js";
import { User, Cosmetic, Tag, Inventory, getUser } from "../../utils/database.js";

export default {
  name: "equipar",
  description: "Equipe um banner, ícone ou tag do inventário",
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply("❌ Use: `!equipar banner {nome}`, `!equipar icon {nome}` ou `!equipar tag {nome}`");
    }

    const tipo = args[0].toLowerCase();
    const nome = args.slice(1).join(" ");

    if (!["banner", "icon", "tag"].includes(tipo)) {
      return message.reply("❌ Tipo inválido! Use `banner`, `icon` ou `tag`.");
    }

    let item, possui;

    if (tipo === "tag") {
      item = await Tag.findOne({ where: { name: nome } });
      if (!item) return message.reply("❌ Tag não encontrada.");

      // Corrigido: verificar se o usuário possui a tag no inventário
      possui = await Inventory.findOne({
        where: { userId: message.author.id, tagId: item.id }
      });

    } else {
      item = await Cosmetic.findOne({ where: { name: nome, type: tipo } });
      if (!item) return message.reply("❌ Cosmético não encontrado.");

      possui = await Inventory.findOne({
        where: { userId: message.author.id, cosmeticId: item.id }
      });
    }

    if (!possui) return message.reply(`❌ Você não possui esse ${tipo}.`);

    // Garantir que o usuário exista
    const user = await getUser(message.author.id);

    // Equipar item
    if (tipo === "banner") user.equippedBanner = item.id;
    else if (tipo === "icon") user.equippedIcon = item.id;
    else if (tipo === "tag") user.equippedTagId = item.id;

    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🎨 Equipado!")
      .setDescription(`Você equipou **${item.name}${tipo === "tag" && item.tag ? " " + item.tag : ""}** (${tipo}).`)
      .setColor("Blue");

    // Adicionar imagem se for banner ou ícone
    if (tipo !== "tag") embed.setImage(item.url);

    return message.channel.send({ embeds: [embed] });
  }
};
