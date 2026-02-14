function generateUsername(eventName, counter) {
  if (!eventName || counter == null) {
    throw new Error('eventName and counter are required for username generation');
  }
  // Sanitize event name: lowercase, replace spaces/special chars with single dot, no leading/trailing dots
  //todo
  const sanitized = String(eventName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.-]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '') || 'event';
  return `hel.${sanitized}.${counter}`;
}

module.exports = {
  generateUsername,
};
