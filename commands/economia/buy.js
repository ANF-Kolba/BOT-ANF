import { EmbedBuilder } from "discord.js";
import { ShopItem, Cosmetic, User, Inventory } from "../../utils/database.js";

export default {
  name: "buy",
  description: "Comprar item, lootbox, cosmético ou cargo na loja",
  async execute(message, args) {
    if (!args[0]) return message.reply("❌ Use: `!buy {nome-do-item}`");

    const itemName = args.join(" ");

    let shopItem = await ShopItem.findOne({ where: { item: itemName } });
    let cosmetic = await Cosmetic.findOne({ where: { name: itemName } });

    if (!shopItem && !cosmetic) return message.reply("❌ Item ou cosmético não encontrado.");

    const user = await User.findByPk(message.author.id) || await User.create({ id: message.author.id });
    const price = shopItem ? shopItem.price : cosmetic.price;

    if (user.coins < price) return message.reply("❌ Você não tem coins suficientes.");

    user.coins -= price;
    await user.save();

    if (shopItem) {
      switch (shopItem.type) {
        case "item":
        case "lootbox":
          await Inventory.create({ userId: user.id, item: shopItem.item });
          break;
        case "banner":
        case "icon":
          if (!cosmetic) cosmetic = await Cosmetic.findOne({ where: { name: shopItem.item, type: shopItem.type } });
          await Inventory.create({ userId: user.id, cosmeticId: cosmetic.id });
          break;
        case "role":
          const member = await message.guild.members.fetch(user.id);
          const role = message.guild.roles.cache.get(shopItem.reference);
          if (!role) return message.reply("❌ Cargo não encontrado no servidor.");
          await member.roles.add(role);
          break;
      }
    } else if (cosmetic) {
      await Inventory.create({ userId: user.id, cosmeticId: cosmetic.id });
    }

    const embed = new EmbedBuilder()
      .setTitle("✅ Compra realizada!")
      .setDescription(`Você comprou **${itemName}** por ${price} coins.`)
      .setColor("Green");

    return message.channel.send({ embeds: [embed] });
  }
};
