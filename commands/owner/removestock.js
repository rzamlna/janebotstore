import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("removestock")
    .setDescription("Mengurangi stok item JANESTORE")
    .addStringOption(opt =>
      opt
        .setName("code")
        .setDescription("Kode item (contoh: vip, prime)")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("jumlah")
        .setDescription("Jumlah stok yang dikurangi")
        .setRequired(true)
    ),

  async execute(interaction) {
    const code = interaction.options.getString("code").toLowerCase();
    const amount = interaction.options.getInteger("jumlah");

    if (amount <= 0) {
      return interaction.reply({
        content: "⚠️ Jumlah harus lebih dari 0",
        ephemeral: true,
      });
    }

    const store = JSON.parse(fs.readFileSync(STORE_PATH));
    const item = store.items.find(i => i.code === code);

    if (!item) {
      return interaction.reply({
        content: "❌ Item dengan kode tersebut tidak ditemukan",
        ephemeral: true,
      });
    }

    if (item.stock < amount) {
      return interaction.reply({
        content: `⚠️ Stok tidak cukup (stok sekarang: ${item.stock})`,
        ephemeral: true,
      });
    }

    item.stock -= amount;

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));

    await interaction.reply({
      content: `➖ Stok **${item.name} (${item.code.toUpperCase()})** dikurangi ${amount}\n📦 Sisa stok: **${item.stock}**`,
      ephemeral: true,
    });
  },
};
