import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("🔓 Channel terbuka."),

  async execute(interaction) {
    const channel = interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: true,
    });

    await interaction.reply({
      content: `🔓 Channel ${channel} telah dibuka.`,
    });
  },
};
