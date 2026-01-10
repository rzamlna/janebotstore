import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;
const REFRESH_INTERVAL = 8000; // 8 detik

let storeMessage = null;
let lastUpdate = Date.now();

export async function initStore(client) {
  if (!STORE_CHANNEL_ID) {
    console.log("❌ STORE_CHANNEL_ID belum diset");
    return;
  }

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    console.log("❌ Store channel tidak valid");
    return;
  }

  // ==========================
  // CARI MESSAGE LAMA
  // ==========================
  const messages = await channel.messages.fetch({ limit: 5 });
  storeMessage = messages.find(
    (m) => m.author.id === client.user.id && m.embeds.length
  );

  // ==========================
  // JIKA BELUM ADA → KIRIM BARU
  // ==========================
  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed(lastUpdate);
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // ==========================
  // AUTO REFRESH TIAP 8 DETIK
  // ==========================
  setInterval(async () => {
    try {
      lastUpdate = Date.now();
      const { embed, row } = buildStoreEmbed(lastUpdate);

      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (err) {
      console.error("Store refresh error:", err.message);
    }
  }, REFRESH_INTERVAL);

  console.log("🛒 LIVE STOCK JANESTORE aktif (refresh 8 detik)");
}
