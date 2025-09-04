import { EmbedBuilder } from "discord.js";
import { getUser, Inventory, Cosmetic, Tag } from "../../utils/database.js";

export default {
  name: "removeitem",
  description: "Remove um item, cosmético ou tag do inventário de um usuário (admin only)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você não tem permissão para isso.");
    }

    const alvo = message.mentions.users.first();
    if (!alvo) return message.reply("❌ Você precisa mencionar um usuário válido.");

    if (args.length < 2) {
      return message.reply("❌ Use: `!removeitem @usuario {nome-do-item} [cosmetic/tag]`");
    }

    const itemName = args[1];
    const tipo = args[2]?.toLowerCase(); // opcional: "cosmetic" ou "tag"

    try {
      const user = await getUser(alvo.id);
      let item;

      if (tipo === "cosmetic") {
        const cosmetic = await Cosmetic.findOne({ where: { name: itemName } });
        if (!cosmetic) return message.reply(`❌ Cosmético **${itemName}** não encontrado.`);
        item = await Inventory.findOne({ where: { userId: user.id, cosmeticId: cosmetic.id } });

      } else if (tipo === "tag") {
        item = await Inventory.findOne({
          where: { userId: user.id },
          include: [{ model: Tag, as: "tag", where: { name: itemName } }]
        });
        if (!item) return message.reply(`❌ Tag **${itemName}** não encontrada no inventário do usuário.`);

      } else {
        item = await Inventory.findOne({ where: { userId: user.id, item: itemName } });
      }

      if (!item) return message.reply(`❌ O usuário não possui **${itemName}**.`);

      await item.destroy();

      const embed = new EmbedBuilder()
        .setTitle("🗑️ Item removido!")
        .setDescription(`✅ O ${tipo === "cosmetic" ? "cosmético" : tipo === "tag" ? "tag" : "item"} **${itemName}** foi removido do inventário de ${alvo}.`)
        .setColor("Red");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Erro ao remover item:", err);
      return message.reply("❌ Ocorreu um erro ao tentar remover o item.");
    }
  }
};
