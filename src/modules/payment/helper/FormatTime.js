const formatDateOnly=(isoString, lang = "en")=> {
    const date = new Date(isoString);
  
    if (lang === "ar") {
      // Arabic locale
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } else {
      // English locale, format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
      const day = String(date.getDate()).padStart(2, "0");
  
      return `${year}-${month}-${day}`;
    }
  }

  module.exports = formatDateOnly;