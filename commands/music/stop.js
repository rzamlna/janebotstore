import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("🛑 Hentikan musik dan keluar dari voice channel"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply("❌ Tidak ada musik yang sedang diputar.");
    queue.stop();
    interaction.reply("🛑 Musik dihentikan, bot keluar dari channel.");
  },
};
