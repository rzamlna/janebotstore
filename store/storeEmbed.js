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
    .setDescription("🟢 Updated just now")
    .setFooter({ text: "JANESTORE • Live Stock" })
    .setTimestamp(); // ⬅️ PENTING (reset setiap refresh)

  if (!data.items || data.items.length === 0) {
    embed.addFields({
      name: "📦 Produk",
      value: "Belum ada item",
    });

    return { embed, row: null };
  }

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

  const select = new StringSelectMenuBuilder()
    .setCustomId("store_select_item")
    .setPlaceholder("Pilih item untuk order")
    .addOptions(
      data.items.map(i => ({
        label: i.name,
        value: i.code,
        description: `Rp${i.price.toLocaleString()} | stok ${i.stock}`,
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, row };
}
