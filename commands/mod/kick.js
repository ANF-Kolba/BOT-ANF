import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "kick",
  description: "Expulsa um usuário do servidor",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      const Embed = new EmbedBuilder()
        .setTitle("❌ Erro ao Expulsar")
        .setDescription(`Voce não tem permissão para usar esse comando.`)
        .setColor("#ff0000");;
    }

    const alvo = message.mentions.members.first();
    if (!alvo) return message.reply({ embeds: [embed] });
        const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Erro ao Expulsar")
        .setDescription(`Usuario não encontrado`)
        .setColor("#ff0000");

    const motivo = args.slice(1).join(" ") || "Sem motivo";

    try {
      await alvo.kick(motivo);

      const embed = new EmbedBuilder()
        .setTitle("👢 Usuário Expulso")
        .setDescription(`👤 ${alvo.user.tag}\n📌 Motivo: **${motivo}**`)
        .setColor("#ff9100");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
        const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Erro ao Expulsar")
        .setDescription(`Não consegui expulsar o usuário **${alvo.user.tag}**.`)
        .setColor("#ff0000");
    }
  }
};
