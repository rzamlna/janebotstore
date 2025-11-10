import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("🎶 Putar lagu dari YouTube atau Spotify")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("Judul lagu atau URL")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString("query");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.editReply("⚠️ Kamu harus berada di voice channel dulu.");
      return;
    }

    try {
      await interaction.client.distube.play(voiceChannel, query, {
        textChannel: interaction.channel,
        member: interaction.member,
      });

      await interaction.editReply(`🎧 Memutar: **${query}**`);
    } catch (err) {
      console.error("Play error:", err);
      await interaction.editReply("⚠️ Gagal memutar lagu, periksa URL atau FFmpeg.");
    }
  },
};
