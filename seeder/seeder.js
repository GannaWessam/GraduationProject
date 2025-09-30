const { v4: uuidv4 } = require('uuid');
const { sequelize, university, college, university_college } = require('../src/models/index');

async function seedAll() {
  try {
    // === الجامعات بالإنجليزي | عربي ===
    const universities = [
      "Cairo University|جامعة القاهرة",
      "Alexandria University|جامعة الاسكندرية",
      "Ain Shams University|جامعة عين شمس",
      "Assiut University|جامعة أسيوط",
      "Tanta University|جامعة طنطا",
      "Mansoura University|جامعة المنصورة",
      "Zagazig University|جامعة الزقازيق",
      "Helwan University|جامعة حلوان",
      "Minia University|جامعة المنيا",
      "Menoufia University|جامعة المنوفية",
      "Suez Canal University|جامعة قناة السويس",
      "South Valley University|جامعة جنوب الوادي",
      "Banha University|جامعة بنها",
      "Fayoum University|جامعة الفيوم",
      "Beni Suef University|جامعة بنى سويف",
      "Kafr El Sheikh University|جامعة كفر الشيخ",
      "Sohag University|جامعة سوهاج",
      "Port Said University|جامعة بورسعيد",
      "Damanhour University|جامعة دمنهور",
      "Damietta University|جامعة دمياط",
      "Aswan University|جامعة أسوان",
      "Suez University|جامعة السويس",
      "Sadat City University|جامعة مدينة السادات",
      "El Arish University|جامعة العريش",
      "Matrouh University|جامعة مطروح",
      "New Valley University|جامعة الوادى الجديد",
      "Luxor University|جامعة الأقصر",
      "Hurghada University|جامعة الغردقة",
      "Alexandria National University|جامعة الإسكندرية الأهلية",
      "Egypt-Japan University of Science & Technology|الجامعة المصرية اليابانية للعلوم والتكنولوجيا",
      "Cairo University International Branch|جامعة القاهرة الفرع الدولي",
      "Galala University|جامعة الجلالة",
      "King Salman International University|جامعة الملك سلمان الدولية",
      "Alamein International University|جامعة العلمين الدولية",
      "New Mansoura University|جامعة المنصورة الجديدة",
      "The Nile University|جامعة النيل",
      "Zewail City of Science & Technology|جامعة العلوم والتكنولوجيا (مدينة زويل)",
      "Egyptian E-Learning University|الجامعة المصرية للتعلم الإلكتروني",
      "French University in Egypt|الجامعة الفرنسية في مصر",
      "Laboral University|الجامعة العمالية",
      "American University in Cairo|الجامعة الأمريكية بالقاهرة",
      "British University in Egypt|الجامعة البريطانية في مصر",
      "German University in Cairo|الجامعة الألمانية بالقاهرة",
      "Russian University in Egypt|الجامعة المصرية الروسية",
      "Chinese University in Egypt|الجامعة المصرية الصينية",
      "Future University in Egypt|جامعة المستقبل بمصر",
      "Heliopolis University|جامعة هليوبوليس",
      "Misr International University|جامعة مصر الدولية",
      "Modern University for Technology & Information|الجامعة الحديثة للتكنولوجيا والمعلومات",
      "Badr University in Cairo|جامعة بدر بالقاهرة",
      "Arab Open University|الجامعة العربية المفتوحة",
      "New Giza University|جامعة الجيزة الجديدة (نيو جيزة)",
      "October 6 University|جامعة 6 أكتوبر",
      "Canadian University of Cairo|جامعة الأهرام الكندية",
      "October University for Modern Sciences & Arts|جامعة أكتوبر للعلوم الحديثة والآداب",
      "Misr University for Science & Technology|جامعة مصر للعلوم والتكنولوجيا",
      "Pharos University in Alexandria|جامعة فاروس بالإسكندرية",
      "Senghor University|جامعة سنجور",
      "Arab Academy for Science, Technology & Maritime Transport|الأكاديمية العربية للعلوم والتكنولوجيا والنقل البحري",
      "Delta University for Science & Technology|جامعة الدلتا للعلوم والتكنولوجيا",
      "10th of Ramadan University|جامعة العاشر من رمضان",
      "Horus University|جامعة حورس",
      "Nahda University|جامعة النهضة",
      "Deraya University|جامعة دراية",
      "Merit University|جامعة ميريت",
      "Sinai University|جامعة سيناء",
      "Berlin Technical University|جامعة برلين التقنية"
    ];

    const universityData = universities.map(name => ({
      UniversityId: uuidv4(),
      Name: name,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdUniversities = await university.bulkCreate(universityData, { ignoreDuplicates: true });
    console.log("✅ Universities seeded successfully");

    // === الكليات بالإنجليزي | عربي ===
    const colleges = [
      "Faculty of Arts|كلية الآداب",
      "Faculty of Home Economics|كلية الاقتصاد المنزلى",
      "Faculty of Education|كلية التربية",
      "Faculty of Nursing|كلية التمريض",
      "Faculty of Computers & AI|كلية الحاسبات والذكاء الاصطناعى",
      "Faculty of Social Work|كلية الخدمة الاجتماعية",
      "Faculty of Pharmacy|كلية الصيدلة",
      "Faculty of Medicine|كلية الطب",
      "Faculty of Science|كلية العلوم",
      "Faculty of Applied Arts|كلية الفنون التطبيقية",
      "Faculty of Fine Arts|كلية الفنون الجميلة",
      "Faculty of Physical Education (Boys)|كلية علوم الرياضة بنين",
      "Faculty of Engineering (El Mataria)|كلية الهندسة (المطرية)",
      "Faculty of Engineering (Helwan)|كلية الهندسة (حلوان)",
      "Faculty of Commerce & Business Administration|كلية التجارة وإدارة الأعمال",
      "Faculty of Physical Education (Girls)|كلية علوم الرياضة بنات",
      "Faculty of Art Education|كلية التربية الفنية",
      "National Institute of Intellectual Property|المعهد القومي للملكية الفكرية",
      "Nursing Institute|معهد التمريض",
      "Faculty of Technology & Education|كلية التكنولوجيا والتعليم",
      "Faculty of Law|كلية الحقوق",
      "Faculty of Music Education|كلية التربية الموسيقية",
      "Faculty of Tourism & Hotels|كلية السياحة والفنادق",
      "Faculty of Nutrition Science|كلية علوم التغذية"
    ];

    const collegeData = colleges.map(name => ({
      collegeId: uuidv4(),
      Name: name,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdColleges = await college.bulkCreate(collegeData, { ignoreDuplicates: true });
    console.log("✅ Colleges seeded successfully");

    // === ربط كل كلية بالجامعة ===
    const helwanUniversity = createdUniversities.find(u => u.Name.includes("Helwan University"));
    if (helwanUniversity) {
      const helwanCollegeRelations = createdColleges.map(col => ({
        Id: uuidv4(),
        universityId: helwanUniversity.UniversityId,
        collegeId: col.collegeId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      await university_college.bulkCreate(helwanCollegeRelations, { ignoreDuplicates: true });
      console.log("✅ Colleges linked to Helwan University successfully");
    }

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await sequelize.close();
  }
}

// تشغيل الفايل مباشرة
seedAll();