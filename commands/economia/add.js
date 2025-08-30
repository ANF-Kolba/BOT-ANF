import { EmbedBuilder } from "discord.js";
import { addItemToShop } from "../../utils/database.js";

export default {
  name: "additem",
  description: "Adiciona um item à loja (apenas administradores).",
  execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Acesso Negado")
            .setDescription("Você precisa ser administrador para usar este comando.")
            .setColor("Red")
        ]
      });
    }

    const [nome, preco] = args;
    const itemName = nome?.trim();
    const itemPrice = parseInt(preco);

    if (!itemName || isNaN(itemPrice)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Erro ao adicionar item")
            .setDescription("Uso correto: `!additem <nome> <preço>`")
            .setColor("Red")
        ]
      });
    }

    addItemToShop(itemName, itemPrice);

    const embed = new EmbedBuilder()
      .setTitle("✅ Item Adicionado à Loja")
      .setDescription(`O item **${itemName}** foi adicionado à loja por 💰 **${itemPrice}** moedas.`)
      .setColor("Green")
      .setFooter({ text: "Itens da loja sempre atualizados!" });

    message.reply({ embeds: [embed] });
  }
};

