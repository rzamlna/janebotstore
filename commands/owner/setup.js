import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { GuildConfig } from "../../database/guildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setup-verifyrole")
    .setDescription("Set role yang akan diberikan saat verifikasi (admin only)")
    .addRoleOption(opt =>
      opt.setName("role").setDescription("Pilih role verifikasi").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) config = new GuildConfig({ guildId: interaction.guild.id });

    config.verifyRoleId = role.id;
    await config.save();

    await interaction.reply({
      content: `✅ Verify role diset ke **${role.name}**`,
      ephemeral: true
    });
  }
};
