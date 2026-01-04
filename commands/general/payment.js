import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  category: "general",
  data: new SlashCommandBuilder()
    .setName("payment")
    .setDescription("Metode pembayaran JANESTORE"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#00FF99")
      .setTitle("💳 JANESTORE PAYMENT")
      .setDescription(
        "Silakan lakukan pembayaran menggunakan QRIS di bawah ini.\n" +
        "Pastikan nominal sesuai dengan total order."
      )
      .setImage("https://cdn.discordapp.com/attachments/1457410967938797712/1457411079624851467/qris.png?ex=695be756&is=695a95d6&hm=3d343628e9c3c3d711bfccfcfa707fdcedb2259ab547902844afeb7d03e83fb4")
      .setFooter({ text: "JANESTORE • Pembayaran" });

    await interaction.reply({
      embeds: [embed],
      // ❌ JANGAN pakai ephemeral:true
      // default = public
    });
  },
};
