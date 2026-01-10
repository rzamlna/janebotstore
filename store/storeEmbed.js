// store/storeEmbed.js
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export function buildStoreEmbed(lastUpdateTs) {
  const data = JSON.parse(fs.readFileSync(STORE_PATH));

  const secondsAgo = Math.floor((Date.now() - lastUpdateTs) / 1000);
  const updateText =
    secondsAgo <= 1 ? "just now" : `${secondsAgo} seconds ago`;

  const embed = new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("📊 LIVE STOCK — JANESTORE")
    .setDescription(`🟢 Updated ${updateText}`)
    .setFooter({ text: "JANESTORE • Live Stock" })
    .setTimestamp();

  // ==========================
  // JIKA BELUM ADA ITEM
  // ==========================
  if (!data.items || data.items.length === 0) {
    embed.addFields({
      name: "📦 Produk",
      value: "Belum ada produk tersedia",
    });
    return { embed, row: null };
  }

  // ==========================
  // LIST ITEM
  // ==========================
  let text = "";

  for (const item of data.items) {
    text +=
      `${item.name}\n` +
      `ID    : ${item.code}\n` +
      `Stock : ${item.stock}\n` +
      `Sold  : ${item.sold ?? 0}\n` +
      `Price : Rp${item.price.toLocaleString()}\n\n`;
  }

  embed.addFields({
    name: "📦 Produk",
    value: "```" + text + "```",
  });

  // ==========================
  // DROPDOWN ORDER
  // ==========================
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
