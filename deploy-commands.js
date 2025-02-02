const { REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

const commands = [
  {
    name: 'addbannedword',
    description: 'Add a new banned word to the filter',
    options: [
      {
        name: 'word',
        description: 'The word to add to banned list',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'removebannedword',
    description: 'Remove a word from banned list',
    options: [
      {
        name: 'word',
        description: 'The word to remove from banned list',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'viewbannedwords',
    description: 'Show all currently banned words'
  }
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();