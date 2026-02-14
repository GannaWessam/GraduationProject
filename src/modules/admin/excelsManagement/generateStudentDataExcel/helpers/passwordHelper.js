/**
 * Rule: same value as username but first letter of each segment capitalized.
 * Example: hel.en.1.5 → Hel.En.1.5
 */
function generatePasswordFromUsername(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('username is required for password generation');
  }
  return username
    .split('.')
    .map((segment) => {
      if (segment.length === 0) return segment;
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    })
    .join('.');
}

module.exports = {
  generatePasswordFromUsername,
};
