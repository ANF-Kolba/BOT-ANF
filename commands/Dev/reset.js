import { sequelize } from "../../utils/database.js";

export default {
  name: "resetdb",
  description: "Reseta o banco de dados (apaga e recria todas as tabelas) [ADMIN ONLY]",
   category: "dev",
  hidden: true,
  async execute(message) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você não tem permissão para isso.");
    }

    try {
      await sequelize.sync({ force: true }); // força a recriação das tabelas
      return message.channel.send("✅ Banco de dados resetado com sucesso!");
    } catch (err) {
      console.error("Erro ao resetar o banco:", err);
      return message.reply("❌ Ocorreu um erro ao resetar o banco de dados.");
    }
  }
};
