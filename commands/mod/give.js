import { EmbedBuilder } from "discord.js";
import { getUser, Inventory, Cosmetic } from "../../utils/database.js";

export default {
  name: "giveitem",
  description: "Adiciona um item ou cosmético ao inventário de um usuário (admin only)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você não tem permissão para isso.");
    }

    const alvo = message.mentions.users.first();
    if (!alvo) return message.reply("❌ Você precisa mencionar um usuário válido.");

    if (args.length < 2) {
      return message.reply("❌ Use: `!giveitem @usuario {nome-do-item} [cosmetic]`");
    }

    const itemName = args[1];
    const tipo = args[2]?.toLowerCase(); // opcional: "cosmetic"

    try {
      const user = await getUser(alvo.id);
      let createdItem;

      if (tipo === "cosmetic") {
        const cosmetic = await Cosmetic.findOne({ where: { name: itemName } });
        if (!cosmetic) return message.reply(`❌ Cosmético **${itemName}** não encontrado.`);
        createdItem = await Inventory.create({ userId: user.id, cosmeticId: cosmetic.id });
      } else {
        createdItem = await Inventory.create({ userId: user.id, item: itemName });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎁 Item entregue!")
        .setDescription(`✅ O ${tipo === "cosmetic" ? "cosmético" : "item"} **${itemName}** foi adicionado ao inventário de ${alvo}.`)
        .setColor("Green");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Erro ao dar item:", err);
      return message.reply("❌ Ocorreu um erro ao tentar adicionar o item.");
    }
  }
};
