const jailCommand = require("../commands/jail");
const unjailCommand = require("../commands/unjail");

module.exports = (jailedUsers) => async (interaction) => {
  if (!interaction.isCommand()) return;

  if (!interaction.member.permissions.has("Administrator")) {
    return interaction.reply({
      content: "❌ Tylko administrator może używać tej komendy.",
      flags: 64,
    });
  }

  if (interaction.commandName === "jail")
    return jailCommand(interaction, jailedUsers);
  if (interaction.commandName === "unjail")
    return unjailCommand(interaction, jailedUsers);
};
