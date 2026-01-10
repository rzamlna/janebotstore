import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { markStoreUpdated } from "../../store/storeService.js";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("setsold")
    .setDescription("Set sold item secara manual (JANESTORE)")
    .addStringOption(opt =>
      opt
        .setName("code")
        .setDescription("Kode item (contoh: vip, prime)")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("jumlah")
        .setDescription("Jumlah sold baru")
        .setRequired(true)
    ),

  async execute(interaction) {
    // owner only
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "🚫 Hanya owner yang bisa menggunakan command ini.",
        ephemeral: true,
      });
    }

    const code = interaction.options.getString("code").toLowerCase();
    const sold = interaction.options.getInteger("jumlah");

    if (sold < 0) {
      return interaction.reply({
        content: "⚠️ Jumlah sold tidak boleh negatif.",
        ephemeral: true,
      });
    }

    const store = JSON.parse(fs.readFileSync(STORE_PATH));
    const item = store.items.find(i => i.code === code);

    if (!item) {
      return interaction.reply({
        content: "❌ Item dengan kode tersebut tidak ditemukan.",
        ephemeral: true,
      });
    }

    const before = item.sold ?? 0;
    item.sold = sold;

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));

    // 🔥 trigger live stock refresh
    markStoreUpdated();

    await interaction.reply({
      content:
        `✅ **Sold berhasil diupdate**\n\n` +
        `Item: **${item.name} (${item.code.toUpperCase()})**\n` +
        `Sold: **${before} → ${item.sold}**`,
      ephemeral: true,
    });
  },
};
