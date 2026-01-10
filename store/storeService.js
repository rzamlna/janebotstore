import { buildStoreEmbed } from "./storeEmbed.js";

let storeMessage = null;
let lastUpdate = Date.now();

// ✅ INI YANG KAMU BUTUH
export function markStoreUpdated() {
  lastUpdate = Date.now();
}

// ✅ INI UNTUK INIT & AUTO REFRESH
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

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed("just now");
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // 🔁 AUTO REFRESH TIAP 8 DETIK
  setInterval(async () => {
    try {
      const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
      const label = seconds <= 1 ? "just now" : `${seconds} seconds ago`;

      const { embed, row } = buildStoreEmbed(label);
      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (e) {
      console.error("[STORE] Refresh error:", e.message);
    }
  }, 8000);
      }
