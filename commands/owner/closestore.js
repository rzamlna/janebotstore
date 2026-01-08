import { SlashCommandBuilder } from "discord.js";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("closestore")
    .setDescription("Tutup store dan kirim pengumuman"),

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
    await voiceChannel.setName("🔴|STORE CLOSED");

    // kirim announcement
    const roleMention = `<@&${process.env.ANNOUNCE_ROLE_ID}>`;

    await announceChannel.send(
      `${roleMention}\n\n` +
      "**STORE CLOSED**\n\n" +
      "JANESTORE tutup dulu untuk sementara.\n" +
      "terima kasih buat semua yang sudah order hari ini.\n\n" +
      "info buka lagi bakal diumumin di sini."
    );

    await interaction.reply({
      content: "✅ store berhasil ditutup",
      ephemeral: true,
    });
  },
};
