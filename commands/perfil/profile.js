import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e tags equipadas",
  async execute(message) {
    const alvo = message.mentions.users.first() || message.author;

    // Buscar usuário no banco
    let user = await User.findByPk(alvo.id);
    const coins = user ? user.coins : 0;
    const banner = user?.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

    // Buscar inventário do usuário
    const inventory = await Inventory.findAll({
      where: { userId: alvo.id },
      include: [
        { model: Tag, as: "tag" },
        { model: Cosmetic, as: "cosmetic" },
      ],
    });

    // Pegar tags equipadas (até 3)
    const tagsEquipadas = inventory
      .filter(i => i.tag) // só entradas que possuem tag
      .slice(0, 3)
      .map(i => `${i.tag.tag} ${i.tag.name}`); // emoji + nome

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

    // Tags equipadas (até 3, lado a lado)
    if (tagsEquipadas.length > 0) {
      ctx.font = "22px Sans";
      ctx.fillStyle = "#ffffff";
      tagsEquipadas.forEach((tagStr, i) => {
        ctx.fillText(tagStr, 180 + i * 200, 190); // ajusta a posição horizontal
      });
    }

    // Enviar imagem final
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
