import { EmbedBuilder } from "discord.js";
import { getUser } from "../../utils/database.js";

export default {
  name: "setdesc",
  description: "Define a descrição do seu perfil",
  async execute(message, args) {
    const desc = args.join(" ");
    if (!desc) {
      return message.reply("❌ Você precisa escrever uma descrição. Ex: `!setdesc Eu amo programar bots!`");
    }

    if (desc.length > 100) {
      return message.reply("❌ Sua descrição deve ter no máximo **100 caracteres**.");
    }

    try {
      const user = await getUser(message.author.id);
      user.description = desc;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("✍️ Descrição atualizada!")
        .setDescription(`✅ Sua nova descrição foi definida como:\n\n**${desc}**`)
        .setColor("Blue");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Erro ao salvar descrição:", err);
      return message.reply("❌ Ocorreu um erro ao tentar salvar sua descrição.");
    }
  }
};
