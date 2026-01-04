import fs from "fs";
import { SlashCommandBuilder } from "discord.js";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "admin",
  data: new SlashCommandBuilder()
    .setName("setstock")
    .setDescription("Ubah stok item di JANESTORE")
    .addStringOption(o =>
      o.setName("nama")
        .setDescription("Nama item")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("stok")
        .setDescription("Stok baru")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nama = interaction.options.getString("nama");
    const stok = interaction.options.getInteger("stok");

    const data = JSON.parse(fs.readFileSync(STORE_PATH));
    const item = data.items.find(
      i => i.name.toLowerCase() === nama.toLowerCase()
    );

    if (!item) {
      return interaction.reply({
        content: "❌ Item tidak ditemukan.",
        ephemeral: true,
      });
    }

    item.stock = stok;
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));

    await interaction.reply({
      content: `✅ Stok **${item.name}** diubah menjadi **${stok}**`,
      ephemeral: true,
    });
  },
};
