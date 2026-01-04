import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import { GuildConfig } from "../../database/guildConfig.js";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("verify-button")
    .setDescription("Kirim pesan verify dengan tombol"),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 Owner only.",
        ephemeral: true,
      });
    }

    const config = await GuildConfig.findOne({
      guildId: interaction.guild.id,
    });

    if (!config || !config.verifyRoleId) {
      return interaction.reply({
        content:
          "⚠️ Verify role belum diset. Gunakan /setup-verifyrole dulu.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("✅ Verification")
      .setDescription("Klik tombol di bawah untuk mendapatkan role.")
      .setColor("#00FF99");

    const button = new ButtonBuilder()
      .setCustomId("verify_button")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    config.verifyMessageId = msg.id;
    await config.save();

    await interaction.followUp({
      content: "✅ Verify message berhasil dikirim.",
      ephemeral: true,
    });
  },
};
