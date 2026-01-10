import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;
const UPDATE_INTERVAL = 5000; // ⬅️ 5 detik (ms)

let storeMessage = null;
let intervalStarted = false;

export async function initStore(client) {
  if (intervalStarted) return; // ⬅️ PENTING: cegah double interval
  intervalStarted = true;

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 5 });
  storeMessage = messages.find(
    (m) => m.author.id === client.user.id && m.embeds.length
  );

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed();
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  setInterval(async () => {
    try {
      const { embed, row } = buildStoreEmbed();
      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (err) {
      console.error("Live stock update error:", err.message);
    }
  }, UPDATE_INTERVAL);
}
