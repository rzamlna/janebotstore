import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export function buildStoreEmbed() {
  const data = JSON.parse(fs.readFileSync(STORE_PATH));

  const embed = new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("📊 LIVE STOCK — JANESTORE")
    .setDescription("🔄 Update otomatis setiap **5 detik**")
    .setFooter({ text: "JANESTORE • Live Stock" })
    .setTimestamp();

  if (!data.items || data.items.length === 0) {
    embed.addFields({
      name: "Belum ada item",
      value: "Admin belum menambahkan produk",
    });
    return { embed, row: null };
  }

  let stockText = "";

  for (const item of data.items) {
    stockText +=
      `${item.name}\n` +
      `ID    : ${item.code}\n` +
      `Stock : ${item.stock}\n` +
      `Price : Rp${item.price.toLocaleString()}\n\n`;
  }

  embed.addFields({
    name: "📦 Produk",
    value: "```" + stockText + "```",
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("store_select_item")
    .setPlaceholder("Pilih item untuk order")
    .addOptions(
      data.items.map((item) => ({
        label: item.name,
        value: item.code,
        description: `Rp${item.price.toLocaleString()} | stok ${item.stock}`,
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  return { embed, row };
}
