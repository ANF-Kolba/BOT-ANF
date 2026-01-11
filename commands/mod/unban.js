import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "unban",
  description: "Desbane um usuário pelo ID",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    const userId = args[0];
    if (!userId) return message.reply("❌ Coloque o ID do usuário que deseja desbanir.");

    try {
      await message.guild.members.unban(userId);

      const embed = new EmbedBuilder()
        .setTitle("✅ Usuário Desbanido")
        .setDescription(`O usuário com ID **${userId}** foi desbanido.`)
        .setColor("Green");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Não consegui desbanir esse usuário (verifique se o ID está correto).");
    }
  }
};
