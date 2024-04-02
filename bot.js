const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { DeezerPlugin } = require("@distube/deezer");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { printWatermark } = require('./util/pw');
const config = require("./config.js");
const fs = require("fs");
const path = require('path');

const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a];
  }),
});

client.config = config;
client.player = new DisTube(client, {
  leaveOnStop: config.opt.voiceConfig.leaveOnStop,
  leaveOnFinish: config.opt.voiceConfig.leaveOnFinish,
  leaveOnEmpty: config.opt.voiceConfig.leaveOnEmpty.status,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
    new YtDlpPlugin(),
    new DeezerPlugin(),
  ],
});
process.env.YTDL_NO_UPDATE = true;
const player = client.player;

fs.readdir("./events", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0]; 
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});
fs.readdir("./events/player", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const player_events = require(`./events/player/${file}`);
    let playerName = file.split(".")[0];
    player.on(playerName, player_events.bind(null, client));
    delete require.cache[require.resolve(`./events/player/${file}`)];
  });
});

client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
  if (err) throw err;
  files.forEach(async (f) => {
    try {
      if (f.endsWith(".js")) {
        let props = require(`${config.commandsDir}/${f}`);
        client.commands.push({
          name: props.name,
          description: props.description,
          options: props.options,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
});

// Music Bot Code

client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'join') {
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      message.channel.send('Joined the voice channel!');
    } else {
      message.channel.send('You need to be in a voice channel to use this command!');
    }
  } else if (command === 'leave') {
    const connection = message.guild.me.voice.connection;
    if (connection) {
      connection.disconnect();
      message.channel.send('Left the voice channel!');
    } else {
      message.channel.send('I\'m not in a voice channel!');
    }
  } else if (command === 'play') {
    if (!args[0]) return message.channel.send('Please provide a song name or link!');
    const connection = message.guild.me.voice.connection;
    if (!connection) return message.channel.send('I\'m not in a voice channel!');
    const dispatcher = connection.play(args[0]);
    dispatcher.on('start', () => {
      message.channel.send(`Now playing: ${args[0]}`);
    });
    dispatcher.on('finish', () => {
      message.channel.send('Song finished!');
    });
    dispatcher.on('error', console.error);
  } else if (command === 'pause') {
    const connection = message.guild.me.voice.connection;
    if (connection && connection.dispatcher) {
      connection.dispatcher.pause();
      message.channel.send('Song paused!');
    } else {
      message.channel.send('I\'m not playing anything!');
    }
  } else if (command === 'resume') {
    const connection = message.guild.me.voice.connection;
    if (connection && connection.dispatcher) {
      connection.dispatcher.resume();
      message.channel.send('Song resumed!');
    } else {
      message.channel.send('I\'m not playing anything!');
    }
  }
});

// End of Music Bot Code

if (config.TOKEN || process.env.TOKEN) {
  client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
    console.log('TOKEN ERROR❌❌');
  });
} else {
  setTimeout(() => {
    console.log('TOKEN ERROR❌❌');
  }, 2000);
}

if(config.mongodbURL || process.env.MONGO){
  const mongoose = require("mongoose")
  mongoose.connect(config.mongodbURL || process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  }).then(async () => {
    console.log('\x1b[32m%s\x1b[0m', `|    🍔 Connected MongoDB!`)
  }).catch((err) => {
    console.log('\x1b[32m%s\x1b[0m', `|    🍔 Failed to connect MongoDB!`)})
  } else {
  console.log('\x1b[32m%s\x1b[0m', `|    🍔 Error MongoDB!`)
  }

const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log(`🔗 Listening to RTX: http://localhost:${port}`);
  console.log(`✨ Happy New Year Welcome To 2024`);
});
printWatermark();
