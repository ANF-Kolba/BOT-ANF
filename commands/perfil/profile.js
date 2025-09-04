import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { User, Cosmetic } from "../../utils/database.js";

export default {
  name: "profile",
  description: "Mostra o perfil com coins, descrição e cargos do usuário",
  async execute(message) {
    // Usuário alvo
    const alvo = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(alvo.id);

    // Dados do banco
    const user = await User.findByPk(alvo.id);
    if (!user) {
      return message.reply("❌ Esse usuário ainda não tem perfil. Use um comando de economia antes.");
    }

    let banner = user.equippedBanner ? await Cosmetic.findByPk(user.equippedBanner) : null;

    // Canvas
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    // Fundo (banner ou cor padrão)
    if (banner) {
      const bg = await loadImage(banner.url);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#2c2f33"; // cor sólida
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Avatar
    const avatar = await loadImage(alvo.displayAvatarURL({ extension: "png", size: 128 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(100, 100, 70, 0, Math.PI * 2, true);
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
    ctx.fillText(`${user.coins} ANF Coins`, 220, 152);

    // Cargos
    ctx.font = "20px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Cargos:", 180, 190);

    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .first(3);

    roles.forEach((role, i) => {
      ctx.fillStyle = role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "#ffffff";
      ctx.fillText(`@${role.name}`, 180, 220 + i * 30);
    });

    // Enviar imagem final
    const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });
    return message.channel.send({ files: [attachment] });
  }
};
