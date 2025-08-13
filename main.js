const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('⏳ Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('✅ Comandos registrados!');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Logado como ${client.user.tag}`);
});

async function executarPingAutomatico() {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased());
    if (channel) {
      await channel.send('🏓 Ping automático para manter o bot ativo!');
      console.log('✅ Ping automático executado!');
    } else {
      console.log('⚠️ Canal para enviar ping automático não encontrado.');
    }
  } catch (err) {
    console.error('Erro ao enviar ping automático:', err);
  }
}

cron.schedule('0 12 */15 * *', () => {
  executarPingAutomatico();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {

    await interaction.reply('🏓 Pong!');
  }
});

client.login(config.token);
