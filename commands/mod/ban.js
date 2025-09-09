import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "ban",
  description: "Bane um usuário do servidor",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    const alvo = message.mentions.members.first();
    if (!alvo) return message.reply("❌ Mencione um usuário para banir.");

    const motivo = args.slice(1).join(" ") || "Sem motivo";

    try {
      await alvo.ban({ reason: motivo });

      const embed = new EmbedBuilder()
        .setTitle("🔨 Usuário Banido")
        .setDescription(`👤 ${alvo.user.tag}\n📌 Motivo: **${motivo}**`)
        .setColor("Red");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Não consegui banir esse usuário.");
    }
  }
};
