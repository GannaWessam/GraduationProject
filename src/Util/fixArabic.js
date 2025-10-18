// Util/fixArabic.js

/**
 * Fix Arabic text for simple names and short phrases
 * by reversing word order. Works for most Arabic names.
 */
function fixArabic(text) {
  if (!text) return "";
  // split words, reverse order, and join
  return text.split(" ").reverse().join(" ");
}

module.exports = fixArabic;
