import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = "1381529567084413009"; // channel JANESTORE
const UPDATE_INTERVAL = 20000; // 20 detik

let storeMessage = null;

export async function initStore(client) {
  try {
    const channel = await client.channels.fetch(STORE_CHANNEL_ID);
    if (!channel) {
      console.log("[STORE] Channel not found");
      return;
    }

    // cari pesan store lama
    const messages = await channel.messages.fetch({ limit: 10 });
    storeMessage = messages.find(
      (m) => m.author.id === client.user.id && m.embeds.length
    );

    const initial = buildStoreEmbed();

    if (!storeMessage) {
      storeMessage = await channel.send({
        embeds: [initial.embed],
        components: initial.row ? [initial.row] : [],
      });
    }

    // auto update (NO SPAM)
    setInterval(async () => {
      try {
        const updated = buildStoreEmbed();

        const payload = {
          embeds: [updated.embed],
        };

        // ❗ JANGAN KIRIM components kalau null
        if (updated.row) {
          payload.components = [updated.row];
        } else {
          payload.components = [];
        }

        await storeMessage.edit(payload);
      } catch (err) {
        console.error("[STORE] Update error:", err.message);
      }
    }, UPDATE_INTERVAL);

  } catch (err) {
    console.error("[STORE] Init error:", err.message);
  }
}
