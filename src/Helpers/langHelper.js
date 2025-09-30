// helpers/langHelper.js

/**
 * Concat English + Arabic values into a single DB string.
 * Example: concatLang("Helwan University", "جامعة حلوان")
 * Returns: "Helwan University | جامعة حلوان"
 */
function concatLang(en, ar) {
  if (!en && !ar) return null;
  return `${en || ""} | ${ar || ""}`.trim();
}

/**
 * Split a DB value into English + Arabic.
 * Example: splitLang("Helwan University | جامعة حلوان")
 * Returns: { en: "Helwan University", ar: "جامعة حلوان" }
 */
function splitLang(value) {
  if (!value) return { en: null, ar: null };
  const [en, ar] = value.split("|").map((v) => v.trim());
  return { en, ar };
}

module.exports = { concatLang, splitLang };
