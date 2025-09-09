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
      const defaultBg = await loadImage("https://i.imgur.com/nUPUUJd.png");
  ctx.drawImage(defaultBg, 0, 0, canvas.width, canvas.height);
    }

    // Avatar
    const avatar = await loadImage(alvo.displayAvatarURL({ extension: "png", size: 128 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 105, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 35, 145, 145);
    ctx.restore();

    // Nome do usuário
    ctx.fillStyle = "#ffffff";
    ctx.font = "35px Sans";
    ctx.shadowColor = "#000000";   
    ctx.shadowBlur = 4;          
    ctx.shadowOffsetX = 2;     
    ctx.shadowOffsetY = 2;
    ctx.fillText(alvo.username, 215, 75);

    // Descrição do Discord
    const description = user?.description || "Sem descrição.";
    ctx.font = "20px Sans";
    ctx.fillStyle = "#cccccc";
    ctx.shadowColor = "#000000";   
    ctx.shadowBlur = 4;          
    ctx.shadowOffsetX = 2;     
    ctx.shadowOffsetY = 2;
    ctx.fillText(description.slice(0, 60), 220, 110);

    // Coins
    const coinImg = await loadImage("https://cdn-icons-png.flaticon.com/512/138/138292.png");
    ctx.drawImage(coinImg, 215, 140, 40, 40);
    ctx.font = "28px Sans";
    ctx.fillStyle = "#f1dd67ff";
    ctx.shadowColor = "#000000";   
    ctx.shadowBlur = 4;          
    ctx.shadowOffsetX = 2;     
    ctx.shadowOffsetY = 2;
    ctx.fillText(`${coins} ANF Coins`, 265, 170);

    // Tags equipadas (até 3, lado a lado)
    let startX = 50;
    const y = 255;
    const spacing = 220;

    for (const t of inventory.filter(i => i.tag).slice(0, 3)) {
      const emoji = t.tag.tag;
      const name = t.tag.name;

      try {
        const img = await emojiToImage(emoji);
        ctx.drawImage(img, startX, y - 20, 35, 35); // desenha emoji
      } catch {
        // fallback: se não conseguir carregar, escreve emoji como texto
        ctx.fillStyle = "#ffffff";
        ctx.font = "22px Sans";
        ctx.fillText(emoji, startX, y);
      }

      // Nome da tag ao lado
      ctx.fillStyle = "#ffffff";
      ctx.font = "30px Sans";
    ctx.shadowColor = "#000000";   
    ctx.shadowBlur = 4;          
    ctx.shadowOffsetX = 2;     
    ctx.shadowOffsetY = 2;
      ctx.fillText(name, startX + 50, y + 10);

      startX += spacing;
    }

    // 📊 Mensagens e tempo em call
    let totalMessages = 0;
    if (message.guild) {
      message.guild.channels.cache.forEach(channel => {
        if (channel.isTextBased()) {
          totalMessages += channel.messages.cache.filter(m => m.author.id === alvo.id).size;
        }
      });
    }

    // Pega o membro do servidor (se existir)
    const member = message.guild ? message.guild.members.cache.get(alvo.id) : null;

    let totalMinutes = 0;
    if (member?.voice?.channel) {
      const joinedTimestamp = member.voice.channel.joinedTimestamp || Date.now();
      totalMinutes = Math.floor((Date.now() - joinedTimestamp) / 1000 / 60);
    }

    // XP/Level
    const totalHours = totalMinutes / 60;
    const XP = Math.log(totalMessages + 1) * 12 + Math.pow(totalHours, 1.3) * 6;
    const level = Math.floor(Math.sqrt(XP));
    const xpPercent = Math.min((XP / Math.pow(level + 1, 2)) * 100, 100);

    // Barra de XP
    const barX = 55;
    const barY = 310;
    const barWidth = 646;
    const barHeight = 26;

    ctx.fillStyle = "#555555";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#9900ff";
    ctx.fillRect(barX, barY, (xpPercent / 100) * barWidth, barHeight);

    ctx.strokeStyle = "#b4b4b4";
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight); 

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Sans";
    ctx.shadowColor = "#000000";   
    ctx.shadowBlur = 4;          
    ctx.shadowOffsetX = 2;     
    ctx.shadowOffsetY = 2;
    ctx.fillText(`Level: ${level} (${xpPercent.toFixed(1)}%)`, 70, 330);


  // Casamento
if (user.marriedWith) {
  // Buscar usuário casado no cache do bot
  const marriedUser = await message.client.users.fetch(user.marriedWith).catch(() => null);

  if (marriedUser) {
    const ringImg = await loadImage("https://img.icons8.com/office/40/diamond-ring.png"); 
    const startX = 55; 
    const startY = 380; 

    const ringSize = 30;
    ctx.drawImage(ringImg, startX, startY - ringSize / 2, ringSize, ringSize);

    ctx.font = "25px Sans";
    ctx.fillStyle = "#ffb6c1";
    ctx.shadowColor = "#000000";   
    ctx.shadowBlur = 10;          
    ctx.shadowOffsetX = 2;     
    ctx.shadowOffsetY = 2;

    const textX = startX + ringSize + 10; 
    const textY = startY + 8;
    ctx.fillText(`Casado com ${marriedUser.username}`, textX, textY);
  }
}

    // Enviar imagem final
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }

};
