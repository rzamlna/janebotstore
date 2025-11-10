import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Kirim pesan untuk membuka sistem ticket support"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎟️ Support Ticket")
      .setDescription("Klik tombol di bawah untuk membuat ticket baru.\n\n📩 Hanya moderator yang dapat melihat ticket kamu.")
      .setColor("#00BFFF");

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("🎫 Create Ticket")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }
};
