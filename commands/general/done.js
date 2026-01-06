import { SlashCommandBuilder } from "discord.js";

export default {
  category: "general",
  data: new SlashCommandBuilder()
    .setName("done")
    .setDescription("Pesan order selesai JANESTORE (owner only)"),

  async execute(interaction) {
    // === OWNER CHECK ===
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 Command ini hanya bisa digunakan oleh owner.",
        ephemeral: true, // ❗ hanya error message yang ephemeral
      });
    }

    // === PUBLIC MESSAGE ===
    await interaction.reply({
      content:
        "✅ **ORDER SELESAI**\n\n" +
        "Terima kasih telah melakukan order di **JANESTORE** 🙏\n" +
        "Pesanan kamu sudah berhasil kami proses.\n\n" +
        "Jika ada kendala atau ingin order kembali, jangan ragu untuk menghubungi kami.\n\n" +
        "✨ **JANESTORE – Fast, Safe, Trusted**",
      // ❌ TIDAK pakai ephemeral → semua orang bisa lihat
    });
  },
};
