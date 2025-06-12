require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { startRecording } = require("./recorder");
const { loadJailedUsers } = require("./utils/jailData");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

let jailedUsers = loadJailedUsers();

client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user.tag}`);

  const jailChannel = await client.channels.fetch(
    process.env.JAIL_VOICE_CHANNEL_ID
  );
  if (jailChannel && jailChannel.isVoiceBased()) {
    startRecording(jailChannel);
    console.log(
      "Bot dołączył na stałe do kanału więzienia i rozpoczął nagrywanie."
    );
  } else {
    console.error("Nie udało się znaleźć kanału głosowego więzienia.");
  }

  const commands = [
    {
      name: "jail",
      description: "Uwięź użytkownika",
      options: [
        {
          name: "user",
          type: 6,
          description: "Użytkownik do uwięzienia",
          required: true,
        },
        {
          name: "czas",
          type: 3,
          description: "Czas (np. 30s, 10m, 2h, 1d)",
          required: false,
        },
      ],
    },
    {
      name: "unjail",
      description: "Zwolnij użytkownika z więzienia",
      options: [
        {
          name: "user",
          type: 6,
          description: "Użytkownik do zwolnienia",
          required: true,
        },
      ],
    },
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
      body: commands,
    });
    console.log("Zarejestrowano komendy slash");
  } catch (error) {
    console.error("Błąd rejestracji komend:", error);
  }
});

const interactionCreateHandler = require("./events/interactionCreate");
const voiceStateUpdateHandler = require("./events/voiceStateUpdate");

client.on("interactionCreate", interactionCreateHandler(jailedUsers));
client.on("voiceStateUpdate", voiceStateUpdateHandler);

client.login(TOKEN);
