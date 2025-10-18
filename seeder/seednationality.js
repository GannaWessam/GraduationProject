// seedNationalities.js
const { v4: uuidv4 } = require("uuid");
const { sequelize, Nationality } = require("../src/models/index");

async function seedNationalities() {
  try {
    console.log("🚀 Starting seeding nationalities...");
    const now = new Date();

    const names = [
      "Afghan | أفغاني", "Albanian | ألباني", "Algerian | جزائري", "American | أمريكي",
      "Andorran | أندوري", "Angolan | أنغولي", "Antiguan | أنتيغوي", "Argentinian | أرجنتيني",
      "Armenian | أرمني", "Australian | أسترالي", "Austrian | نمساوي", "Azerbaijani | أذربيجاني",
      "Bahamian | بهامي", "Bahraini | بحريني", "Bangladeshi | بنغلاديشي", "Barbadian | بربادوسي",
      "Belarusian | بيلاروسي", "Belgian | بلجيكي", "Belizean | بليزي", "Beninese | بنيني",
      "Bhutanese | بوتاني", "Bolivian | بوليفي", "Bosnian | بوسني", "Botswanan | بتسواني",
      "Brazilian | برازيلي", "British | بريطاني", "Bruneian | برونايي", "Bulgarian | بلغاري",
      "Burkinabé | بوركيني", "Burundian | بوروندي", "Cabo Verdean | كابو فيردي", "Cambodian | كمبودي",
      "Cameroonian | كاميروني", "Canadian | كندي", "Central African | أفريقي مركزي", "Chadian | تشادي",
      "Chilean | تشيلي", "Chinese | صيني", "Colombian | كولومبي", "Comoran | قمري",
      "Congolese (Congo-Brazzaville) | كونغولي (الكونغو-برازاڤيل)", "Congolese (DRC) | كونغولي (جمهورية الكونغو الديمقراطية)",
      "Costa Rican | كوستاريكي", "Croatian | كرواتي", "Cuban | كوبي", "Cypriot | قبرصي",
      "Czech | تشيكي", "Danish | دانماركي", "Djiboutian | جيبوتي", "Dominican | دومينيكاني",
      "Ecuadorean | إكوادوري", "Egyptian | مصري", "Emirati | إماراتي", "Palestinian | فلسطيني",
      "English | إنجليزي", "Eritrean | إريتري", "Estonian | إستوني", "Ethiopian | إثيوبي",
      "Fijian | فيجي", "Finnish | فنلندي", "French | فرنسي", "Gabonese | غابوني",
      "Gambian | غامبي", "Georgian | جورجي", "German | ألماني", "Ghanaian | غاني",
      "Greek | يوناني", "Grenadian | غرينادي", "Guatemalan | غواتيمالي", "Guinean | غيني",
      "Bissau-Guinean | غيني بيساوي", "Guyanese | غوياني", "Haitian | هايتي", "Honduran | هندوراسي",
      "Hungarian | مجري", "Icelander | آيسلندي", "Indian | هندي", "Indonesian | إندونيسي",
      "Iranian | إيراني", "Iraqi | عراقي", "Irish | إيرلندي", "Italian | إيطالي",
      "Ivorian | إيفواري", "Jamaican | جامايكي", "Japanese | ياباني", "Jordanian | أردني",
      "Kazakh | كازاخستاني", "Kenyan | كيني", "Kiribati | كيريباتي", "Kuwaiti | كويتي",
      "Kyrgyz | قيرغيزي", "Laotian | لاوسي", "Latvian | لاتفي", "Lebanese | لبناني",
      "Lesotho | ليسوتي", "Liberian | ليبيري", "Libyan | ليبي", "Liechtensteiner | ليختنشتايني",
      "Lithuanian | ليتواني", "Luxembourger | لوكسمبورغي", "Macedonian | مقدوني", "Malagasy | مدغشقري",
      "Malawian | مالاوي", "Malaysian | ماليزي", "Maldivian | مالديفي", "Malian | مالي",
      "Maltese | مالطي", "Marshallese | مارشالي", "Mauritanian | موريتاني", "Mauritian | موريسي",
      "Mexican | مكسيكي", "Micronesian | ميكرونيزي", "Moldovan | مولدوفي", "Monacan | موناكي",
      "Mongolian | مغولي", "Montenegrin | مونتينيغري", "Moroccan | مغربي", "Mozambican | موزمبيقي",
      "Namibian | ناميبي", "Nauruan | ناوروي", "Nepalese | نيبالي", "Dutch | هولندي",
      "New Zealander | نيوزيلندي", "Nicaraguan | نيكاراغوي", "Nigerian | نيجيري", "Nigerien | نيجرى",
      "North Korean | كوري شمالي", "Norwegian | نرويجي", "Omani | عماني", "Pakistani | باكستاني",
      "Palauan | بالاوي", "Panamanian | بنمي", "Papua New Guinean | بابوا غينيا الجديدة",
      "Paraguayan | باراغوياني", "Peruvian | بيروفي", "Filipino | فلبيني", "Polish | بولندي",
      "Portuguese | برتغالي", "Qatari | قطري", "Romanian | روماني", "Russian | روسي",
      "Rwandan | رواندي", "Saint Lucian | سانت لوسي", "Salvadoran | سلفادوري", "Samoan | ساموا",
      "San Marinese | سان ماريني", "Sao Tomean | ساو تومي", "Saudi | سعودي", "Senegalese | سنغالي",
      "Serbian | صربي", "Seychellois | سيشلي", "Sierra Leonean | سيراليوني", "Singaporean | سنغافوري",
      "Slovak | سلوفاكي", "Slovenian | سلوفيني", "Solomon Islander | جزر سليمان", "Somali | صومالي",
      "South African | جنوب أفريقي", "South Korean | كوري جنوبي", "Spanish | إسباني", "Sri Lankan | سريلانكي",
      "Sudanese | سوداني", "Surinamese | سورينامي", "Swazi | سوازي", "Swedish | سويدي",
      "Swiss | سويسري", "Syrian | سوري", "Tajik | طاجيكي", "Tanzanian | تنزاني",
      "Thai | تايلاندي", "Timorese | تيموري", "Togolese | توغولي", "Tongan | تونغي",
      "Trinidadian | ترينيدادي", "Tunisian | تونسي", "Turkish | تركي", "Turkmen | تركماني",
      "Tuvaluan | توفالي", "Ugandan | أوغندي", "Ukrainian | أوكراني", "Uruguayan | أوروغوياني",
      "Uzbek | أوزبكي", "Vanuatuan | فانواتي", "Vatican | فاتيكان", "Venezuelan | فنزويلي",
      "Vietnamese | فيتنامي", "Yemeni | يمني", "Zambian | زامبي", "Zimbabwean | زيمبابوي"
    ];

    const records = names.map((n) => ({
      NationalityId: uuidv4(),
      Name: n,
      createdAt: now,
      updatedAt: now,
    }));

    await Nationality.bulkCreate(records);
    console.log("✅ Nationalities seeded successfully!");
  } catch (err) {
    console.error("❌ Error seeding nationalities:", err);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed.");
  }
}

seedNationalities();
