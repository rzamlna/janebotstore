import { SlashCommandBuilder } from "discord.js";
import { GuildConfig } from "../../database/guildConfig.js";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("setup-verifyrole")
    .setDescription("Set role untuk sistem verify")
    .addRoleOption(opt =>
      opt
        .setName("role")
        .setDescription("Role verify")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 Owner only.",
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole("role");

    let config = await GuildConfig.findOne({
      guildId: interaction.guild.id,
    });

    if (!config) {
      config = new GuildConfig({
        guildId: interaction.guild.id,
      });
    }

    config.verifyRoleId = role.id;
    await config.save();

    await interaction.reply({
      content: `✅ Verify role diset ke **${role.name}**`,
      ephemeral: true,
    });
  },
};
