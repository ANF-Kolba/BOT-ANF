import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import twemoji from "twemoji";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e tags equipadas",
  async execute(message) {
    const alvo = message.mentions.users.first() || message.author;

    // Buscar dados do usuário
    const user = await User.findByPk(alvo.id);

    const coins = user?.coins || 0;
    const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

    // Buscar até 3 tags equipadas
    const tagsEquipadas = await Inventory.findAll({
      where: { userId: alvo.id },
      include: [{ model: Tag, as: "tag" }],
      limit: 3
    });

    // Criar canvas
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

    // Nome do usuário
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Sans";
    ctx.fillText(alvo.username, 200, 60);

    // Coins
    const coinImg = await loadImage("https://cdn-icons-png.flaticon.com/512/138/138292.png");
    ctx.drawImage(coinImg, 180, 125, 32, 32);
    ctx.font = "22px Sans";
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`${coins} ANF Coins`, 220, 152);

    // Tags equipadas (até 3)
    let startX = 180;
    const startY = 190;
    for (const inv of tagsEquipadas) {
      const tag = inv.tag;
      if (!tag) continue;

      if (tag.emoji) {
        // Pega a URL da imagem do emoji
        const emojiUrl = twemoji.parse(tag.emoji, { folder: "svg", ext: ".png" }).match(/src="(.+?)"/)[1];
        const emojiImg = await loadImage(emojiUrl);
        ctx.drawImage(emojiImg, startX, startY - 20, 28, 28);
      }

      ctx.fillStyle = "#00ffcc";
      ctx.font = "22px Sans";
      ctx.fillText(tag.name, startX + 32, startY);
      startX += 120; // espaçamento entre tags
    }

    // Enviar imagem final
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
