import {
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import fs from "fs";

const OWNER_ID = process.env.OWNER_ID;
const STORE_TICKET_CATEGORY_ID = "1111676525171986522";
const STORE_PATH = "./store/storeData.json";
const ORDER_LOG_CHANNEL_ID = process.env.ORDER_LOG_CHANNEL_ID;

// ==========================
// HELPER: CEK AKSES STORE
// ==========================
function hasStoreAccess(member) {
  return (
    member.id === OWNER_ID ||
    member.permissions.has(PermissionsBitField.Flags.ManageChannels)
  );
}

export default async (client, interaction) => {

  // =====================================================
  // SELECT MENU → PILIH ITEM
  // =====================================================
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "store_select_item") {
      const code = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`order_modal:${code}`)
        .setTitle("🛒 JANESTORE ORDER");

      const qtyInput = new TextInputBuilder()
        .setCustomId("quantity")
        .setLabel("Jumlah beli")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const usernameInput = new TextInputBuilder()
        .setCustomId("username")
        .setLabel("Username Roblox")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(qtyInput),
        new ActionRowBuilder().addComponents(usernameInput)
      );

      await interaction.showModal(modal);
      return;
    }
  }

  // =====================================================
  // MODAL SUBMIT → BUAT ORDER
  // =====================================================
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("order_modal:")) {
      const code = interaction.customId.split(":")[1];
      const qty = Number(interaction.fields.getTextInputValue("quantity"));
      const username = interaction.fields.getTextInputValue("username");

      if (!Number.isInteger(qty) || qty <= 0) {
        return interaction.reply({
          content: "⚠️ Jumlah tidak valid.",
          ephemeral: true,
        });
      }

      const store = JSON.parse(fs.readFileSync(STORE_PATH));
      const item = store.items.find(i => i.code === code);

      if (!item) {
        return interaction.reply({
          content: "❌ Item tidak ditemukan.",
          ephemeral: true,
        });
      }

      if (item.stock < qty) {
        return interaction.reply({
          content:
            `⚠️ Stok tidak mencukupi\nStok: ${item.stock}\nDiminta: ${qty}`,
          ephemeral: true,
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `order-${interaction.user.username}`.toLowerCase(),
        type: 0,
        parent: STORE_TICKET_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: ["ViewChannel"],
          },
          {
            id: interaction.user.id,
            allow: ["ViewChannel", "SendMessages", "EmbedLinks"],
          },
        ],
      });

      await channel.setTopic(
        `ORDER|user=${interaction.user.id}|code=${code}|qty=${qty}|username=${username}`
      );

      const embed = new EmbedBuilder()
        .setTitle("🛒 ORDER DETAIL")
        .setColor("#00FF99")
        .addFields(
          { name: "Item", value: item.name, inline: true },
          { name: "Jumlah", value: `${qty}`, inline: true },
          { name: "Username", value: username, inline: false },
          {
            name: "Total",
            value: `Rp${(item.price * qty).toLocaleString()}`,
            inline: false,
          }
        )
        .setDescription("Menunggu konfirmasi admin.");

      const cancelBtn = new ButtonBuilder()
        .setCustomId("order_cancel")
        .setLabel("❌ Cancel Order")
        .setStyle(ButtonStyle.Danger);

      const successBtn = new ButtonBuilder()
        .setCustomId("order_success")
        .setLabel("✅ Order Sukses")
        .setStyle(ButtonStyle.Success);

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(cancelBtn, successBtn),
        ],
      });

      await interaction.reply({
        content: `✅ Order ticket berhasil dibuat ${channel}`,
        ephemeral: true,
      });
      return;
    }
  }

  // =====================================================
  // BUTTON HANDLER
  // =====================================================
  if (interaction.isButton()) {

    // ❌ CANCEL ORDER
    if (interaction.customId === "order_cancel") {
      if (!hasStoreAccess(interaction.member)) {
        return interaction.reply({
          content: "🚫 Hanya admin / owner.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: "❌ Order dibatalkan.",
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.channel?.delete().catch(() => null);
      }, 3000);
      return;
    }

    // ✅ ORDER SUCCESS
    if (interaction.customId === "order_success") {
      if (!hasStoreAccess(interaction.member)) {
        return interaction.reply({
          content: "🚫 Hanya admin / owner.",
          ephemeral: true,
        });
      }

      const topic = interaction.channel.topic || "";
      const data = Object.fromEntries(
        topic.split("|").slice(1).map(v => v.split("="))
      );

      const code = data.code;
      const qty = Number(data.qty);
      const buyerId = data.user;
      const buyerUsername = data.username || "-";

      if (!code || !Number.isInteger(qty)) {
        return interaction.reply({
          content: "❌ Data order rusak.",
          ephemeral: true,
        });
      }

      const store = JSON.parse(fs.readFileSync(STORE_PATH));
      const item = store.items.find(i => i.code === code);

      if (!item || item.stock < qty) {
        return interaction.reply({
          content: "⚠️ Stok tidak mencukupi.",
          ephemeral: true,
        });
      }

      // ==========================
      // UPDATE STOCK + SOLD
      // ==========================
      item.stock -= qty;
      item.sold = (item.sold ?? 0) + qty;

      fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));

      // ==========================
      // ORDER LOG
      // ==========================
      if (ORDER_LOG_CHANNEL_ID) {
        try {
          const logChannel = await client.channels.fetch(
            ORDER_LOG_CHANNEL_ID
          );

          if (logChannel?.isTextBased()) {
            const logEmbed = new EmbedBuilder()
              .setTitle("✅ ORDER SUKSES")
              .setColor("#00FF99")
              .addFields(
                { name: "User", value: `<@${buyerId}>`, inline: true },
                { name: "Username", value: buyerUsername, inline: true },
                { name: "Item", value: item.name, inline: true },
                { name: "Jumlah", value: `${qty}`, inline: true },
                {
                  name: "Total",
                  value: `Rp${(item.price * qty).toLocaleString()}`,
                },
                { name: "Sisa Stok", value: `${item.stock}`, inline: true },
                {
                  name: "Diproses oleh",
                  value: `<@${interaction.user.id}>`,
                  inline: true,
                }
              )
              .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
          }
        } catch (e) {
          console.error("Order log error:", e.message);
        }
      }

      await interaction.reply({
        content:
          `✅ Order berhasil.\nSisa stok **${item.name}**: ${item.stock}`,
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.channel?.delete().catch(() => null);
      }, 3000);
      return;
    }
  }

  // =====================================================
  // SLASH COMMAND HANDLER
  // =====================================================
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (hasStoreAccess(interaction.member)) {
      await command.execute(interaction);
      return;
    }

    if (command.category === "admin") {
      return interaction.reply({
        content: "🚫 Kamu tidak punya izin.",
        ephemeral: true,
      });
    }

    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "⚠️ Error command.",
        ephemeral: true,
      });
    }
  }
};

