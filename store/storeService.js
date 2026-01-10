import fs from "fs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

const STORE_PATH = "./store/storeData.json";
const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let storeDirty = true;
let storeMessage = null;

// dipanggil dari restock & order_success
export function markStoreUpdated() {
  storeDirty = true;
}

export async function initStore(client) {
  if (!STORE_CHANNEL_ID) return;

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel?.isTextBased()) return;

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
    storeDirty = false;
  }

  // cek tiap 8 detik
  setInterval(async () => {
    if (!storeDirty) return;

    try {
      const { embed, row } = buildStoreEmbed();
      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
      storeDirty = false;
    } catch (e) {
      console.error("Live stock update error:", e.message);
    }
  }, 8000);
}

function buildStoreEmbed() {
  const data = JSON.parse(fs.readFileSync(STORE_PATH));

  const embed = new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("📊 LIVE STOCK — JANESTORE")
    .setDescription("🟢 Updated just now")
    .setFooter({ text: "JANESTORE • Live Stock" })
    .setTimestamp();

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
    value: "```" + (text || "-") + "```",
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
