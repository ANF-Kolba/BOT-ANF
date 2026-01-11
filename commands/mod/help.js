import { EmbedBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra os comandos disponíveis",
  async execute(message, args, prefix) {
    const commands = message.client.commands;
    const category = args[0]?.toLowerCase();

    let filteredCommands;

    if (category) {
      // 🔓 Se a categoria foi digitada, mostra TODOS dela
      filteredCommands = [...commands.values()].filter(
        cmd => cmd.category?.toLowerCase() === category
      );

      if (filteredCommands.length === 0) {
        return message.reply(
          `❌ Nenhum comando encontrado na categoria **${category}**.`
        );
      }
    } else {
      // 🔒 Help normal → ignora comandos ocultos (dev)
      filteredCommands = [...commands.values()].filter(
        cmd => !cmd.hidden
      );
    }

    // Agrupa por categoria
    const grouped = {};
    for (const cmd of filteredCommands) {
      const cat = cmd.category || "Outros";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(category ? `📂 Categoria: ${category}` : "📜 Lista de Comandos")
      .setFooter({ text: `Use ${prefix}help <categoria>` })
      .setTimestamp();

    for (const [cat, cmds] of Object.entries(grouped)) {
      embed.addFields({
        name: `🧩 ${cat}`,
        value: cmds
          .map(cmd => `▸ **${prefix}${cmd.name}** — ${cmd.description}`)
          .join("\n"),
        inline: false
      });
    }

    await message.channel.send({ embeds: [embed] });
  }
};
