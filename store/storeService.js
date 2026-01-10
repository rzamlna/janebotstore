import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let storeMessage = null;
let countdown = 5;

export async function initStore(client) {
  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error("STORE_CHANNEL_ID tidak valid");
  }

  // ==========================
  // CARI MESSAGE LAMA
  // ==========================
  const messages = await channel.messages.fetch({ limit: 10 });
  storeMessage = messages.find(
    m => m.author.id === client.user.id && m.embeds.length
  );

  if (!storeMessage) {
    const { embed, row } = buildStoreEmbed("...");
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // ==========================
  // HITUNG MUNDUR REALTIME
  // ==========================
  setInterval(async () => {
    try {
      if (countdown > 0) {
        const { embed, row } = buildStoreEmbed(countdown);
        await storeMessage.edit({
          embeds: [embed],
          components: row ? [row] : [],
        });
        countdown--;
      } else {
        const { embed, row } = buildStoreEmbed("...");
        await storeMessage.edit({
          embeds: [embed],
          components: row ? [row] : [],
        });
        countdown = 5; // reset
      }
    } catch (err) {
      console.error("Store embed update error:", err.message);
    }
  }, 1000); // ⬅️ 1 DETIK, CEPAT, STABIL
        }
