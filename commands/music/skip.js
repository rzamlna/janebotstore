import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("⏭️ Lewati lagu yang sedang diputar"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply("❌ Tidak ada lagu yang sedang diputar.");
    queue.skip();
    interaction.reply("⏭️ Lagu dilewati!");
  },
};
