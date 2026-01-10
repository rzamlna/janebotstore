import { buildStoreEmbed } from "./storeEmbed.js";

let storeMessage = null;

export function markStoreUpdated() {
  // sekarang kosong, tapi tetap dipanggil
  // biar struktur rapi & future-proof
}

export async function initStore(client) {
  const CHANNEL_ID = process.env.STORE_CHANNEL_ID;
  if (!CHANNEL_ID) return;

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel?.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 5 });
  storeMessage = messages.find(
    m => m.author.id === client.user.id && m.embeds.length
  );

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed();
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // 🔁 REFRESH SETIAP 8 DETIK
  setInterval(async () => {
    try {
      const { embed, row } = buildStoreEmbed();
      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (e) {
      console.error("[STORE] Refresh error:", e.message);
    }
  }, 8000);
}
