import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";
import { GuildConfig } from "../../database/guildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("verify-button")
    .setDescription("Send a verification message with a button (owner only)"),

  async execute(interaction) {
    // hanya owner yang bisa jalankan
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 Only the bot owner can use this command.",
        ephemeral: true
      });
    }

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config?.verifyRoleId)
      return interaction.reply({
        content:
          "⚠️ Verify role belum diset! Gunakan command /setup-verifyrole [role] terlebih dahulu.",
        ephemeral: true
      });

    const embed = new EmbedBuilder()
      .setTitle("✅ Verification")
      .setDescription("Press the button below to get verified!")
      .setColor("#2b2d31");

    const button = new ButtonBuilder()
      .setCustomId("verify_button")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    config.verifyMessageId = msg.id;
    await config.save();

    await interaction.followUp({
      content: "✅ Verification button sent successfully!",
      ephemeral: true
    });
  }
};
