import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "timeout",
  description: "Coloca um usuário em timeout (silenciado por tempo definido)",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    const alvo = message.mentions.members.first();
    if (!alvo) return message.reply("❌ Mencione um usuário válido.");

    const tempo = parseInt(args[1]); // em minutos
    if (isNaN(tempo) || tempo <= 0) {
      return message.reply("❌ Coloque um tempo válido em minutos. Ex: `!timeout @user 10`");
    }

    const motivo = args.slice(2).join(" ") || "Sem motivo";

    try {
      await alvo.timeout(tempo * 60 * 1000, motivo);

      const embed = new EmbedBuilder()
        .setTitle("⏳ Timeout aplicado")
        .setDescription(`👤 ${alvo.user.tag}\n⏱️ Tempo: **${tempo} minutos**\n📌 Motivo: **${motivo}**`)
        .setColor("Yellow");

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Não consegui colocar timeout nesse usuário.");
    }
  }
};
