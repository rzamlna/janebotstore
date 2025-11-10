import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("▶️ Lanjutkan musik yang dijeda"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply("❌ Tidak ada musik untuk dilanjutkan.");
    queue.resume();
    interaction.reply("▶️ Musik dilanjutkan.");
  },
};
