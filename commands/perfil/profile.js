import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import Twemoji from "twemoji";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";
import { Op } from "sequelize";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição, banner, ícone e até 3 tags equipadas com emojis",
  async execute(message) {
    const alvo = message.mentions.users.first() || message.author;
    await message.guild.members.fetch(alvo.id);

    // Dados do banco
    const user = await User.findByPk(alvo.id);
    const coins = user ? user.coins : 0;
    const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;
    const icon = user?.equippedIcon ? await Cosmetic.findByPk(user.equippedIcon) : null;

    // Buscar até 3 tags equipadas
    const equippedTags = await Inventory.findAll({
      where: { userId: alvo.id, tagId: { [Op.ne]: null }, equipped: true },
      include: [{ model: Tag, as: "tag" }],
      limit: 3
    });

    // Canvas
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

    // Descrição do Discord
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

    // Tags equipadas (até 3)
    let x = 180; // posição inicial horizontal
    const y = 190; // altura das tags
    const spacing = 150; // distância entre tags

    for (const inv of equippedTags) {
      const tag = inv.tag;
      ctx.fillStyle = "#00ffcc";
      ctx.font = "22px Sans";
      ctx.fillText(tag.name, x, y);

      if (tag.emoji) {
        const parsed = Twemoji.parse(tag.emoji, { folder: "svg", ext: ".svg" });
        const url = parsed.match(/src="(.+?)"/)[1];
        const emojiImg = await loadImage(url);
        ctx.drawImage(emojiImg, x + ctx.measureText(tag.name).width + 5, y - 20, 32, 32);
      }

      x += spacing;
    }

    // Enviar imagem
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
