import { buildStoreEmbed } from "./storeEmbed.js";

let storeMessage = null;
let lastUpdate = Date.now();

// 🔥 DIPANGGIL SAAT RESTOCK / ORDER SUCCESS
export function markStoreUpdated() {
  lastUpdate = Date.now();
}

export async function initStore(client) {
  const CHANNEL_ID = process.env.STORE_CHANNEL_ID;
  if (!CHANNEL_ID) {
    console.log("[STORE] STORE_CHANNEL_ID belum diset");
    return;
  }

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel?.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 5 });
  storeMessage = messages.find(
    m => m.author.id === client.user.id && m.embeds.length
  );

  // JIKA BELUM ADA MESSAGE → BUAT
  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed(lastUpdate);
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // 🔁 AUTO REFRESH TIAP 8 DETIK
  setInterval(async () => {
    try {
      const { embed, row } = buildStoreEmbed(lastUpdate);
      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (e) {
      console.error("[STORE] Refresh error:", e.message);
    }
  }, 8000);
}
