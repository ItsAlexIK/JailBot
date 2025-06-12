const { saveJailedUsers } = require("../utils/jailData");

module.exports = async (interaction, jailedUsers) => {
  const user = interaction.options.getUser("user");

  if (jailedUsers[user.id]) {
    delete jailedUsers[user.id];
    saveJailedUsers(jailedUsers);
    await interaction.reply(`${user.tag} został(a) zwolniony(a) z więzienia.`);
  } else {
    await interaction.reply(`${user.tag} nie był(a) w więzieniu.`);
  }
};
