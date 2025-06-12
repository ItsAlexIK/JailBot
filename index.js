require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

const { loadJailedUsers } = require("./utils/jailData");
const interactionCreateHandler = require("./events/interactionCreate");
const voiceStateUpdateHandler = require("./events/voiceStateUpdate");

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

client.once("ready", () => {
  console.log(`Zalogowano jako ${client.user.tag}`);

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
  rest
    .put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
      body: commands,
    })
    .then(() => console.log("Zarejestrowano komendy slash"))
    .catch(console.error);
});

client.on("interactionCreate", interactionCreateHandler(jailedUsers));
client.on("voiceStateUpdate", voiceStateUpdateHandler(jailedUsers));

client.login(TOKEN);
