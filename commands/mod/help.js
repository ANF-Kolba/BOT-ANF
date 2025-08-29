import { EmbedBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra a lista de comandos ou de uma categoria",
  async execute(message, args, prefix) {
    const commands = message.client.commands;
    const category = args[0]?.toLowerCase(); // exemplo: "economia"

    let filteredCommands = [...commands.values()];

    if (category) {
      filteredCommands = filteredCommands.filter(cmd => cmd.category?.toLowerCase() === category);
      if (filteredCommands.length === 0) {
        return message.reply(`❌ Nenhum comando encontrado na categoria **${category}**.`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(category ? `📂 Comandos da categoria: ${category}` : "📜 Todos os Comandos")
      .setColor("#0099ff")
      .setDescription(
        filteredCommands
          .map(cmd => `**${prefix}${cmd.name}** - ${cmd.description}`)
          .join("\n")
      )
      .setFooter({ text: `Use ${prefix}help [categoria] para filtrar` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};