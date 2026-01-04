import mongoose from "mongoose";

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  // VERIFY
  verifyRoleId: { type: String, default: null },
  verifyMessageId: { type: String, default: null },
});

export const GuildConfig = mongoose.model(
  "GuildConfig",
  guildConfigSchema
);