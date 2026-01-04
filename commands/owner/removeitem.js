import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("removeitem")
    .setDescription("Menghapus item dari JANESTORE")
    .addStringOption(opt =>
      opt
        .setName("code")
        .setDescription("Kode item (contoh: vip, prime)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const code = interaction.options.getString("code").toLowerCase();

    const store = JSON.parse(fs.readFileSync(STORE_PATH));
    const index = store.items.findIndex(i => i.code === code);

    if (index === -1) {
      return interaction.reply({
        content: "❌ Item dengan kode tersebut tidak ditemukan",
        ephemeral: true,
      });
    }

    const removed = store.items[index];
    store.items.splice(index, 1);

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));

    await interaction.reply({
      content: `🗑️ Item **${removed.name} (${removed.code.toUpperCase()})** berhasil dihapus`,
      ephemeral: true,
    });
  },
};
