import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Inventory, ShopItem } from "../../utils/database.js";
import twemoji from "twemoji";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e itens equipados",
  async execute(message) {
    const alvo = message.mentions.users.first() || message.author;

    let user = await User.findByPk(alvo.id);
    if (!user) user = await User.create({ id: alvo.id });

    const coins = user.coins ?? 0;

    // Banner equipado
    let banner = null;
    if (user.equippedBanner) {
      const bannerInv = await Inventory.findOne({
        where: { userId: alvo.id, shopItemId: user.equippedBanner },
        include: [{ model: ShopItem }],
      });
      banner = bannerInv?.shopItem || null;
    }

    const inventory = await Inventory.findAll({
      where: { userId: alvo.id },
      include: [{ model: ShopItem }],
    });

    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    // Fundo
    if (banner?.url) {
      const bg = await loadImage(banner.url);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
      const defaultBg = await loadImage("https://i.imgur.com/nUPUUJd.png");
      ctx.drawImage(defaultBg, 0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatar
    const avatar = await loadImage(alvo.displayAvatarURL({ extension: "png", size: 128 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 105, 80, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 50, 35, 145, 145);
    ctx.restore();

    // Nome e descrição
    ctx.font = "35px Sans";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(alvo.username, 215, 75);

    ctx.font = "20px Sans";
    ctx.fillStyle = "#ccc";
    ctx.shadowBlur = 0;
    ctx.fillText((user.description || "Sem descrição.").slice(0, 60), 220, 110);

    // Coins
    const coinImg = await loadImage("https://cdn-icons-png.flaticon.com/512/138/138292.png");
    ctx.drawImage(coinImg, 215, 140, 40, 40);
    ctx.font = "28px Sans";
    ctx.fillStyle = "#f1dd67";
    ctx.fillText(`${coins} ANF Coins`, 265, 170);

    // Itens equipados (tags)
    let startX = 50;
    const y = 255;
    const spacing = 220;

    const equippedTags = inventory.filter(i => i.shopItem && i.shopItem.type === "tag").slice(0, 3);

    for (const item of equippedTags) {
      try {
        const url = twemoji.parse(item.shopItem.name, { folder: "72x72", ext: ".png" }).match(/src="([^"]+)"/)[1];
        const img = await loadImage(url);
        ctx.drawImage(img, startX, y - 20, 35, 35);
      } catch {
        ctx.font = "22px Sans";
        ctx.fillStyle = "#fff";
        ctx.fillText(item.shopItem.name, startX, y);
      }
      ctx.font = "30px Sans";
      ctx.fillStyle = "#fff";
      ctx.fillText(item.shopItem.name, startX + 50, y + 10);

      startX += spacing;
    }

    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  },
};
