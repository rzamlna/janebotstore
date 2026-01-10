import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export function buildStoreEmbed(secondsLeft = 10) {
  const data = JSON.parse(fs.readFileSync(STORE_PATH));

  const embed = new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("📊 LIVE STOCK — JANESTORE")
    .setDescription(`🔄 Update in **${secondsLeft} seconds**`)
    .setFooter({ text: "JANESTORE • Live Stock" })
    .setTimestamp();

  // ==========================
  // JIKA BELUM ADA ITEM
  // ==========================
  if (!data.items || data.items.length === 0) {
    embed.addFields({
      name: "Belum ada item",
      value: "Admin belum menambahkan produk",
    });

    return { embed, row: null };
  }

  // ==========================
  // LIST ITEM (FORMAT RAPINH)
  // ==========================
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

  // ==========================
  // DROPDOWN SELECT ITEM
  // ==========================
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("store_select_item")
    .setPlaceholder("Pilih item untuk order")
    .addOptions(
      data.items.map((item) => ({
        label: item.name,
        value: item.code, // pakai CODE
        description: `Rp${item.price.toLocaleString()} | stok ${item.stock}`,
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  return { embed, row };
}
