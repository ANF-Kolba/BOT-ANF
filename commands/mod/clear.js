import { PermissionsBitField } from "discord.js";

export default {
  name: "clear",
  description: "Apaga um número específico de mensagens recentes.",
  async execute(message, args) {
    // Verifica permissão
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Você não tem permissão para usar este comando.");
    }

    // Valida argumento
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply("❌ Por favor, forneça um número entre 1 e 100.");
    }

    try {
      // Apaga as mensagens
      await message.channel.bulkDelete(amount, true);

      // Confirma a exclusão
      const confirmation = await message.channel.send(`🧹 Foram apagadas **${amount} mensagens**.`);

      // Apaga a mensagem de confirmação após 5 segundos
      setTimeout(() => {
        confirmation.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error("Erro ao apagar mensagens:", error);
      message.reply("❌ Ocorreu um erro ao tentar apagar as mensagens.");
    }
  }
};
