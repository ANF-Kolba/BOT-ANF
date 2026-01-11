import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic, Tag, Inventory } from "../../utils/database.js";
import twemoji from "twemoji";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e tags equipadas",

  async execute(message) {
    const alvo = message.mentions.users.first() || message.author;

    // =====================
    // 📦 BANCO DE DADOS
    // =====================
    let user = await User.findByPk(alvo.id);
    if (!user) user = await User.create({ id: alvo.id });

    const coins = user.coins ?? 0;
    const banner = user.equippedBanner
      ? await Cosmetic.findByPk(user.equippedBanner)
      : null;

    const inventory = await Inventory.findAll({
      where: { userId: alvo.id },
      include: [
        { model: Tag, as: "tag" },
        { model: Cosmetic, as: "cosmetic" },
      ],
    });

    // =====================
    // 🎨 CANVAS
    // =====================
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    // =====================
    // 🖼️ FUNDO / BANNER
    // =====================
    let bannerName = "";

    if (banner?.url) {
      const bg = await loadImage(banner.url);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      bannerName = banner.name || "Banner equipado";
    } else {
      const defaultBg = await loadImage("https://i.imgur.com/nUPUUJd.png");
      ctx.drawImage(defaultBg, 0, 0, canvas.width, canvas.height);
      bannerName = "Banner padrão";
    }

    // 🔥 Escurecer levemente o fundo
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // =====================
    // 👤 AVATAR
    // =====================
    const avatar = await loadImage(
      alvo.displayAvatarURL({ extension: "png", size: 128 })
    );

    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 105, 80, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 50, 35, 145, 145);
    ctx.restore();

    // =====================
    // 📝 NOME
    // =====================
    ctx.font = "35px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(alvo.username, 215, 75);

    // =====================
    // 📄 DESCRIÇÃO
    // =====================
    ctx.font = "20px Sans";
    ctx.fillStyle = "#cccccc";
    ctx.shadowBlur = 0;
    ctx.fillText(
      (user.description || "Sem descrição.").slice(0, 60),
      220,
      110
    );

    // =====================
    // 💰 COINS
    // =====================
    const coinImg = await loadImage(
      "https://cdn-icons-png.flaticon.com/512/138/138292.png"
    );
    ctx.drawImage(coinImg, 215, 140, 40, 40);
    ctx.font = "28px Sans";
    ctx.fillStyle = "#f1dd67";
    ctx.fillText(`${coins} ANF Coins`, 265, 170);

    // =====================
    // 🏷️ TAGS (corrigido para evitar null)
    // =====================
    async function emojiToImage(emoji) {
      const parsed = twemoji.parse(emoji, { folder: "72x72", ext: ".png" });
      const url = parsed.match(/src="([^"]+)"/)?.[1];
      if (!url) throw new Error("Emoji inválido");
      return loadImage(url);
    }

    let startX = 50;
    const y = 255;
    const spacing = 220;

    for (const item of inventory.slice(0, 3)) {
      if (!item.tag) continue; // pula se tag for null

      try {
        const img = await emojiToImage(item.tag.tag || "❓");
        ctx.drawImage(img, startX, y - 20, 35, 35);
      } catch {
        ctx.font = "22px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(item.tag.tag || "❓", startX, y);
      }

      ctx.font = "30px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(item.tag.name || "Sem nome", startX + 50, y + 10);

      startX += spacing;
    }

    // =====================
    // 📊 XP / LEVEL
    // =====================
    let totalMessages = 0;

    if (message.guild) {
      for (const channel of message.guild.channels.cache.values()) {
        if (channel.isTextBased()) {
          totalMessages += channel.messages.cache.filter(
            (m) => m.author.id === alvo.id
          ).size;
        }
      }
    }

    const XP = Math.log(totalMessages + 1) * 12;
    const level = Math.floor(Math.sqrt(XP));
    const xpPercent = Math.min((XP / Math.pow(level + 1, 2)) * 100, 100);

    const barX = 55;
    const barY = 310;
    const barWidth = 646;
    const barHeight = 26;

    ctx.fillStyle = "#555";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#9900ff";
    ctx.fillRect(barX, barY, (xpPercent / 100) * barWidth, barHeight);

    ctx.strokeStyle = "#b4b4b4";
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.font = "20px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Level: ${level} (${xpPercent.toFixed(1)}%)`, 70, 330);

    // =====================
    // 💍 CASAMENTO
    // =====================
    let marriedUser = null;
    if (user.marriedWith) {
      marriedUser = await message.client.users
        .fetch(user.marriedWith)
        .catch(() => null);

      if (!marriedUser) {
        user.marriedWith = null;
        user.marriedSince = null;
        await user.save();
      }
    }

    if (marriedUser) {
      const ringImg = await loadImage(
        "https://img.icons8.com/office/40/diamond-ring.png"
      );
      ctx.drawImage(ringImg, 55, 350, 40, 40);
      ctx.font = "23px Sans";
      ctx.fillStyle = "#f588ec";
      ctx.fillText(`Casado com ${marriedUser.username}`, 100, 380);
    }

    // =====================
    // 🏷️ TEXTO DO BANNER (CANTO INFERIOR DIREITO)
    // =====================
    ctx.font = "10px Sans";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "right";
    ctx.fillText(bannerName, canvas.width - 10, canvas.height - 10);
    ctx.textAlign = "left";

    // =====================
    // 📤 ENVIAR IMAGEM
    // =====================
    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "profile.png",
    });

    return message.channel.send({ files: [attachment] });
  },
};
