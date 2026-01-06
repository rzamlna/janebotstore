import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const FILE_PATH = "./store/nextLink.json";

export default {
  category: "general",
  data: new SlashCommandBuilder()
    .setName("next")
    .setDescription("Link private server"),

  async execute(interaction) {
    if (!fs.existsSync(FILE_PATH)) {
      return interaction.reply({
        content: "⚠️ Link private server belum diset.",
      });
    }

    const data = JSON.parse(fs.readFileSync(FILE_PATH));

    if (!data.link) {
      return interaction.reply({
        content: "⚠️ Link private server belum tersedia.",
      });
    }

    await interaction.reply({
      content:
        `Silahkan join ke private server ${data.link}\n\n` +
        `Silahkan menunggu...`,
      // PUBLIC (tidak ephemeral)
    });
  },
};
