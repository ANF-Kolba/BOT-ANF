import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory, getUser } from "../../utils/database.js";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e até 3 tags equipadas",
  async execute(message) {
    const alvo = message.mentions.users.first() || message.author;

    // Buscar dados do usuário ou criar padrão temporário
    let user = await User.findByPk(alvo.id);
    const coins = user ? user.coins : 0;
    const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

    // Buscar tags equipadas (até 3)
    let tags = [];
    if (user?.equippedTagId) {
      const tag1 = await Tag.findByPk(user.equippedTagId);
      if (tag1) tags.push(tag1);
    }

    const userInventory = await Inventory.findAll({
      where: { userId: alvo.id, tagId: user?.equippedTagId || null },
      include: [{ model: Tag, as: "tag" }]
    });

    // Adiciona outras tags se houver
    for (const inv of userInventory) {
      if (inv.tag && !tags.find(t => t.id === inv.tag.id)) {
        tags.push(inv.tag);
      }
      if (tags.length >= 3) break;
    }

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

    // Tags (até 3)
    let startX = 180;
    const startY = 190;
    const gap = 20;
    ctx.fillStyle = "#00ffcc";
    ctx.font = "22px Sans";
    ctx.textAlign = "left";

    for (let i = 0; i < Math.min(tags.length, 3); i++) {
      const tag = tags[i];
      const text = tag.emoji ? `${tag.emoji} ${tag.name}` : tag.name;
      ctx.fillText(text, startX, startY);
      startX += ctx.measureText(text).width + gap;
    }

    // Enviar imagem
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
