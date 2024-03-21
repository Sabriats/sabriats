const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// Token des Bots
const TOKEN = 'MTE5MzQ4NTE3NzEwODgyODI2MQ.GME2YG.lbwiSVuzZaXammMyckKuP167pODMLlyMPMJTfM';

// Präfix für Bot-Befehle
const PREFIX = '/';

// Aktivität für den Bot
const ACTIVITY = 'Hayat City Roleplay';

// Erstellen eines Bot-Clients mit Intents
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Event, das beim Start des Bots aufgerufen wird
client.once('ready', () => {
    console.log(`${client.user.username} ist bereit.`);
    client.user.setActivity(ACTIVITY);
});

// Befehl zum Bereinigen des Chats (nur für Administratoren)
client.on('messageCreate', async (message) => {
    if (message.content.startsWith(`${PREFIX}clear`)) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.');
        }

        const args = message.content.split(' ');
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Bitte gib eine gültige Anzahl von Nachrichten zum Löschen an.');
        }

        await message.channel.bulkDelete(amount + 1);
        message.reply(`${amount} Nachrichten wurden gelöscht.`).then(reply => reply.delete({ timeout: 5000 }));
    }
});

// Befehl zum Senden eines Embeds mit allen Parametern direkt im Discord-Chat
client.on('messageCreate', async (message) => {
    if (message.content.startsWith(`${PREFIX}embed`)) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.');
        }

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 30000 });

        let embedData = {};

        await message.reply('Bitte gib den Titel des Embeds ein:');
        collector.on('collect', async (msg) => {
            if (!embedData.title) {
                embedData.title = msg.content;
                await msg.delete();
                await message.reply('Bitte gib die Beschreibung des Embeds ein:');
            } else if (!embedData.description) {
                embedData.description = msg.content;
                await msg.delete();
                await message.reply('Bitte gib die Farbe des Embeds ein (z.B. blue, red, green):');
            } else if (!embedData.color) {
                embedData.color = msg.content;
                await msg.delete();
                collector.stop();
            }
        });

        collector.on('end', async () => {
            const embed = new MessageEmbed()
                .setTitle(embedData.title)
                .setDescription(embedData.description)
                .setColor(embedData.color.toLowerCase() || 'BLUE');

            await message.channel.send({ embeds: [embed] });
        });
    }
});

// Anmelden des Bots mit dem angegebenen Token
client.login(TOKEN);
