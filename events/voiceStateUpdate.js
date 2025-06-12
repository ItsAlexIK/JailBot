const { saveJailedUsers } = require("../utils/jailData");

module.exports = (jailedUsers) => async (oldState, newState) => {
  const member = newState.member;
  if (!member) return;

  const jailInfo = jailedUsers[member.id];
  const jailChannelId = process.env.JAIL_VOICE_CHANNEL_ID;

  if (jailInfo) {
    const now = new Date();
    const endTime = jailInfo.until ? new Date(jailInfo.until) : null;

    if (endTime && now > endTime) {
      delete jailedUsers[member.id];
      saveJailedUsers(jailedUsers);
      console.log(
        `${member.user.tag} został zwolniony - czas więzienia minął.`
      );
      return;
    }

    if (newState.channelId !== jailChannelId) {
      if (member.voice.channel) {
        console.log(
          `${member.user.tag} próbował opuścić kanał więzienia - przenoszę z powrotem.`
        );
        member.voice.setChannel(jailChannelId).catch(console.error);
      } else {
        console.log(
          `${member.user.tag} nie jest połączony z żadnym kanałem głosowym.`
        );
      }
    }
  }
};
