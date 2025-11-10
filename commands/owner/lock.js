import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("🔒Channel terkunci."),

  async execute(interaction) {
    const channel = interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
    });

    await interaction.reply({
      content: `🔒 Channel ${channel} telah dikunci.`,
    });
  },
};
