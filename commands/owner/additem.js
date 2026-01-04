import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Menambahkan item baru ke JANESTORE")
    .addStringOption(opt =>
      opt
        .setName("code")
        .setDescription("Kode item singkat (contoh: vip, prime)")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName("name")
        .setDescription("Nama item")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("price")
        .setDescription("Harga item")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("stock")
        .setDescription("Stok awal")
        .setRequired(true)
    ),

  async execute(interaction) {
    const code = interaction.options.getString("code").toLowerCase();
    const name = interaction.options.getString("name");
    const price = interaction.options.getInteger("price");
    const stock = interaction.options.getInteger("stock");

    if (price <= 0 || stock < 0) {
      return interaction.reply({
        content: "⚠️ Harga harus > 0 dan stok tidak boleh negatif",
        ephemeral: true,
      });
    }

    const store = JSON.parse(fs.readFileSync(STORE_PATH));

    // cek code unik
    if (store.items.some(i => i.code === code)) {
      return interaction.reply({
        content: "❌ Code item sudah digunakan",
        ephemeral: true,
      });
    }

    store.items.push({
      code,
      name,
      price,
      stock,
    });

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));

    await interaction.reply({
      content:
        `✅ Item berhasil ditambahkan\n\n` +
        `📦 **${name} (${code.toUpperCase()})**\n` +
        `💰 Harga: Rp${price.toLocaleString()}\n` +
        `📦 Stok: ${stock}`,
      ephemeral: true,
    });
  },
};
