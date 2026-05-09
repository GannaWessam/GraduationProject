/**
 * Rule: same value as username but first letter of each segment capitalized.
 * Example: hel.en.1.5 → Hel.En.1.5
 */
function generatePasswordFromUsername(username) {
  if (!username || typeof username !== "string") {
    throw new Error("username is required for password generation");
  }

  return `Capu.${username}`;
}

module.exports = {
  generatePasswordFromUsername,
};
