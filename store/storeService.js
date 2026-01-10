import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

const ANIMATION_FRAMES = [".", "..", "..."];
const ANIMATION_INTERVAL = 1000; // 1 detik
const DATA_REFRESH_EVERY = 5; // refresh data tiap 5 detik

let storeMessage = null;
let started = false;

export async function initStore(client) {
  if (started) return;
  started = true;

  if (!STORE_CHANNEL_ID) {
    console.log("❌ STORE_CHANNEL_ID belum diset");
    return;
  }

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 5 });
  storeMessage = messages.find(
    (m) => m.author.id === client.user.id && m.embeds.length
  );

  let animIndex = 0;
  let tick = 0;

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed(ANIMATION_FRAMES[0]);
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  setInterval(async () => {
    try {
      animIndex = (animIndex + 1) % ANIMATION_FRAMES.length;
      tick++;

      const { embed, row } = buildStoreEmbed(
        ANIMATION_FRAMES[animIndex]
      );

      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });
    } catch (err) {
      console.error("Live stock update error:", err.message);
    }
  }, ANIMATION_INTERVAL);
}
