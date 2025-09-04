import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";
import { Op } from "sequelize";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e tags",
  async execute(message) {
    // Usuário alvo
    const alvo = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(alvo.id);

    // Dados do banco
    const user = await User.findByPk(alvo.id);

    const coins = user ? user.coins : 0;
    const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

    // Buscar todas as tags do inventário
    const tagInventories = await Inventory.findAll({
      where: { userId: alvo.id, tagId: { [Op.ne]: null } },
      include: [{ model: Tag, as: "tag" }],
      limit: 3 // mostrar no máximo 3 tags
    });

    // Separar tag equipada e outras
    const tags = tagInventories.map(t => t.tag);
    const equippedTag = tags.find(t => t.id === user?.equippedTagId);

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

    // Desenhar tags
    let startX = 180;
    const startY = 190;
    const tagSize = 60;
    const gap = 10;

    tags.forEach(tag => {
      // Contorno se for a equipada
      if (tag.id === user?.equippedTagId) {
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 3;
        ctx.strokeRect(startX - 5, startY - 5, tagSize + 10, tagSize + 10);
      }

      // Desenhar um retângulo simples para a tag
      ctx.fillStyle = "#444";
      ctx.fillRect(startX, startY, tagSize, tagSize);

      // Nome da tag (ou emoji se quiser)
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px Sans";
      ctx.fillText(tag.name.slice(0, 4), startX + 5, startY + tagSize / 2 + 5);

      startX += tagSize + gap;
    });

    // Enviar imagem
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
