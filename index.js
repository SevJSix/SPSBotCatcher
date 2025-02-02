const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./banned-strings.json');
const { token } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
  const username = member.user.username.toLowerCase();
  const bannedStrings = config.bannedStrings.map(s => s.toLowerCase());

  // Check if username contains any banned string
  const containsBannedString = bannedStrings.some(bannedString => 
    username.includes(bannedString.toLowerCase())
  );

  if (containsBannedString) {
    try {
      await member.ban({
        reason: `Automatic ban: Username contained banned string (${member.user.username})`
      });
      console.log(`Banned user ${member.user.tag} for suspicious username`);
      
      // Send notification to moderation channel
      const logChannel = member.guild.channels.cache.find(ch => ch.id == "1334671979793485984");
      if (logChannel) {
        logChannel.send(`🚨 Banned user \`${member.user.tag}\` for suspicious username: \`${member.user.username}\``);
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  }
});

client.login(token);