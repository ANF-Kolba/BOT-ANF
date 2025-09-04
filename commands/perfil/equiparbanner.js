import { EmbedBuilder } from "discord.js";
import { User, Cosmetic, Inventory, getUser } from "../../utils/database.js";

export default {
  name: "equipar",
  description: "Equipe um banner ou ícone do inventário",
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply("❌ Use: `!equipar banner {nome}` ou `!equipar icon {nome}`");
    }

    const tipo = args[0].toLowerCase();
    const nome = args.slice(1).join(" ");

    if (!["banner", "icon"].includes(tipo)) {
      return message.reply("❌ Tipo inválido! Use `banner` ou `icon`.");
    }

    // Procurar cosmético pelo nome e tipo
    const cosmetic = await Cosmetic.findOne({ where: { name: nome, type: tipo } });
    if (!cosmetic) {
      return message.reply("❌ Cosmético não encontrado.");
    }

    // Verificar se o usuário possui esse cosmético
    const possui = await Inventory.findOne({
      where: { userId: message.author.id, cosmeticId: cosmetic.id }
    });
    if (!possui) {
      return message.reply("❌ Você não possui esse cosmético.");
    }

    // Garantir que o usuário exista
    const user = await getUser(message.author.id);

    // Equipar o cosmético
    if (tipo === "banner") {
      user.equippedBanner = cosmetic.id;
    } else {
      user.equippedIcon = cosmetic.id;
    }
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🎨 Cosmético equipado!")
      .setDescription(`Você equipou o **${cosmetic.name}** (${tipo}).`)
      .setImage(cosmetic.url)
      .setColor("Blue");

    return message.channel.send({ embeds: [embed] });
  }
};
