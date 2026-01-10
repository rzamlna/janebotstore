import fs from "fs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

const STORE_PATH = "./store/storeData.json";
const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let lastUpdatedAt = Date.now();
let storeMessage = null;

/**
 * Dipanggil oleh:
 * - /restock
 * - order_success
 */
export function markStoreUpdated() {
  lastUpdatedAt = Date.now();
}

/**
 * INIT + AUTO REFRESH LIVE STOCK
 */
export async function initStore(client) {
  if (!STORE_CHANNEL_ID) {
    console.log("❌ STORE_CHANNEL_ID belum diset");
    return;
  }

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel?.isTextBased()) return;

  // cari message lama
  const msgs = await channel.messages.fetch({ limit: 5 });
  storeMessage = msgs.find(
    m => m.author.id === client.user.id && m.embeds.length
  );

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed();
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // 🔁 refresh tiap 8 detik
  setInterval(async () => {
    try {
      const { embed, row } = buildStoreEmbed();
      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (e) {
      console.error("Live stock update error:", e.message);
    }
  }, 8000);
}

/**
 * BUILD EMBED
 */
function buildStoreEmbed() {
  const data = JSON.parse(fs.readFileSync(STORE_PATH));

  const secondsAgo = Math.floor((Date.now() - lastUpdatedAt) / 1000);
  const updatedText =
    secondsAgo <= 1
      ? "🟢 Updated just now"
      : `🟢 Updated ${secondsAgo} seconds ago`;

  const embed = new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("📊 LIVE STOCK — JANESTORE")
    .setDescription(updatedText)
    .setFooter({ text: "JANESTORE • Live Stock" })
    .setTimestamp();

  if (!data.items || data.items.length === 0) {
    embed.addFields({
      name: "Belum ada item",
      value: "Admin belum menambahkan produk",
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
