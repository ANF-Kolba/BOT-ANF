import { EmbedBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra a lista de comandos disponíveis",
  async execute(message, args, prefix) {
    const commands = message.client.commands;

    const embed = new EmbedBuilder()
      .setTitle("📜 Lista de Comandos")
      .setColor("#0099ff")
      .setDescription(
        commands.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description}`).join("\n")
      )
      .setFooter({ text: `Use ${prefix} para comandos` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};