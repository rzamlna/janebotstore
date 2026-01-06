import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const FILE_PATH = "./store/nextLink.json";
const OWNER_ID = process.env.OWNER_ID;

export default {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("setnext")
    .setDescription("Ganti link private server")
    .addStringOption(opt =>
      opt
        .setName("link")
        .setDescription("Link private server Roblox")
        .setRequired(true)
    ),

  async execute(interaction) {
    // OWNER atau ADMIN
    if (
      interaction.user.id !== OWNER_ID &&
      !interaction.member.permissions.has("ManageGuild")
    ) {
      return interaction.reply({
        content: "🚫 Hanya owner / admin.",
        ephemeral: true,
      });
    }

    const link = interaction.options.getString("link");

    if (!link.startsWith("http")) {
      return interaction.reply({
        content: "❌ Link tidak valid.",
        ephemeral: true,
      });
    }

    fs.writeFileSync(
      FILE_PATH,
      JSON.stringify({ link }, null, 2)
    );

    await interaction.reply({
      content: "✅ Link private server berhasil diperbarui.",
      ephemeral: true,
    });
  },
};
