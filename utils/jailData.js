const fs = require("fs");
const path = require("path");

const JAIL_DATA_FILE = path.join(__dirname, "..", "jailedUsers.json");

function loadJailedUsers() {
  if (!fs.existsSync(JAIL_DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(JAIL_DATA_FILE, "utf8"));
}

function saveJailedUsers(jailedUsers) {
  fs.writeFileSync(JAIL_DATA_FILE, JSON.stringify(jailedUsers, null, 2));
}

module.exports = { loadJailedUsers, saveJailedUsers };
