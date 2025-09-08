import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';

// Registrar nova fonte que funcione
GlobalFonts.registerFromPath('./fonts/ComicSansMS.ttf', 'FunFont');

export default {
    name: 'perfil',
    description: 'Perfil final estilo Loritta ultra épico com efeitos de Gengar',
    execute: async (message, args) => {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        const width = 800;
        const height = 350;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1️⃣ Fundo gradiente
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#4b0082');
        gradient.addColorStop(0.3, '#6a0dad');
        gradient.addColorStop(0.6, '#800080');
        gradient.addColorStop(1, '#ff69b4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Banner do usuário
        const bannerURL = user.bannerURL({ format: 'png', size: 1024 });
        if (bannerURL) {
            try {
                const banner = await loadImage(bannerURL);
                ctx.globalAlpha = 0.25;
                ctx.drawImage(banner, 0, 0, width, height);
                ctx.globalAlpha = 1;

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 6;
                ctx.strokeRect(0, 0, width, height);
            } catch {}
        } else {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.strokeRect(0, 0, width, height);
        }

        // 2️⃣ Mini Gengars com brilho e sombra
        const gengarURLs = [
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/94.png',
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/94.png'
        ];
        const gengars = await Promise.all(gengarURLs.map(url => loadImage(url)));

        for (let i = 0; i < 300; i++) {
            const gengar = gengars[Math.floor(Math.random() * gengars.length)];
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 15 + Math.random() * 35;
            const rotation = Math.random() * Math.PI * 2;
            const alpha = 0.1 + Math.random() * 0.35;

            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(rotation);

            // sombra leve
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 4;

            ctx.globalAlpha = alpha;
            ctx.drawImage(gengar, -size / 2, -size / 2, size, size);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // reset shadow

        // 3️⃣ Avatar centralizado com moldura
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
        const avatarSize = 75;
        const avatarX = 25;
        const avatarY = height / 2 - avatarSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarSize / 2 + avatarX, height / 2, avatarSize / 2 + 6, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarSize / 2 + avatarX, height / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // 4️⃣ Informações do usuário
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px FunFont';
        ctx.fillText(user.username, 200, 80);

        ctx.font = '22px FunFont';

        // Ícones
        const iconCalendar = await loadImage('https://i.imgur.com/0Xb9J92.png');
        const iconDoor = await loadImage('https://i.imgur.com/tJ6b9Wq.png');
        const iconMessages = await loadImage('https://i.imgur.com/Z1eZx7R.png');
        const iconHeadset = await loadImage('https://i.imgur.com/0ZjZy8k.png');
        const iconStar = await loadImage('https://i.imgur.com/1Sx9G2W.png');

        // Datas
        ctx.drawImage(iconCalendar, 180, 100, 22, 22);
        ctx.fillText(`${new Date(user.createdTimestamp).toLocaleDateString('pt-BR')}`, 210, 123);

        ctx.drawImage(iconDoor, 180, 135, 22, 22);
        ctx.fillText(`${new Date(member.joinedTimestamp).toLocaleDateString('pt-BR')}`, 210, 158);

        // Mensagens e tempo em call (agora em minutos)
        let totalMessages = 0;
        message.guild.channels.cache.forEach(channel => {
            if (channel.isTextBased()) {
                totalMessages += channel.messages.cache.filter(m => m.author.id === user.id).size;
            }
        });

        let totalMinutes = 0;
        if (member.voice.channel) {
            const joinedTimestamp = member.voice?.channel.joinedTimestamp || Date.now();
            totalMinutes = Math.floor((Date.now() - joinedTimestamp) / 1000 / 60);
        }

        // XP/Level (a conversão ainda é feita internamente em horas)
        const totalHours = totalMinutes / 60;
        const XP = Math.log(totalMessages + 1) * 12 + Math.pow(totalHours, 1.3) * 6;
        const level = Math.floor(Math.sqrt(XP));
        const xpPercent = Math.min((XP / Math.pow(level + 1, 2)) * 100, 100);

        ctx.drawImage(iconMessages, 180, 165, 22, 22);
        ctx.fillText(`${totalMessages}`, 210, 188);

        ctx.drawImage(iconHeadset, 180, 195, 22, 22);
        ctx.fillText(`${totalMinutes}min`, 210, 218);

        ctx.drawImage(iconStar, 180, 225, 22, 22);
        ctx.fillText(`Level: ${level} (${xpPercent.toFixed(1)}%)`, 210, 248);

        // 5️⃣ Barra de XP colorida
        const barX = 200;
        const barY = 260;
        const barWidth = 550;
        const barHeight = 20;

        ctx.fillStyle = '#555555';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(barX, barY, (xpPercent / 100) * barWidth, barHeight);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 6️⃣ Enviar imagem
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
        await message.reply({ files: [attachment] });
    }
};
