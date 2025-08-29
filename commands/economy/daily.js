import { getUser, updateCoins, setDaily } from "../../utils/database.js";

export default {
  name: "daily",
  description: "Pegue sua recompensa diária!",
  execute(message) {
    const user = getUser(message.author.id);
    const now = Date.now();
    const diff = now - user.lastDaily;

    if (diff < 86400000) {
      const hours = Math.floor((86400000 - diff) / 3600000);
      return message.reply(`⏳ Você já pegou seu daily! Tente novamente em ${hours}h.`);
    }

    const reward = 100;
    updateCoins(message.author.id, reward);
    setDaily(message.author.id, now);

    message.reply(`💰 Você recebeu **${reward} moedas** no daily!`);
  }
};