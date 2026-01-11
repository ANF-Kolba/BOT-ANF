import { getUser, updateCoins } from "../../utils/database.js";

export default {
  name: "daily",
  description: "Receba sua recompensa diária",
  async execute(message) {
    const user = await getUser(message.author.id);

    const now = Date.now();
    const last = user.lastDaily ? new Date(user.lastDaily).getTime() : 0;

    const cooldown = 24 * 60 * 60 * 1000; // 24h

    if (now - last < cooldown) {
      const remaining = cooldown - (now - last);
      const hours = Math.ceil(remaining / (60 * 60 * 1000));
      return message.reply(`⏳ Você já coletou seu daily. Volte em **${hours}h**.`);
    }

    const reward = 500;

    await updateCoins(user.id, reward);
    user.lastDaily = new Date();
    await user.save();

    return message.reply(`💰 Você recebeu **${reward} coins** no daily!`);
  },
};
