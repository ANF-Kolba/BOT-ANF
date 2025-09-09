import { EmbedBuilder } from "discord.js";
import { Inventory, Cosmetic, Tag, getUser } from "../../utils/database.js";
import { Op } from "sequelize";

export default {
  name: "equipar",
  description: "Equipe um banner, ícone ou tag do inventário (até 3 tags por vez em posições diferentes)",
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply("❌ Use: `!equipar banner {nome}`, `!equipar icon {nome}` ou `!equipar tag {slot} {nome}` (slots de 1 a 3)");
    }

    const tipo = args[0].toLowerCase();

    if (!["banner", "icon", "tag"].includes(tipo)) {
      return message.reply("❌ Tipo inválido! Use `banner`, `icon` ou `tag`.");
    }

    // Garantir que o usuário exista
    const user = await getUser(message.author.id);

    if (tipo === "tag") {
      const slot = parseInt(args[1]);
      if (![1, 2, 3].includes(slot)) {
        return message.reply("❌ Informe um slot válido (1, 2 ou 3). Exemplo: `!equipar tag 2 Fire`");
      }

      const nome = args.slice(2).join(" ");
      const tag = await Tag.findOne({ where: { name: nome } });
      if (!tag) return message.reply(`❌ Tag **${nome}** não encontrada.`);

      // Verifica se o usuário possui essa tag
      const inv = await Inventory.findOne({ where: { userId: message.author.id, tagId: tag.id } });
      if (!inv) return message.reply(`❌ Você não possui a tag **${nome}**.`);

      // Desmarcar qualquer tag que esteja equipada no mesmo slot
      await Inventory.update(
        { equipped: false },
        { where: { userId: message.author.id, equippedSlot: slot, tagId: { [Op.ne]: null } } }
      );

      // Atualizar slot da tag escolhida
      inv.equipped = true;
      inv.equippedSlot = slot; // precisa existir no banco
      await inv.save();

      const embed = new EmbedBuilder()
        .setTitle("🎨 Tag equipada!")
        .setDescription(`Você equipou a tag **${tag.name}** no slot ${slot}.`)
        .setColor("Blue");

      return message.channel.send({ embeds: [embed] });
    } else {
      // Banner ou ícone
      const nome = args.slice(1).join(" ");
      const item = await Cosmetic.findOne({ where: { name: nome, type: tipo } });
      if (!item) return message.reply(`❌ ${tipo} não encontrado.`);

      const possui = await Inventory.findOne({ where: { userId: message.author.id, cosmeticId: item.id } });
      if (!possui) return message.reply(`❌ Você não possui esse ${tipo}.`);

      if (tipo === "banner") user.equippedBanner = item.id;
      else if (tipo === "icon") user.equippedIcon = item.id;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("🎨 Equipado!")
        .setDescription(`Você equipou **${item.name}** (${tipo}).`)
        .setColor("Blue");

      if (tipo !== "tag") embed.setImage(item.url);

      return message.channel.send({ embeds: [embed] });
    }
  }
};
