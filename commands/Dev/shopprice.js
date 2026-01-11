import { getShopItemById, updateShopPrice } from "../../utils/database.js";

export default {
  name: "shopprice",
  category: "dev",
  hidden: true,
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Sem permissão.");

    const id = Number(args[0]);
    const price = Number(args[1]);

    if (!id || isNaN(price))
      return message.reply("❌ Use: shopprice <id> <preço>");

    const item = await getShopItemById(id);
    if (!item) return message.reply("❌ Item não encontrado.");

    await updateShopPrice(id, price);
    message.reply(`💰 Preço de **${item.item}** atualizado para ${price}.`);
  },
};
