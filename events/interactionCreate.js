import {
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

const OWNER_ID = process.env.OWNER_ID;

export default async (client, interaction) => {
  // === HANDLE BUTTON INTERACTIONS ===
  if (interaction.isButton()) {
    // === VERIFY BUTTON ===
    if (interaction.customId === "verify_button") {
      try {
        const configModule = await import("../database/guildConfig.js");
        const config = await configModule.GuildConfig.findOne({
          guildId: interaction.guild.id,
        });

        if (!config || !config.verifyRoleId) {
          return interaction.reply({
            content:
              "⚠️ Verify role belum diset! Gunakan /setup-verifyrole dulu.",
            ephemeral: true,
          });
        }

        const role = interaction.guild.roles.cache.get(config.verifyRoleId);
        const member = interaction.member;

        if (!role) {
          return interaction.reply({
            content: "❌ Role verify tidak ditemukan di server.",
            ephemeral: true,
          });
        }

        if (member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: "Kamu sudah terverifikasi sebelumnya!",
            ephemeral: true,
          });
        }

        await member.roles.add(role);
        await interaction.reply({
          content: "✅ Kamu berhasil diverifikasi!",
          ephemeral: true,
        });
      } catch (err) {
        console.error("Button interaction error:", err);
        return interaction.reply({
          content: "⚠️ Terjadi error saat memproses tombol verify.",
          ephemeral: true,
        });
      }
      return; // stop setelah verify
    }

    // === TICKET SYSTEM ===
    if (interaction.customId === "create_ticket") {
      const existingChannel = interaction.guild.channels.cache.find(
        (c) => c.name === `ticket-${interaction.user.id}`
      );
      if (existingChannel) {
        await interaction.reply({
          content: `⚠️ Kamu sudah punya ticket: ${existingChannel}`,
          ephemeral: true,
        });
        return;
      }

      const category = interaction.guild.channels.cache.find(
        (c) => c.name.toLowerCase() === "tickets" && c.type === 4
      );

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`.toLowerCase(),
        type: 0, // text channel
        parent: category?.id || null,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: ["ViewChannel"],
          },
          {
            id: interaction.user.id,
            allow: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks"],
          },
          // optional: role staff
          // { id: "ROLE_ID_STAFF", allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle("🎟️ Ticket Dibuka")
        .setDescription(
          `Halo ${interaction.user}, staff akan segera membantu kamu.\nGunakan tombol di bawah untuk menutup ticket ini.`
        )
        .setColor("#00BFFF");

      const closeButton = new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🗑️ Close Ticket")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeButton);

      await ticketChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row],
      });

      await interaction.reply({
        content: `✅ Ticket berhasil dibuat: ${ticketChannel}`,
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId === "close_ticket") {
      await interaction.reply({
        content: "🗑️ Ticket ini akan dihapus dalam 5 detik...",
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.channel.delete().catch(() => null);
      }, 5000);
      return;
    }

    return; // pastikan tombol tidak lanjut ke handler command
  }

  // === HANDLE SLASH COMMAND INTERACTIONS ===
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // 👑 OWNER BYPASS
    if (interaction.user.id === OWNER_ID) {
      await command.execute(interaction);
      return;
    }

    // 🛡️ ADMIN COMMANDS (require KickMembers)
    if (command.category === "admin") {
      const memberPerms = interaction.member?.permissions;
      if (
        !memberPerms ||
        !memberPerms.has(PermissionsBitField.Flags.KickMembers)
      ) {
        return interaction.reply({
          content: "🚫 Kamu tidak punya izin untuk menggunakan command admin.",
          ephemeral: true,
        });
      }
    }

    // 👥 GENERAL / OWNER handled automatically
    await command.execute(interaction);
  } catch (err) {
    console.error("Command execution error:", err);
    if (!interaction.replied)
      await interaction.reply({
        content: "⚠️ Ada error saat menjalankan command ini.",
        ephemeral: true,
      });
  }
};

