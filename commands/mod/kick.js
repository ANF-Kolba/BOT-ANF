import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "kick",
  description: "Expulsa um usuário do servidor",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    const alvo = message.mentions.members.first();
    if (!alvo) return message.reply("❌ Mencione um usuário para expulsar.");

    const motivo = args.slice(1).join(" ") || "Sem motivo";

    try {
      await alvo.kick(motivo);

      const embed = new EmbedBuilder()
        .setTitle("👢 Usuário Expulso")
        .setDescription(`👤 ${alvo.user.tag}\n📌 Motivo: **${motivo}**`)
        .setColor("Orange");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Não consegui expulsar esse usuário.");
    }
  }
};
