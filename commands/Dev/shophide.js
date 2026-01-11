import { getShopItemById, hideShopItem } from "../../utils/database.js";

export default {
  name: "shophide",
  category: "dev",
  hidden: true,
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Sem permissão.");

    const id = Number(args[0]);
    if (!id) return message.reply("❌ Use: shophide <id>");

    const item = await getShopItemById(id);
    if (!item) return message.reply("❌ Item não encontrado.");

    await hideShopItem(id);
    message.reply(`🚫 Item **${item.item}** ocultado da loja.`);
  },
};
