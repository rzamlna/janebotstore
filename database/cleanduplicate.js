import { GuildConfig } from "./guildConfig.js";

export async function cleanDuplicateGuildConfigs() {
  console.log("🧹 Checking MongoDB for duplicate guild configs...");

  const duplicates = await GuildConfig.aggregate([
    {
      $group: {
        _id: "$guildId",
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  if (!duplicates.length) {
    console.log("✅ No duplicate guild configs found.");
    return;
  }

  for (const dup of duplicates) {
    const keepId = dup.ids.pop(); // keep the newest / last created
    await GuildConfig.deleteMany({ _id: { $in: dup.ids } });
    console.log(`⚠️ Removed ${dup.count - 1} duplicates for guild: ${dup._id} (kept ${keepId})`);
  }

  console.log("✅ Duplicate cleanup complete.");
}
