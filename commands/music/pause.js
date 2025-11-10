import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("⏸️ Jeda musik"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply("❌ Tidak ada musik untuk dijeda.");
    queue.pause();
    interaction.reply("⏸️ Musik dijeda.");
  },
};
