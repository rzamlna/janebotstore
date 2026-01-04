import fs from "fs";
import { SlashCommandBuilder } from "discord.js";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "admin",
  data: new SlashCommandBuilder()
    .setName("deleteitem")
    .setDescription("Hapus item dari JANESTORE")
    .addStringOption(o =>
      o.setName("nama")
        .setDescription("Nama item")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nama = interaction.options.getString("nama");

    const data = JSON.parse(fs.readFileSync(STORE_PATH));
    const index = data.items.findIndex(
      i => i.name.toLowerCase() === nama.toLowerCase()
    );

    if (index === -1) {
      return interaction.reply({
        content: "❌ Item tidak ditemukan.",
        ephemeral: true,
      });
    }

    const removed = data.items.splice(index, 1)[0];
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));

    await interaction.reply({
      content: `🗑️ Item **${removed.name}** berhasil dihapus dari JANESTORE`,
      ephemeral: true,
    });
  },
};
