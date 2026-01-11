import { ShopItem, Cosmetic, Tag, Inventory } from "../../utils/database.js";

export default {
  name: "remove",
  description: "Remove um item, cosmético ou tag do banco de dados",
  category: "dev",
  hidden: true,

  async execute(message, args) {
    // 🔐 Apenas administrador
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você não tem permissão para usar este comando.");
    }

    const tipo = args[0]; // item | banner | icon | tag
    const identificador = args.slice(1).join(" ");

    if (!tipo || !identificador) {
      return message.reply(
        "❌ Uso correto:\n" +
        "`!remove item <nome>`\n" +
        "`!remove banner <id | nome>`\n" +
        "`!remove icon <id | nome>`\n" +
        "`!remove tag <id | nome>`"
      );
    }

    let removido = false;

    // =====================
    // 🧺 ITEM DE LOJA (por nome)
    // =====================
    if (tipo === "item") {
      removido = await ShopItem.destroy({
        where: { item: identificador },
      });

      await Inventory.destroy({
        where: { item: identificador },
      });
    }

    // =====================
    // 🎨 COSMÉTICO (ID OU NOME)
    // =====================
    if (tipo === "banner" || tipo === "icon") {
      let cosmetic;

      if (!isNaN(Number(identificador))) {
        // 🔢 Buscar por ID
        cosmetic = await Cosmetic.findByPk(Number(identificador));
      } else {
        // 🔤 Buscar por nome
        cosmetic = await Cosmetic.findOne({
          where: { name: identificador },
        });
      }

      if (!cosmetic) {
        return message.reply("❌ Cosmético não encontrado.");
      }

      await Inventory.destroy({
        where: { cosmeticId: cosmetic.id },
      });

      removido = await Cosmetic.destroy({
        where: { id: cosmetic.id },
      });

      if (removido) {
        return message.reply(
          `✅ Cosmético **${cosmetic.name}** removido com sucesso!`
        );
      }
    }

    // =====================
    // 🏷️ TAG (ID OU NOME)
    // =====================
    if (tipo === "tag") {
      let tag;

      if (!isNaN(Number(identificador))) {
        tag = await Tag.findByPk(Number(identificador));
      } else {
        tag = await Tag.findOne({
          where: { name: identificador },
        });
      }

      if (!tag) {
        return message.reply("❌ Tag não encontrada.");
      }

      await Inventory.destroy({
        where: { tagId: tag.id },
      });

      removido = await Tag.destroy({
        where: { id: tag.id },
      });

      if (removido) {
        return message.reply(
          `✅ Tag **${tag.name}** removida com sucesso!`
        );
      }
    }

    if (!removido) {
      return message.reply("❌ Nada foi removido.");
    }

    return message.reply("✅ Item removido com sucesso!");
  },
};
