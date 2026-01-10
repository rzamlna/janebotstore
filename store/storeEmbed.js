import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import fs from "fs";

const STORE_PATH = "./store/storeData.json";

export function buildStoreEmbed(animation = ".") {
  const data = JSON.parse(fs.readFileSync(STORE_PATH));

  const embed = new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("📊 LIVE STOCK — JANESTORE")
    .setDescription(`🔄 Updating${animation}`)
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
  // LIST ITEM + SOLD
  // ==========================
  let stockText = "";

  for (const item of data.items) {
    const sold = Number(item.sold ?? 0);

    stockText +=
      `${item.name}\n` +
      `ID    : ${item.code}\n` +
      `Stock : ${item.stock}\n` +
      `Sold  : ${sold}\n` +
      `Price : Rp${item.price.toLocaleString()}\n\n`;
  }

  embed.addFields({
    name: "📦 Produk",
    value: "```" + stockText + "```",
  });

  // ==========================
  // DROPDOWN PILIH ITEM
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
