const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const config = require('./banned-strings.json');
const { token } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

let bannedStrings = config.bannedStrings;

async function saveBannedWords() {
    try {
      await fs.writeFile('./banned-strings.json', JSON.stringify({ bannedStrings }, null, 2));
    } catch (error) {
      console.error('Error saving banned words:', error);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    // Permission check
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You need BAN_MEMBERS permission to use this command!', ephemeral: true });
    }
  
    const { commandName, options } = interaction;
  
    try {
      switch(commandName) {
        case 'addbannedword': {
          const word = options.getString('word');
          if (bannedStrings.includes(word)) {
            return interaction.reply({ content: `❌ "${word}" is already in the banned list!`, ephemeral: true });
          }
          bannedStrings.push(word);
          await saveBannedWords();
          return interaction.reply({ content: `✅ Added "${word}" to banned strings!`, ephemeral: true });
        }
  
        case 'removebannedword': {
          const word = options.getString('word');
          if (!bannedStrings.includes(word)) {
            return interaction.reply({ content: `❌ "${word}" not found in banned list!`, ephemeral: true });
          }
          bannedStrings = bannedStrings.filter(w => w !== word);
          await saveBannedWords();
          return interaction.reply({ content: `✅ Removed "${word}" from banned strings!`, ephemeral: true });
        }
  
        case 'viewbannedwords': {
          const wordList = bannedStrings.length > 0 
            ? bannedStrings.map(w => `• ${w}`).join('\n')
            : 'No banned words currently in list';
          return interaction.reply({
            content: `**Banned Words List:**\n${wordList}`,
            ephemeral: true
          });
        }
      }
    } catch (error) {
      console.error('Error handling command:', error);
      interaction.reply({ content: '❌ An error occurred while processing your request!', ephemeral: true });
    }
  });

client.on('guildMemberAdd', async (member) => {
  const username = member.user.displayName.toLowerCase();
  const bannedStrings = config.bannedStrings.map(s => s.toLowerCase());

  // Check if username contains any banned string
  const containsBannedString = bannedStrings.some(bannedString => 
    username.includes(bannedString.toLowerCase())
  );

  if (containsBannedString) {
    try {
      await member.ban({
        reason: `Automatic ban: Username contained banned string (${member.user.displayName})`
      });
      console.log(`Banned user ${member.user.tag} for suspicious username`);
      
      // Send notification to moderation channel
      const logChannel = member.guild.channels.cache.find(ch => ch.id == "1334671979793485984");
      if (logChannel) {
        logChannel.send(`🚨 Banned user \`${member.user.tag}\` for suspicious username: \`${member.user.displayName}\``);
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  }
});

client.login(token);