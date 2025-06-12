const fs = require("fs");
const path = require("path");
const { pipeline, PassThrough } = require("stream");
const prism = require("prism-media");
const { joinVoiceChannel } = require("@discordjs/voice");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");

const recordingsPath = path.join(__dirname, "recordings");
if (!fs.existsSync(recordingsPath)) fs.mkdirSync(recordingsPath);

ffmpeg.setFfmpegPath(ffmpegPath);

function startRecording(channel) {
  console.log("Próba połączenia z kanałem głosowym...");

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: true,
  });

  connection.on("error", (err) => {
    console.error("Błąd połączenia głosowego:", err);
  });

  let mixedAudioStream = null;
  let outputStream = null;
  let isRecording = false;

  const userStreams = new Map();

  function startNewRecording() {
    mixedAudioStream = new PassThrough();
    const outputPath = path.join(recordingsPath, `mixed-${Date.now()}.ogg`);
    outputStream = fs.createWriteStream(outputPath);
    isRecording = true;

    ffmpeg(mixedAudioStream)
      .inputFormat("s16le")
      .audioFrequency(48000)
      .audioChannels(1)
      .audioCodec("libopus")
      .audioBitrate(128)
      .format("ogg")
      .on("end", () => {
        console.log(`🎧 Zapisano nagranie miksu: ${outputPath}`);
      })
      .on("error", (err) => {
        console.error("❌ Błąd nagrywania miksu:", err);
      })
      .pipe(outputStream);

    console.log("🔴 Rozpoczęto nowe nagranie miksu");
  }

  connection.receiver.speaking.on("start", (userId) => {
    const rec = userStreams.get(userId);

    if (!isRecording) {
      startNewRecording();
    }

    if (rec) {
      if (rec.timeout) {
        clearTimeout(rec.timeout);
        rec.timeout = null;
      }
      return;
    }

    const opusStream = connection.receiver.subscribe(userId, {
      end: { behavior: "manual" },
    });
    const pcmStream = new prism.opus.Decoder({
      channels: 1,
      rate: 48000,
      frameSize: 960,
    });
    pipeline(opusStream, pcmStream, (err) => {
      if (err) {
        if (err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
          console.error(`❗ Błąd potoku audio dla użytkownika ${userId}:`, err);
        }
      } else {
      }
    });

    pcmStream.on("data", (chunk) => {
      if (mixedAudioStream && !mixedAudioStream.destroyed) {
        mixedAudioStream.write(chunk);
      }
    });

    userStreams.set(userId, {
      opusStream,
      pcmStream,
      timeout: null,
      destroyed: false,
    });
  });

  connection.receiver.speaking.on("end", (userId) => {
    const rec = userStreams.get(userId);
    if (!rec) return;

    if (rec.timeout) return;

    rec.timeout = setTimeout(() => {
      if (rec.destroyed) return;

      rec.destroyed = true;
      rec.opusStream.destroy();
      rec.pcmStream.end();

      userStreams.delete(userId);

      if (
        userStreams.size === 0 &&
        mixedAudioStream &&
        !mixedAudioStream.destroyed
      ) {
        mixedAudioStream.end();
        isRecording = false;
      }
    }, 10000);
  });
}

module.exports = { startRecording };
