import fs from "fs";
import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let storeMessage = null;

export async function initStore(client) {
  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error("STORE_CHANNEL_ID invalid");
  }

  // cari message lama
  const messages = await channel.messages.fetch({ limit: 10 });
  storeMessage = messages.find(
    m => m.author.id === client.user.id && m.embeds.length
  );

  const { embed, row } = buildStoreEmbed();

  if (!storeMessage) {
    storeMessage = await channel.send({
      embeds: [embed],
      components: row ? [row] : [],
    });
  } else {
    await storeMessage.edit({
      embeds: [embed],
      components: row ? [row] : [],
    });
  }

  // backup sync (BUKAN utama)
  setInterval(() => {
    updateStoreMessage(client).catch(() => {});
  }, 5000);
}

export async function updateStoreMessage(client) {
  if (!storeMessage) return;

  const { embed, row } = buildStoreEmbed();

  await storeMessage.edit({
    embeds: [embed],
    components: row ? [row] : [],
  });
}
