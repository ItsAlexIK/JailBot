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

module.exports = { parseDuration };
