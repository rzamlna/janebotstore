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
    .setTitle("🛒 JANESTORE")
    .setDescription("Pilih item lalu lanjutkan order")
    .setFooter({ text: "Auto update • JANESTORE" })
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
  // LIST ITEM (PAKAI CODE)
  // ==========================
  data.items.forEach((item) => {
    embed.addFields({
      name: `${item.name} 〔${item.code.toUpperCase()}〕`,
      value:
        `💰 Harga: **Rp${item.price.toLocaleString()}**\n` +
        `📦 Stok: **${item.stock}**`,
      inline: false,
    });
  });

  // ==========================
  // DROPDOWN SELECT ITEM (VALUE = CODE)
  // ==========================
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("store_select_item")
    .setPlaceholder("Pilih item")
    .addOptions(
      data.items.map((item) => ({
        label: item.name,
        value: item.code, // ⬅️ PAKAI CODE, BUKAN NAME
        description: `Rp${item.price.toLocaleString()} | stok ${item.stock}`,
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  return { embed, row };
}
