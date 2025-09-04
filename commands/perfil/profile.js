import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";
import twemoji from "twemoji";

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

    // Função para converter emoji em imagem via Twemoji
    async function emojiToImage(emoji) {
      const parsed = twemoji.parse(emoji, { folder: "72x72", ext: ".png" });
      const url = parsed.match(/src="([^"]+)"/)[1];
      return await loadImage(url);
    }

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
    ctx.arc(145, 145, 90, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 35, 145, 145);
    ctx.restore();

    // Nome do usuário
    ctx.fillStyle = "#ffffff";
    ctx.font = "35px Sans";
    ctx.fillText(alvo.username, 215, 60);

    // Descrição do Discord
    const userData = await alvo.fetch(true);
    const description = userData.bio || "Sem descrição.";
    ctx.font = "20px Sans";
    ctx.fillStyle = "#cccccc";
    ctx.fillText(description.slice(0, 60), 215, 100);

    // Coins
    const coinImg = await loadImage("https://cdn-icons-png.flaticon.com/512/138/138292.png");
    ctx.drawImage(coinImg, 215, 140, 40, 40);
    ctx.font = "30px Sans";
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`${coins} ANF Coins`, 270, 180);

    // Tags equipadas (até 3, lado a lado)
    let startX = 50;
    const y = 225;
    const spacing = 220;

    for (const t of inventory.filter(i => i.tag).slice(0, 3)) {
      const emoji = t.tag.tag;
      const name = t.tag.name;

      try {
        const img = await emojiToImage(emoji);
        ctx.drawImage(img, startX, y - 20, 35, 35); // desenha emoji
      } catch {
        // fallback: se não conseguir carregar, escreve emoji como texto
        ctx.fillStyle = "#00ffcc";
        ctx.font = "22px Sans";
        ctx.fillText(emoji, startX, y);
      }

      // Nome da tag ao lado
      ctx.fillStyle = "#00ffcc";
      ctx.font = "30px Sans";
      ctx.fillText(name, startX + 50, y + 10);

      startX += spacing;
    }

    // Enviar imagem final
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
