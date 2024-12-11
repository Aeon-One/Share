const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const ownerId = '858897729031372870';
let hugCount = 0;

client.on('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!surpriseyaya') {

      if (message.author.id !== ownerId) {
        const reply = await message.reply('Access Denied! ❌ Apenas o dono do bot pode usar este comando!');

        setTimeout(() => {
          message.delete().catch(console.error);
          reply.delete().catch(console.error);
        }, 10000);
  
        return;
      }
  
      const yayaUser = message.guild.members.cache.get('858897729031372870');
  
      if (!yayaUser) {
        const reply = await message.channel.send('Usuário não encontrado!');
        setTimeout(() => {
          reply.delete().catch(console.error);
        }, 10000);
        return;
      }

    const imageUrl = 'https://i.ibb.co/YLH3N23/Logo-Preto-E-Dourado-Para-Editar-Gratis-1-3.jpg';
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const avatarUrl = yayaUser.user.displayAvatarURL({ format: 'png', size: 512 });
    const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const avatarBuffer = Buffer.from(avatarResponse.data);

    const resizedBackgroundBuffer = await sharp(imageBuffer)
      .resize(1215, 693)
      .toBuffer();

    const avatarSize = 300;
    const avatarX = Math.floor((1215 - avatarSize) / 2);
    const avatarY = 100;

    const avatarCircleBuffer = await sharp(avatarBuffer)
      .resize(avatarSize, avatarSize)
      .extract({ left: 0, top: 0, width: avatarSize, height: avatarSize })
      .composite([{
        input: Buffer.from(`<svg width="${avatarSize}" height="${avatarSize}"><circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" fill="white" /></svg>`),
        blend: 'dest-in',
      }])
      .toBuffer();

    const textX = 1215 / 2;
    const textY = avatarY + avatarSize + 100;
    const outputPath = path.join(__dirname, 'birthday-image.png');
    
    sharp(resizedBackgroundBuffer)
      .composite([
        {
          input: avatarCircleBuffer,
          top: avatarY,
          left: avatarX,
        },
        {
          input: Buffer.from(`
            <svg width="1215" height="693">
              <text x="${textX}" y="${textY}" font-size="60" fill="orangeRed" text-anchor="middle" alignment-baseline="middle" style="font-family: sans-serif;">Feliz aniversário, Yaya!</text>
            </svg>
          `),
          gravity: 'center',
        }
      ])
      .toFile(outputPath, (err, info) => {
        if (err) {
          console.error('Erro ao criar a imagem:', err);
          return;
        }

        const hugButton = new ButtonBuilder()
          .setCustomId('hug_button')
          .setLabel(`Dar um abraço na Yaya🫂 (Total: ${hugCount})`)
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(hugButton);

        const embed = new EmbedBuilder()
        .setTitle('**Feliz aniversário, Yaya! 🎉**')
        .setDescription(
            '```ansi\n' +
            '[2;31mQue o seu dia seja inundado de alegrias, risos contagiantes e imensa felicidade.[0m ' +
            '[2;31mAgradecemos profundamente por tudo ao nosso clã.[0m ' +
            '[2;31mQue este novo ciclo seja repleto de conquistas notáveis e momentos memoráveis.[0m ' +
            '[2;31mAproveite cada instante, você é merecedora de tudo de mais sublime! 🎂🎈[0m\n' +
            '```'
          )
        .setColor('#FF4500')
        .setImage('attachment://birthday-image.png')
        .setFooter({ text: 'Com carinho, Aeon 💛' });

        message.channel.send({
          embeds: [embed],
          files: [{
            attachment: outputPath,
            name: 'birthday-image.png'
          }],
          components: [row]
        }).then(() => {
          fs.unlinkSync(outputPath);
        });
      });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'hug_button') {
    hugCount++;

    await interaction.update({
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('hug_button')
            .setLabel(`Dar um abraço na Yaya🫂 (Total: ${hugCount})`)
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  }
});

client.login(config.token);
