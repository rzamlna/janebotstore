import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  category: "general",
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Informasi pembayaran JANESTORE via bank"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#00FF99")
      .setTitle("💳 Pembayaran JANESTORE")
      .setDescription(
        "Dikarenakan **QRIS sedang limit**, pembayaran saat ini bisa dilakukan melalui **SEABANK**.\n\n" +
        "**Nomor Rekening:**\n" +
        "`901107867792`\n" +
        "**Atas Nama:**\n" +
        "**REZA MAULANA**\n\n" +
        "Setelah transfer, silakan kirim **bukti pembayaran** di ticket order kamu."
      )
      .setFooter({ text: "JANESTORE • Pembayaran Aman & Terpercaya" })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed], // ⬅️ publik (bisa dilihat semua)
    });
  },
};
