import { SlashCommandBuilder } from "discord.js";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("closestore")
    .setDescription("Tutup store (rename voice channel ke STORE CLOSED)"),

  async execute(interaction) {
    // OWNER ONLY
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 Hanya owner yang bisa menggunakan command ini.",
        ephemeral: true,
      });
    }

    const channelId = process.env.STORE_CHANNEL_ID;
    const channel = await interaction.client.channels
      .fetch(channelId)
      .catch(() => null);

    if (!channel) {
      return interaction.reply({
        content: "❌ Channel store tidak ditemukan.",
        ephemeral: true,
      });
    }

    // RENAME CHANNEL
    await channel.setName("🔴┃STORE-CLOSED");

    // PASTIKAN TETAP TERKUNCI
    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        Connect: false,
        Speak: false,
      }
    );

    await interaction.reply({
      content: "❌ Store berhasil ditutup.",
    });
  },
};
