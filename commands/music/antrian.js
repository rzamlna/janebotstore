import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("antrian")
    .setDescription("📜 Lihat daftar lagu di antrian"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply("❌ Tidak ada lagu di antrian.");

    const embed = new EmbedBuilder()
      .setTitle("🎵 Daftar Antrian")
      .setDescription(
        queue.songs
          .map((song, i) => `${i === 0 ? "▶️" : `${i}.`} ${song.name} - ${song.formattedDuration}`)
          .join("\n")
      )
      .setColor("#1DB954");

    interaction.reply({ embeds: [embed] });
  },
};
