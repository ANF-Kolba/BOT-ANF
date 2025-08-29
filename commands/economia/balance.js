import { getUser } from "../../utils/database.js";

export default {
  name: "balance",
  description: "Veja seu saldo.",
  execute(message) {
    const user = getUser(message.author.id);
    message.reply(`💳 Seu saldo é: **${user.coins} moedas**`);
  }
};
