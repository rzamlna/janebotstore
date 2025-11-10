import Canvas from "canvas";
import { AttachmentBuilder } from "discord.js";

export default async (client, member) => {
  const channelId = "1437283324627255462"; // ganti dengan ID channel target
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  // buat canvas
  const canvas = Canvas.createCanvas(512, 512);
  const ctx = canvas.getContext("2d");

  // background warna gradasi lembut
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#232526");
  gradient.addColorStop(1, "#414345");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // tulis teks welcome
  ctx.font = "bold 42px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("Selamat Datang!", 256, 420);

  // username
  ctx.font = "32px Sans";
  ctx.fillStyle = "#00ffcc";
  ctx.fillText(member.user.username, 256, 470);

  // buat frame avatar (bulat)
  ctx.beginPath();
  ctx.arc(256, 200, 120, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  // ambil foto profil user
  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "png", size: 512 }));
  ctx.drawImage(avatar, 136, 80, 240, 240);

  // kirim ke channel
  const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "welcome.png" });
  channel.send({
    content: `Selamat datang <@${member.id}> di **${member.guild.name}**!`,
    files: [attachment],
  });
};

