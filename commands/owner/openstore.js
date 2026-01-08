import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("openstore")
    .setDescription("Buka store dan kirim pengumuman"),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 hanya owner yang bisa pakai command ini",
        ephemeral: true,
      });
    }

    const voiceChannel = await interaction.guild.channels.fetch(
      process.env.STORE_VOICE_CHANNEL_ID
    );
    const announceChannel = await interaction.guild.channels.fetch(
      process.env.ANNOUNCEMENT_CHANNEL_ID
    );

    // edit nama channel voice
    await voiceChannel.setName("🟢|STORE OPEN");

    // pastikan voice channel terkunci
    await voiceChannel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        Connect: false,
      }
    );

    // kirim announcement
    const roleMention = `<@&${process.env.ANNOUNCE_ROLE_ID}>`;

    await announceChannel.send(
      `${roleMention}\n\n` +
      "**STORE OPEN**\n\n" +
      "janestore udah buka ya.\n" +
      "kalau mau order langsung gas aja, stok ready.\n\n" +
      "proses cepat, aman, dan jelas.\n" +
      "Terimakasih - JANESTORE"
    );

    await interaction.reply({
      content: "✅ store berhasil dibuka",
      ephemeral: true,
    });
  },
};
