import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.resolve();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function main() {
  const commands = [];
  const seenNames = new Set(); // cek nama duplikat

  console.log("🧹 Deleting old commands...");
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
  console.log("✅ Old commands cleared.");
  console.log("🔍 Scanning commands...");

  const folders = fs.readdirSync(path.join(__dirname, "commands"));
  for (const folder of folders) {
    const files = fs
      .readdirSync(path.join(__dirname, "commands", folder))
      .filter(f => f.endsWith(".js"));

    for (const file of files) {
      const filePath = `./commands/${folder}/${file}`;
      const cmdImport = await import(filePath);
      const cmd = cmdImport.default;

      if (!cmd?.data) continue;
      const name = cmd.data.name;

      if (seenNames.has(name)) {
        console.log(`⚠️  Skipping duplicate command: ${name} (${folder}/${file})`);
        continue;
      }

      seenNames.add(name);
      commands.push(cmd.data.toJSON());
      console.log(`✅ Loaded: ${name} (${folder})`);
    }
  }

  console.log("🔄 Re-registering commands...");
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log(`✅ Successfully registered ${commands.length} unique commands for guild: ${GUILD_ID}`);
}

main().catch(err => console.error("❌ Register error:", err));
