import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";
import { Op } from "sequelize";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e tags equipadas",
  async execute(message) {
    // Usuário alvo
    const alvo = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(alvo.id);

    // Dados do banco
    let user = await User.findByPk(alvo.id);

    // Se não existir, criar dados padrão temporários
    const coins = user ? user.coins : 0;
    const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

    // Buscar até 3 tags equipadas (ordenadas por slot)
    const tagsEquipped = await Inventory.findAll({
      where: { userId: alvo.id, equipped: true, tagId: { [Op.ne]: null } },
      include: [{ model: Tag }],
      order: [["equippedSlot", "ASC"]],
      limit: 3
    });

    // Criar canvas
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    // Fundo (banner ou cor sólida)
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

    // Tags equipadas (slots 1, 2, 3)
    let startX = 180;
    const startY = 190;
    const spacing = 160; // espaço entre as tags

    for (let slot = 1; slot <= 3; slot++) {
      const inv = tagsEquipped.find(t => t.equippedSlot === slot);

      if (inv && inv.tag) {
        ctx.font = "22px Sans";
        ctx.fillStyle = "#00ffcc";
        ctx.fillText(`${inv.tag.tag} ${inv.tag.name}`, startX, startY);
      } else {
        // Slot vazio → só não desenha nada (ou você pode desenhar um quadradinho transparente como placeholder)
      }

      startX += spacing;
    }

    // Enviar imagem final
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
