import { EmbedBuilder } from "discord.js";
import { getShop } from "../../utils/database.js";

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

const typeIcons = {
  banner: "🖼️",
  icon: "✨",
  lootbox: "🎁",
  tag: "🏷️",
  role: "🎭",
  item: "📦",
};

export default {
  name: "shop",
  description: "Mostra a loja",
  async execute(message) {
    const items = await getShop();

    if (!items.length) {
      return message.reply("❌ A loja está vazia.");
    }

    // 🧩 Agrupar por tipo
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    }

    // 📄 Criar páginas
    const pages = Object.entries(grouped).map(([type, list], index, arr) => {
      const embed = new EmbedBuilder()
        .setTitle("🛒 Loja")
        .setColor("Gold")
        .setDescription(
          `${typeIcons[type]} **${type.toUpperCase()}**\n` +
          `Página ${index + 1}/${arr.length}`
        )
        .setFooter({ text: "Use os números para trocar de página" });

      list.forEach(item => {
        embed.addFields({
          name: `🆔 ${item.id} — ${item.name}`,
          value: `💰 ${item.price} coins`,
          inline: false,
        });
      });

      return embed;
    });

    let page = 0;
    const msg = await message.channel.send({ embeds: [pages[page]] });

    for (let i = 0; i < pages.length && i < numberEmojis.length; i++) {
      await msg.react(numberEmojis[i]);
    }

    const collector = msg.createReactionCollector({
      filter: (r, u) =>
        numberEmojis.includes(r.emoji.name) &&
        u.id === message.author.id,
      time: 120000,
    });

    collector.on("collect", r => {
      const index = numberEmojis.indexOf(r.emoji.name);
      if (pages[index]) {
        page = index;
        msg.edit({ embeds: [pages[page]] });
      }
      r.users.remove(message.author.id);
    });

    collector.on("end", () => {
      msg.reactions.removeAll().catch(() => {});
    });
  },
};
