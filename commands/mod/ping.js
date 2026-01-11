import { EmbedBuilder } from 'discord.js';

export default {
  name: "ping",
  description: "Mostra o ping do bot",
  async execute(message) {
    const sent = await message.channel.send("🏓 Calculando ping...");
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = message.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "Latência da mensagem", value: `${latency} ms`, inline: true },
        { name: "Latência da API", value: `${apiLatency} ms`, inline: true }
      )
      .setColor("#f82929") // verde, pode mudar
      .setTimestamp();

    await sent.edit({ content: null, embeds: [embed] });
  }
};