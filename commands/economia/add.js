import { addItemToShop } from "../../utils/database.js";

export default {
  name: "additem",
  description: "Adiciona um item à loja (apenas administradores).",
  execute(message, args) {
   if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você precisa ser administrador para usar este comando.");
    }

    const [nome, preco] = args;
    const itemName = nome?.trim();
    const itemPrice = parseInt(preco);

    if (!itemName || isNaN(itemPrice)) {
      return message.reply("Uso correto: `!additem <nome> <preço>`");
    }

    addItemToShop(itemName, itemPrice);
    message.reply(`✅ Item **${itemName}** adicionado à loja por 💰 ${itemPrice} moedas.`);
  }
};

