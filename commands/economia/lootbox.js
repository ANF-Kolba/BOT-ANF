import { EmbedBuilder } from "discord.js";
import { getInventory, addItemToInventory, removeItemFromInventory, hasCosmetic, Cosmetic, updateCoins } from "../../utils/database.js";

// Lootbox raridade
const raridadeChance = [
  { raridade: "comum", chance: 50 },
  { raridade: "incomum", chance: 25 },
  { raridade: "rara", chance: 15 },
  { raridade: "lendaria", chance: 8 },
  { raridade: "suprema", chance: 2 }
];

// Loot tables
const lootTable = {
  comum: [
    { type: "coins", valor: 100, chance: 80 },
    { type: "cosmetic", cosmeticId: 1, chance: 20 }
  ],
  incomum: [
    { type: "coins", valor: 300, chance: 70 },
    { type: "cosmetic", cosmeticId: 2, chance: 30 }
  ],
  rara: [
    { type: "coins", valor: 800, chance: 60 },
    { type: "cosmetic", cosmeticId: 3, chance: 40 }
  ],
  lendaria: [
    { type: "coins", valor: 2000, chance: 50 },
    { type: "cosmetic", cosmeticId: 4, chance: 50 }
  ],
  suprema: [
    { type: "coins", valor: 5000, chance: 40 },
    { type: "cosmetic", cosmeticId: 5, chance: 60 }
  ]
};

export default {
  name: "lootbox",
  description: "Abre ou mostra informações de lootboxes. Use: `!lootbox info {raridade}` ou `!lootbox abrir {raridade}`",
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    // Apenas info
    if (sub === "info") {
      return message.reply("📦 Raridades disponíveis: comum, incomum, rara, lendaria, suprema");
    }

    // Abrir lootbox
    if (sub === "abrir") {
      const inventory = await getInventory(message.author.id);
      const lootbox = inventory.find(i => i.item && i.item.toLowerCase().includes("lootbox"));

      if (!lootbox) return message.reply("❌ Você não tem nenhuma lootbox para abrir!");

      // Remove a lootbox
      await removeItemFromInventory(message.author.id, lootbox.item);

      // Sorteio raridade
      let totalR = raridadeChance.reduce((s, r) => s + r.chance, 0);
      let rollR = Math.random() * totalR;
      let raridade;
      for (const r of raridadeChance) {
        if (rollR < r.chance) { raridade = r.raridade; break; }
        rollR -= r.chance;
      }

      // Sorteio recompensa
      const tabela = lootTable[raridade];
      let totalI = tabela.reduce((s, i) => s + i.chance, 0);
      let rollI = Math.random() * totalI;
      let ganho;
      for (const i of tabela) {
        if (rollI < i.chance) { ganho = i; break; }
        rollI -= i.chance;
      }

      let desc = "";

      if (ganho.type === "coins") {
        await updateCoins(message.author.id, ganho.valor);
        desc = `💰 Você ganhou **${ganho.valor} ANF Coins**!`;
      } else if (ganho.type === "cosmetic") {
        const cosmetic = await Cosmetic.findByPk(ganho.cosmeticId);
        if (!cosmetic) {
          desc = "⚠️ Cosmético não encontrado.";
        } else {
          const possui = await hasCosmetic(message.author.id, cosmetic.id);
          if (possui) {
            // Se já possui, dá coins equivalentes
            const coinsSub = cosmetic.price || 200;
            await updateCoins(message.author.id, coinsSub);
            desc = `🎨 Você já possui o cosmético **${cosmetic.name}**! Recebeu **${coinsSub} ANF Coins** em vez disso.`;
          } else {
            await addItemToInventory(message.author.id, cosmetic.name, cosmetic.id);
            desc = `🎨 Você ganhou o cosmético **${cosmetic.name}**!`;
          }
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`🎁 ${message.author.username} abriu uma Lootbox!`)
        .setDescription(desc)
        .setColor("Gold");

      return message.channel.send({ embeds: [embed] });
    }

    return message.reply("❌ Use `!lootbox info` ou `!lootbox abrir`.");
  }
};
