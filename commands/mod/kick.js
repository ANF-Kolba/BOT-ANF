import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "kick",
  description: "Expulsa um usuário do servidor",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      const noPermEmbed = new EmbedBuilder()
        .setTitle("❌ Permissão Negada")
        .setDescription("Você não tem permissão para usar esse comando.")
        .setColor("#ff0000");

      return message.reply({ embeds: [noPermEmbed] });
    }

    const alvo = message.mentions.members.first();
    if (!alvo) {
      const noUserEmbed = new EmbedBuilder()
        .setTitle("❌ Usuário não encontrado")
        .setDescription("Mencione um usuário válido para expulsar.")
        .setColor("#ff0000");

      return message.reply({ embeds: [noUserEmbed] });
    }

    const motivo = args.slice(1).join(" ") || "Sem motivo";

    try {
      await alvo.kick(motivo);

      const successEmbed = new EmbedBuilder()
        .setTitle("👢 Usuário Expulso")
        .setDescription(`👤 ${alvo.user.tag}\n📌 Motivo: **${motivo}**`)
        .setColor("#ff8800");

      return message.channel.send({ embeds: [successEmbed] });
    } catch (err) {
      console.error(err);

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Erro ao expulsar")
        .setDescription(`Não consegui expulsar o usuário **${alvo.user.tag}**.`)
        .setColor("#ff0000");

      return message.reply({ embeds: [errorEmbed] });
    }
  },
};