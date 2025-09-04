import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";
import twemoji from "twemoji";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e tags equipadas",
  async execute(message) {
    try {
      const alvo = message.mentions.users.first() || message.author;
      const member = await message.guild.members.fetch(alvo.id);

      // Dados do banco
      let user = await User.findByPk(alvo.id);

      const coins = user ? user.coins : 0;
      const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

      // Buscar até 3 tags equipadas
      const tagsEquipped = await Inventory.findAll({
        where: { userId: alvo.id, tagId: { not: null }, equipped: true },
        include: [{ model: Tag, as: "tag" }],
        limit: 3
      });

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      // Fundo
      if (banner) {
        const bg = await loadImage(banner.url);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#2c2f33";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Avatar
      const avatar = await loadImage(alvo.displayAvatarURL({ extension: "png", size: 128 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 100, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 30, 30, 140, 140);
      ctx.restore();

      // Nome
      ctx.fillStyle = "#ffffff";
      ctx.font = "28px Sans";
      ctx.fillText(alvo.username, 200, 60);

      // Descrição
      const userData = await alvo.fetch(true);
      const description = userData.bio || "Sem descrição.";
      ctx.font = "20px Sans";
      ctx.fillStyle = "#cccccc";
      ctx.fillText(description.slice(0, 60), 200, 90);

      // Coins
      const coinImg = await loadImage("https://cdn-icons-png.flaticon.com/512/138/138292.png");
      ctx.drawImage(coinImg, 180, 125, 32, 32);
      ctx.font = "22px Sans";
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`${coins} ANF Coins`, 220, 152);

      // Tags equipadas
      let tagX = 180;
      let tagY = 190;

      for (const inv of tagsEquipped) {
        if (!inv.tag) continue;

        const tag = inv.tag;
        const emoji = tag.emoji || "";
        const nome = tag.name;

        if (emoji) {
          // Converte emoji em URL usando Twemoji
          const parsed = twemoji.parse(emoji, { folder: "svg", ext: ".svg" });
          const url = parsed.match(/src="(.+?)"/)?.[1];

          if (url) {
            try {
              const emojiImg = await loadImage(url);
              ctx.drawImage(emojiImg, tagX, tagY - 20, 24, 24);
              ctx.fillStyle = "#00ffcc";
              ctx.font = "22px Sans";
              ctx.fillText(nome, tagX + 30, tagY);
            } catch {
              ctx.fillStyle = "#00ffcc";
              ctx.font = "22px Sans";
              ctx.fillText(`${emoji} ${nome}`, tagX, tagY);
            }
          }
        } else {
          ctx.fillStyle = "#00ffcc";
          ctx.font = "22px Sans";
          ctx.fillText(nome, tagX, tagY);
        }

        tagY += 40; // próxima linha
      }

      const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
      return message.channel.send({ files: [attachment] });

    } catch (err) {
      console.error("❌ Erro no comando profile:", err);
      return message.reply("❌ Ocorreu um erro ao gerar o perfil.");
    }
  }
};
