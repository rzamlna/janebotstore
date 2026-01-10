import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let storeMessage = null;
let lastUpdate = Date.now();
let started = false;

// ==========================
// FORMAT "UPDATED X SECONDS AGO"
// ==========================
function formatAgo(ms) {
  const sec = Math.floor(ms / 1000);
  if (sec <= 1) return "just now";
  return `${sec} seconds ago`;
}

// ==========================
// INIT STORE (DIPANGGIL DI ready.js)
// ==========================
export async function initStore(client) {
  if (started) return;
  started = true;

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 10 });
  storeMessage = messages.find(
    (m) => m.author.id === client.user.id && m.embeds.length
  );

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed("just now");
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // ==========================
  // UPDATE EMBED TIAP 1 DETIK (RINGAN)
  // ==========================
  setInterval(async () => {
    try {
      const ago = formatAgo(Date.now() - lastUpdate);
      const { embed, row } = buildStoreEmbed(ago);

      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch {}
  }, 1000);
}

// ==========================
// PANGGIL SETIAP STOCK BERUBAH
// ==========================
export function markStoreUpdated() {
  lastUpdate = Date.now();
}
