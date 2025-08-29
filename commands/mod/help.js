import { EmbedBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra a lista de comandos ou de uma categoria específica",
  async execute(message, args, prefix) {
    const commands = message.client.commands;
    const category = args[0]?.toLowerCase(); // verifica se há uma categoria (ex: "economia")

    // Se houver uma categoria, filtra apenas os comandos dessa categoria
    let filteredCommands = category
      ? [...commands.values()].filter(cmd => cmd.category?.toLowerCase() === category)
      : [...commands.values()]; // Caso contrário, pega todos os comandos

    // Se a categoria foi passada e não houver comandos, avisa o usuário
    if (category && filteredCommands.length === 0) {
      return message.reply(`❌ Nenhum comando encontrado na categoria **${category}**.`);
    }

    // Criando o embed com os comandos
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
