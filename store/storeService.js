import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;
const UPDATE_INTERVAL = 10; // ⬅️ 10 detik

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

  const messages = await channel.messages.fetch({ limit: 5 });
  let storeMessage = messages.find(
    (m) => m.author.id === client.user.id && m.embeds.length
  );

  let secondsLeft = UPDATE_INTERVAL;

  // ==========================
  // KIRIM EMBED PERTAMA KALI
  // ==========================
  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed(secondsLeft);
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // ==========================
  // LOOP UPDATE (SETIAP 1 DETIK)
  // ==========================
  setInterval(async () => {
    try {
      const { embed, row } = buildStoreEmbed(secondsLeft);

      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });

      secondsLeft--;

      if (secondsLeft < 0) {
        secondsLeft = UPDATE_INTERVAL;
      }
    } catch (err) {
      console.error("Live stock update failed:", err.message);
    }
  }, 1000);
      }
