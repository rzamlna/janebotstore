import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("openstore")
    .setDescription("Buka store (rename voice channel ke STORE OPEN)"),

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
    await channel.setName("🟢┃STORE-OPEN");

    // LOCK VOICE CHANNEL (TIDAK BISA JOIN)
    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        Connect: false,
        Speak: false,
      }
    );

    await interaction.reply({
      content: "✅ Store berhasil dibuka (voice channel tetap terkunci).",
    });
  },
};
