const { parseDuration } = require("../utils/durationParser");
const { saveJailedUsers } = require("../utils/jailData");

module.exports = async (interaction, jailedUsers) => {
  const { options, member, guild } = interaction;

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

  const targetMember = await guild.members.fetch(user.id);
  if (targetMember.voice?.channelId) {
    targetMember.voice
      .setChannel(process.env.JAIL_VOICE_CHANNEL_ID)
      .catch(console.error);
  }
};
