import { EmbedBuilder, ActivityType } from "discord.js";
import { initStore } from "../store/storeService.js";

const STATUS_CHANNEL_ID = process.env.STATUS_CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;

export default async (client) => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ==========================
  // BOT PRESENCE (ROTATE)
  // ==========================
  const presences = [
    { name: "JANESTORE", type: ActivityType.Listening },
    { name: "JANESTORE", type: ActivityType.Watching },
    { name: "/help", type: ActivityType.Playing },
  ];

  let pIndex = 0;
  setInterval(() => {
    const p = presences[pIndex % presences.length];
    client.user.setPresence({
      activities: [{ name: p.name, type: p.type }],
      status: "online",
    });
    pIndex++;
  }, 30000);

  // =====================================================
  // 🧹 CLEAR GLOBAL COMMAND (JALANKAN SEKALI SAJA)
  // =====================================================
  try {
    await client.application.commands.set([]);
    console.log("🧹 Global commands cleared");
  } catch (err) {
    console.error("Failed to clear global commands:", err.message);
  }

  // =====================================================
  // REGISTER GUILD COMMANDS (INSTANT)
  // =====================================================
  try {
    const cmds = client.commands.map(c => c.data);
    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
      console.log("❌ Guild not found, slash commands not registered");
    } else {
      await guild.commands.set(cmds);
      console.log("⚡ Guild commands registered (instant)");
    }
  } catch (err) {
    console.error("Error registering guild commands:", err.message);
  }

  // ==========================
  // STATUS BOT EMBED
  // ==========================
  if (STATUS_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
      if (!channel || !channel.isTextBased()) return;

      const messages = await channel.messages.fetch({ limit: 5 });
      let statusMessage = messages.find(
        m => m.author.id === client.user.id && m.embeds.length
      );

      if (!statusMessage) {
        statusMessage = await channel.send({
          embeds: [buildStatusEmbed(client)],
        });
      }

      setInterval(async () => {
        try {
          await statusMessage.edit({
            embeds: [buildStatusEmbed(client)],
          });
        } catch (err) {
          console.error("Status embed update failed:", err.message);
        }
      }, 30000);

      console.log("📊 Status embed initialized");
    } catch (err) {
      console.error("Status embed error:", err.message);
    }
  }

  // ==========================
  // INIT JANESTORE
  // ==========================
  try {
    await initStore(client);
    console.log("🛒 JANESTORE initialized");
  } catch (err) {
    console.error("JANESTORE init failed:", err.message);
  }
};

// ==========================
// BUILD STATUS EMBED
// ==========================
function buildStatusEmbed(client) {
  const uptimeSeconds = Math.floor(
    (Date.now() - (client.readyTimestamp || Date.now())) / 1000
  );

  const totalUsers = client.guilds.cache.reduce(
    (acc, g) => acc + (g.memberCount || 0),
    0
  );

  return new EmbedBuilder()
    .setColor("#00FF99")
    .setTitle("🤖 JANE BOT STATUS")
    .addFields(
      { name: "Status", value: "🟢 Online", inline: true },
      { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
      { name: "Users", value: `${totalUsers}`, inline: true },
      {
        name: "Uptime",
        value: `<t:${Math.floor(Date.now() / 1000 - uptimeSeconds)}:R>`,
        inline: false,
      }
    )
    .setFooter({ text: "Auto update setiap 30 detik" })
    .setTimestamp();
}
