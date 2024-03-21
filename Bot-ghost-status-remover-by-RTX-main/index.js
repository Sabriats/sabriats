const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
require('dotenv').config(); // Für das Laden von Umgebungsvariablen aus einer .env-Datei
const express = require('express');
const fs = require('fs');
const path = require('path');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('YaY Your Bot Status Changed✨');
});

app.listen(port, () => {
  console.log(`🔗 Listening to RTX: http://localhost:${port}`);
  console.log(`🔗 Powered By RTX`);
});

const statusMessages = ["Listening to Spotify", "Watching YouTube"];

let currentIndex = 0;
const channelId = '';

async function login() {
  try {
    await client.login(process.env.TOKEN); // Verwenden der .env-Datei für das Token
    console.log(`\x1b[36m%s\x1b[0m`, `|    🐇 Logged in as ${client.user.tag}`);
  } catch (error) {
    console.error('Failed to log in:', error);
    process.exit(1);
  }
}

function updateStatusAndSendMessages() {
  const currentStatus = statusMessages[currentIndex];
  const nextStatus = statusMessages[(currentIndex + 1) % statusMessages.length];

  client.user.setPresence({
    activities: [{ name: currentStatus, type: 'LISTENING' }],
    status: 'dnd'
  });

  const textChannel = client.channels.cache.get(channelId);

  if (textChannel && textChannel.isText()) {
    textChannel.send(`Bot status is: ${currentStatus}`).then(() => {
      setTimeout(() => {
        textChannel.bulkDelete(1); // Löschen der Nachricht nach 5 Sekunden
      }, 5000);
    });
  }

  currentIndex = (currentIndex + 1) % statusMessages.length;
}

client.once('ready', () => {
  console.log(`\x1b[36m%s\x1b[0m`, `|    ✅ Bot is ready as ${client.user.tag}`);
  console.log(`\x1b[36m%s\x1b[0m`, `|    ✨HAPPY NEW YEAR MY DEAR FAMILY`);
  console.log(`\x1b[36m%s\x1b[0m`, `|    ❤️WELCOME TO 2024`);
  updateStatusAndSendMessages();

  setInterval(() => {
    updateStatusAndSendMessages();
  }, 10000);
});

login();

// Clear-Befehl
client.on('messageCreate', async message => {
  if (message.content.startsWith('/clear')) {
    const args = message.content.split(' ').slice(1);
    const amount = parseInt(args[0]);

    if (isNaN(amount)) {
      return message.reply('Bitte gib eine gültige Anzahl von Nachrichten zum Löschen an.');
    } else if (amount <= 0) {
      return message.reply('Bitte gib eine positive Anzahl von Nachrichten zum Löschen an.');
    }

    try {
      await message.channel.bulkDelete(amount + 1);
      message.channel.send(`${amount} Nachrichten wurden gelöscht.`).then(msg => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    } catch (error) {
      console.error(error);
      message.reply('Beim Löschen der Nachrichten ist ein Fehler aufgetreten.');
    }
  }
});

// Embed-Befehl
client.on('messageCreate', async message => {
  if (message.content.startsWith('/embed')) {
    try {
      const embedMessage = await message.channel.send('Bitte gib den Titel des Embeds ein:');
      const titleMsg = await message.channel.awaitMessages({ max: 1, time: 30000, errors: ['time'] });
      const title = titleMsg.first().content;

      await embedMessage.edit('Bitte gib die Beschreibung des Embeds ein:');
      const descriptionMsg = await message.channel.awaitMessages({ max: 1, time: 30000, errors: ['time'] });
      const description = descriptionMsg.first().content;

      await embedMessage.edit('Bitte gib die Farbe des Embeds ein (z.B. blue, red, green):');
      const colorMsg = await message.channel.awaitMessages({ max: 1, time: 30000, errors: ['time'] });
      const color = colorMsg.first().content.toLowerCase();

      const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

      await message.channel.send({ embeds: [embed] });

      // Löschen der Eingabeanforderungen
      titleMsg.first().delete();
      descriptionMsg.first().delete();
      colorMsg.first().delete();
      embedMessage.delete();
    } catch (error) {
      console.error(error);
      message.reply('Es ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    }
  }
});
