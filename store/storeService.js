import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let storeMessage = null;
let countdown = 5;
let intervalStarted = false;

export async function initStore(client) {
  if (intervalStarted) return; // ⬅️ PENTING
  intervalStarted = true;

  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error("STORE_CHANNEL_ID tidak valid");
  }

  // cari message lama
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
  // INTERVAL TUNGGAL
  // ==========================
  setInterval(async () => {
    try {
      const { embed, row } =
        countdown > 0
          ? buildStoreEmbed(countdown)
          : buildStoreEmbed("...");

      await storeMessage.edit({
        embeds: [embed],
        components: row ? [row] : [],
      });

      countdown = countdown > 0 ? countdown - 1 : 5;
    } catch (err) {
      console.error("Store update error:", err.message);
    }
  }, 1500); // ⬅️ 1.5 detik (LEBIH STABIL DARI 1 DETIK)
}
