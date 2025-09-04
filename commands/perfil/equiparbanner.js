import { EmbedBuilder } from "discord.js";
import { Inventory, Cosmetic, Tag, getUser } from "../../utils/database.js";

export default {
  name: "equipar",
  description: "Equipe um banner, ícone ou tag do inventário (suporta múltiplas tags)",
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply("❌ Use: `!equipar banner {nome}`, `!equipar icon {nome}` ou `!equipar tag {nome}` (várias tags podem ser equipadas separando por vírgula)");
    }

    const tipo = args[0].toLowerCase();
    const nomes = args.slice(1).join(" ").split(",").map(n => n.trim());

    if (!["banner", "icon", "tag"].includes(tipo)) {
      return message.reply("❌ Tipo inválido! Use `banner`, `icon` ou `tag`.");
    }

    // Garantir que o usuário exista
    const user = await getUser(message.author.id);

    if (tipo === "tag") {
      // Desmarcar todas as tags equipadas anteriores
      await Inventory.update({ equipped: false }, { where: { userId: message.author.id, tagId: { [Op.ne]: null } } });

      const tagsEquipadas = [];
      for (const nome of nomes) {
        const tag = await Tag.findOne({ where: { name: nome } });
        if (!tag) continue;

        // Verifica se o usuário possui essa tag
        const inv = await Inventory.findOne({ where: { userId: message.author.id, tagId: tag.id } });
        if (!inv) continue;

        inv.equipped = true;
        await inv.save();
        tagsEquipadas.push(tag.name);
      }

      if (tagsEquipadas.length === 0) return message.reply("❌ Nenhuma das tags informadas pôde ser equipada (não possui ou não existem).");

      const embed = new EmbedBuilder()
        .setTitle("🎨 Tags equipadas!")
        .setDescription(`Você equipou as seguintes tags: **${tagsEquipadas.join(", ")}**`)
        .setColor("Blue");

      return message.channel.send({ embeds: [embed] });
    } else {
      // Banner ou ícone
      const nome = nomes[0];
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
