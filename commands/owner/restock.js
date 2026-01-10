import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import { markStoreUpdated } from "../../store/storeService.js";

const STORE_PATH = "./store/storeData.json";

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("restock")
    .setDescription("Restock item JANESTORE")
    .addStringOption(opt =>
      opt
        .setName("code")
        .setDescription("Kode item (contoh: vip, prime)")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("jumlah")
        .setDescription("Jumlah restock")
        .setRequired(true)
    ),

  async execute(interaction) {
    const code = interaction.options.getString("code").toLowerCase();
    const amount = interaction.options.getInteger("jumlah");

    if (amount <= 0) {
      return interaction.reply({
        content: "⚠️ Jumlah restock harus lebih dari 0",
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

    const before = item.stock;
    item.stock += amount;

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));

    // 🔥 INI KUNCINYA (BIAR UPDATE LANGSUNG)
    markStoreUpdated();

    await interaction.reply({
      content: `✅ **${item.name} (${item.code.toUpperCase()})** berhasil direstock (+${amount})`,
      ephemeral: true,
    });

    // ==========================
    // WEBHOOK RESTOCK (OPSIONAL)
    // ==========================
    const webhookUrl = process.env.RESTOCK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const ping = process.env.RESTOCK_PING || "";

    const embed = new EmbedBuilder()
      .setColor("#00FF99")
      .setTitle("📦 RESTOCK JANESTORE")
      .addFields(
        {
          name: "Item",
          value: `${item.name} (${item.code.toUpperCase()})`,
          inline: true,
        },
        {
          name: "Stok",
          value: `${before} → ${item.stock}`,
          inline: true,
        },
        {
          name: "Direstock oleh",
          value: `<@${interaction.user.id}>`,
          inline: false,
        }
      )
      .setFooter({ text: "JANESTORE • Restock Info" })
      .setTimestamp();

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: ping,
          embeds: [embed],
        }),
      });
    } catch (err) {
      console.error("Restock webhook error:", err.message);
    }
  },
};
