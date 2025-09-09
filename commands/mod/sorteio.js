import { EmbedBuilder } from "discord.js";

export default {
  name: "sorteio",
  description: "Inicia um sorteio rápido | Use: `!sorteio <tempo_em_segundos> <prêmio>` (mínimo 5 segundos)",
  async execute(message, args) {
    const tempo = parseInt(args[0]); // em segundos
    const premio = args.slice(1).join(" ") || "🎁 Surpresa!";

    if (isNaN(tempo) || tempo < 5) {
      return message.reply("❌ Use: `!sorteio <tempo_em_segundos> <prêmio>` (mínimo 5 segundos)");
    }

    const embed = new EmbedBuilder()
      .setTitle("🎉 Novo Sorteio!")
      .setDescription(`🎁 **Prêmio:** ${premio}\n⏳ **Tempo:** ${tempo} segundos\n\nReaja com 🎉 para participar!`)
      .setColor("Purple");

    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react("🎉");

    setTimeout(async () => {
      const coletados = await msg.reactions.cache.get("🎉")?.users.fetch();
      const participantes = coletados?.filter(u => !u.bot).map(u => u);

      if (!participantes || participantes.length === 0) {
        return message.channel.send("❌ Ninguém participou do sorteio...");
      }

      const vencedor = participantes[Math.floor(Math.random() * participantes.length)];
      return message.channel.send(`🎉 Parabéns ${vencedor}! Você ganhou **${premio}**`);
    }, tempo * 1000);
  }
};
