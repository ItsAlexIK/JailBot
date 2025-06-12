require("dotenv").config();
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Routes,
  PermissionsBitField,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const path = require("path");

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const JAIL_VOICE_CHANNEL_ID = process.env.JAIL_VOICE_CHANNEL_ID;
const JAIL_DATA_FILE = path.join(__dirname, "jailedUsers.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

function loadJailedUsers() {
  if (!fs.existsSync(JAIL_DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(JAIL_DATA_FILE, "utf8"));
}

function saveJailedUsers(jailedUsers) {
  fs.writeFileSync(JAIL_DATA_FILE, JSON.stringify(jailedUsers, null, 2));
}

function parseDuration(input) {
  const match = input.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const [, value, unit] = match;
  const num = parseInt(value);
  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

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
          description: "Czas (np. 10m, 2h, 1d)",
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, member } = interaction;

  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({
      content: "❌ Tylko administrator może używać tej komendy.",
      flags: 64,
    });
  }

  if (commandName === "jail") {
    const user = options.getUser("user");
    const czas = options.getString("czas");
    let until = null;

    if (czas) {
      const durationMs = parseDuration(czas);
      if (!durationMs) {
        return interaction.reply({
          content: "❌ Niepoprawny format czasu.",
          flags: 64,
        });
      }
      until = new Date(Date.now() + durationMs);
    }

    jailedUsers[user.id] = {
      until: until ? until.toISOString() : null,
      by: member.id,
    };
    saveJailedUsers(jailedUsers);

    await interaction.reply(
      `${user.tag} został(a) uwięziony(a)${
        until ? ` do ${until.toLocaleString()}` : ""
      }.`
    );

    const targetMember = await interaction.guild.members.fetch(user.id);
    if (targetMember.voice && targetMember.voice.channelId) {
      targetMember.voice.setChannel(JAIL_VOICE_CHANNEL_ID).catch(console.error);
    }
  }

  if (commandName === "unjail") {
    const user = options.getUser("user");
    if (jailedUsers[user.id]) {
      delete jailedUsers[user.id];
      saveJailedUsers(jailedUsers);
      await interaction.reply(
        `${user.tag} został(a) zwolniony(a) z więzienia.`
      );
    } else {
      await interaction.reply(`${user.tag} nie był(a) w więzieniu.`);
    }
  }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member;
  const jailInfo = jailedUsers[member.id];

  if (jailInfo) {
    const now = new Date();
    const endTime = jailInfo.until ? new Date(jailInfo.until) : null;

    if (endTime && now > endTime) {
      delete jailedUsers[member.id];
      saveJailedUsers(jailedUsers);
      return;
    }

    if (newState.channelId !== JAIL_VOICE_CHANNEL_ID) {
      member.voice.setChannel(JAIL_VOICE_CHANNEL_ID).catch(console.error);
    }
  }
});

client.login(TOKEN);
