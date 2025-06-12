const { saveJailedUsers } = require("../utils/jailData");

module.exports = (jailedUsers) => async (oldState, newState) => {
  const member = newState.member;
  const jailInfo = jailedUsers[member.id];
  const jailChannelId = process.env.JAIL_VOICE_CHANNEL_ID;

  if (jailInfo) {
    const now = new Date();
    const endTime = jailInfo.until ? new Date(jailInfo.until) : null;

    if (endTime && now > endTime) {
      delete jailedUsers[member.id];
      saveJailedUsers(jailedUsers);
      return;
    }

    if (newState.channelId !== jailChannelId) {
      member.voice.setChannel(jailChannelId).catch(console.error);
    }
  }
};
