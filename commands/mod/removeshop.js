import { EmbedBuilder } from "discord.js";
import { ShopItem, Cosmetic, Tag } from "../../utils/database.js";

export default {
  name: "removeshop",
  description: "Remove um item, cosmético, cargo ou tag da loja (admin only)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você não tem permissão para isso.");
    }

    if (!args.length) return message.reply("❌ Use: `!removeshop {nome-do-item}` ou `!removeshop {@role}`");

    const input = args.join(" ");

    try {
      // Tenta remover item da ShopItem
      let shopItem = await ShopItem.findOne({ where: { item: input } });

      // Se não encontrar, tenta cargo mencionado
      if (!shopItem && message.mentions.roles.size > 0) {
        const role = message.mentions.roles.first();
        shopItem = await ShopItem.findOne({ where: { reference: role.id, type: "role" } });
      }

      if (shopItem) {
        await shopItem.destroy();
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("🛒 Item removido da loja!")
              .setDescription(`✅ O item/cargo **${input}** foi removido da loja com sucesso.`)
              .setColor("Red"),
          ],
        });
      }

      // Tenta remover cosmético
      const cosmetic = await Cosmetic.findOne({ where: { name: input } });
      if (cosmetic) {
        await cosmetic.destroy();
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("🛒 Cosmético removido da loja!")
              .setDescription(`✅ O cosmético **${input}** foi removido da loja com sucesso.`)
              .setColor("Red"),
          ],
        });
      }

      // Tenta remover tag
      const tag = await Tag.findOne({ where: { name: input } });
      if (tag) {
        await tag.destroy();
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("🏷️ Tag removida da loja!")
              .setDescription(`✅ A tag **${input}** foi removida da loja com sucesso.`)
              .setColor("Red"),
          ],
        });
      }

      return message.reply(`❌ O item, cosmético, cargo ou tag **${input}** não existe na loja.`);
    } catch (err) {
      console.error("Erro ao remover item da loja:", err);
      return message.reply("❌ Ocorreu um erro ao tentar remover o item da loja.");
    }
  }
};
