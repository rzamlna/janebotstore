import { buildStoreEmbed } from "./storeEmbed.js";

const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID;

let storeMessage = null;
let countdown = 5;
const COUNTDOWN_MAX = 5;

export async function initStore(client) {
  const channel = await client.channels.fetch(STORE_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error("STORE_CHANNEL_ID invalid");
  }

  const messages = await channel.messages.fetch({ limit: 10 });
  storeMessage = messages.find(
    m => m.author.id === client.user.id && m.embeds.length
  );

  await renderStore(client);

  // ⏱️ SATU interval global (ANTI STUCK)
  setInterval(async () => {
    countdown--;

    if (countdown <= 0) {
      countdown = COUNTDOWN_MAX;
      await renderStore(client);
    } else {
      await updateCountdownOnly(client);
    }
  }, 1000);
}

// ==========================
// FORCE UPDATE (dipanggil restock / order)
// ==========================
export async function updateStoreMessage(client) {
  countdown = COUNTDOWN_MAX; // reset animasi
  await renderStore(client);
}

// ==========================
// RENDER FULL EMBED
// ==========================
async function renderStore(client) {
  if (!storeMessage) return;

  const { embed, row } = buildStoreEmbed(countdown);

  await storeMessage.edit({
    embeds: [embed],
    components: row ? [row] : [],
  });
}

// ==========================
// UPDATE COUNTDOWN SAJA (CEPAT)
// ==========================
async function updateCountdownOnly(client) {
  if (!storeMessage) return;

  const embed = storeMessage.embeds[0];
  if (!embed) return;

  const newEmbed = EmbedBuilder.from(embed)
    .setFooter({
      text: `🔄 update in ${countdown}s • JANESTORE`,
    });

  await storeMessage.edit({
    embeds: [newEmbed],
  });
}
