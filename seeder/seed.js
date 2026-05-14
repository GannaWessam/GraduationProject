// seedAll_part1.js
const { v4: uuidv4 } = require("uuid");
const { sequelize, university, college, Department } = require("../src/models/index");

async function seedAllPart1() {
  try {
    console.log("🚀 Starting seeding part 1...");

    const now = new Date();

    // ========================
    // 1️⃣ الجامعات
    // ========================
    const universities = [
      "Cairo University|جامعة القاهرة",
      "Alexandria University|جامعة الإسكندرية",
      "Ain Shams University|جامعة عين شمس",
      "Assiut University|جامعة أسيوط",
      "Tanta University|جامعة طنطا",
      "Mansoura University|جامعة المنصورة",
      "Zagazig University|جامعة الزقازيق",
      "Capital University|جامعة العاصمة",
      "Minia University|جامعة المنيا",
      "Menoufia University|جامعة المنوفية",
      "Suez Canal University|جامعة قناة السويس",
      "South Valley University|جامعة جنوب الوادي",
      "Banha University|جامعة بنها",
      "Fayoum University|جامعة الفيوم",
      "Beni Suef University|جامعة بني سويف",
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
      "New Valley University|جامعة الوادي الجديد",
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
      "Berlin Technical University|جامعة برلين التقنية",
      "Other | اخري"
    ];

    const universityData = universities.map((name) => ({
      UniversityId: uuidv4(),
      Name: name,
      createdAt: now,
      updatedAt: now,
    }));

    await university.bulkCreate(universityData);
    console.log("🏛️ Universities seeded");

    // ========================
    // 2️⃣ الكليات
    // ========================
    const colleges = [
      "Faculty of Engineering (Helwan)|كلية هندسة حلوان",
      "Faculty of Engineering (Mataria)|كلية هندسة المطرية",
    
      "Faculty of Applied Arts|كلية الفنون التطبيقية",
      "Faculty of Fine Arts|كلية الفنون الجميلة",
      "Faculty of Art Education|كلية التربية الفنية",
      "Faculty of Music Education|كلية التربية الموسيقية",
    
      "Faculty of Medicine|كلية الطب",
      "Faculty of Pharmacy|كلية الصيدلة",
      "Faculty of Nursing|كلية التمريض",
      "Faculty of Technical Nursing Institute|كلية المعهد الفنى للتمريض",
      "Faculty of Physical Therapy|كلية العلاج الطبيعي",
    
      "Faculty of Computer and AI|كلية الحاسبات والذكاء الاصطناعي",
      "Faculty of Science|كلية العلوم",
      "Faculty of Agriculture|كلية الزراعة",
    
      "Faculty of Law|كلية الحقوق",
      "Faculty of Commerce|كلية التجارة",
      "Faculty of Commerce and Business Administration|كلية التجارة وإدارة الأعمال",
    
      "Faculty of Arts|كلية الآداب",
      "Faculty of Social Work|كلية الخدمة الاجتماعية",
      "Faculty of Home Economics|كلية الاقتصاد المنزلي",
    
      "Faculty of Tourism and Hotels|كلية السياحة والفنادق",
      "Faculty of Mass Communication|كلية الإعلام",
      "Faculty of Archaeology|كلية الآثار",
    
      "Faculty of Economics and Political Science|كلية الاقتصاد والعلوم السياسية",
      "Faculty of Specific Education|كلية التربية النوعية",
    
      "Faculty of Sport Sciences (Men)|كلية علوم الرياضة بنين",
      "Faculty of Sport Sciences (Women)|كلية علوم الرياضة بنات",
    
      "Faculty of Al-Alsun (Languages)|كلية الألسن",
      "National Institute of Intellectual Property|المعهد القومي للملكية الفكرية",
    
      "Faculty of Military Science|الكلية العسكرية",
    
      "Faculty of Industrial Education|كلية التعليم الصناعي",
      "Faculty of Technology and Education|كلية التكنولوجيا والتعليم",
    
      "Other|أخرى"
    ];

    const collegeData = colleges.map((name) => ({
      CollegeId: uuidv4(),
      Name: name,
      createdAt: now,
      updatedAt: now,
    }));

    const createdColleges = await college.bulkCreate(collegeData, { returning: true });
    console.log("🎓 Colleges seeded");

    // helper to find college id by Arabic or English snippet
    const getCollegeId = (collegeNamePart) =>
      createdColleges.find((c) => c.Name.includes(collegeNamePart))?.collegeId;

    // ========================
    // 3️⃣ الأقسام - نضيف أول 5 كليات كاملة
    // ========================
    const departments = [];

    // ---- كلية الهندسة (Faculty of Engineering)
    const engSections = [
      "Department of Mathematics & Engineering Physics|قسم الرياضيات والفيزياء الهندسية",
      "Department of Electrical Engineering|قسم الهندسة الكهربائية",
      "Department of Computer & Control Systems Engineering|قسم هندسة الحاسبات ونظم التحكم",
      "Department of Electronics & Communications Engineering|قسم الهندسة الإلكترونية والاتصالات الكهربائية",
      "Department of Textile Engineering|قسم الغزل والنسيج",
      "Department of Production & Mechanical Design|قسم الإنتاج والتصميم الميكانيكي",
      "Department of Mechanical Power|قسم القوى الميكانيكية",
      "Department of Architecture Engineering|قسم الهندسة المعمارية",
      "Department of Structural Engineering|قسم الهندسة الإنشائية",
      "Department of Public Works|قسم الأشغال العامة",
      "Department of Irrigation & Hydraulics|قسم الري والهيدروليكا",
      "Department of Aeronautics & Aerospace Engineering|قسم الطيران والفضاء",
      "Department of Biomedical Engineering|قسم الهندسة الحيوية الطبية",
      "Department of Chemical Engineering|قسم الهندسة الكيميائية",
      "Department of Marine Engineering|قسم الهندسة البحرية",
      "Department of Electrical Machines & Power|قسم القوى والآلات الكهربائية",
      "Department of Nuclear Engineering|قسم الهندسة النووية",
      "Department of Mechanical Engineering|قسم الهندسة الميكانيكية"
    ];
    console.log(getCollegeId("كلية هندسة حلوان") , "88888888888888888888888888888888888888888888888888888")
    engSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية هندسة حلوان"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الفنون التطبيقية (Faculty of Applied Arts)
    const artAppSections = [
      "Department of Advertising|قسم الإعلان",
      "Department of Printing & Packaging|قسم الطباعة والنشر والتغليف",
      "Department of Furniture & Metal Works|قسم الأثاثات والإنشاءات المعدنية",
      "Department of Interior Design & Furniture|قسم التصميم الداخلي والأثاث",
      "Department of Industrial Design|قسم التصميم الصناعي",
      "Department of Ceramics|قسم الخزف",
      "Department of Glass|قسم الزجاج",
      "Department of Ornamentation|قسم الزخرفة",
      "Department of Textile|قسم الغزل والنسيج",
      "Department of Ready-made Garments|قسم الملابس الجاهزة",
      "Department of Printed & Dyed Textiles|قسم المنسوجات المطبوعة والمصبوغة والتجهيز",
      "Department of Sculpture & Architectural Forming|قسم النحت والتشكيل المعماري",
      "Department of Photography, Cinema & TV|قسم التصوير الفوتوغرافي والسينما والتليفزيون"
    ];
    artAppSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الفنون التطبيقية"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الطب (Faculty of Medicine)
    const medicineSections = [
      "Department of Human Anatomy & Embryology|التشريح الآدمي وعلم الأجنة",
      "Department of Histology (Tissues & Cells)|الهستولوجيا الطبية (علم الأنسجة والخلايا)",
      "Department of Medical Physiology|الفسيولوجيا الطبية",
      "Department of Medical Biochemistry|الكيمياء الحيوية الطبية",
      "Department of Medical Biochemistry & Molecular Biology|الكيمياء الحيوية الطبية والبيولوجيا الجزيئية",
      "Department of Microbiology & Immunology|الميكروبيولوجيا والمناعة الطبية",
      "Department of Parasitology|الطفيليات الطبية",
      "Department of Anatomical Pathology|الباثولوجيا التشريحية",
      "Department of Clinical & Chemical Pathology|الباثولوجيا الإكلينيكية والكيميائية",
      "Department of Clinical Pharmacology|الفارماكولوجيا الإكلينيكية",
      "Department of Forensic Medicine & Clinical Toxicology|الطب الشرعي والسموم الإكلينيكية",
      "Department of Public Health & Community Medicine|الصحة العامة وطب المجتمع",
      "Department of Occupational & Environmental Medicine|الطب المهني والبيئي",
      "Department of Family Medicine|طب الأسرة",
      "Department of Geriatrics & Elderly Health|طب وصحة المسنين",
      "Department of Emergency Medicine|طب الطوارئ",
      "Department of Critical Care Medicine|طب الحالات الحرجة",
      "Department of Andrology & Reproductive Surgery|طب وجراحة أمراض الذكورة والتناسل",
      "Department of Cardiology|طب القلب والأوعية الدموية",
      "Department of Psychiatry|الأمراض النفسية",
      "Department of Neurology & Clinical Neurophysiology|أمراض المخ والأعصاب والفسيولوجيا الإكلينيكية للجهاز العصبي",
      "Department of Neurology & Psychiatry|طب المخ والأعصاب والطب النفسي",
      "Department of Endemic Diseases|الأمراض المتوطنة",
      "Department of Pulmonology|الأمراض الصدرية",
      "Department of Internal Medicine|أمراض الباطنة العامة",
      "Department of Dermatology & Venereology|الأمراض الجلدية والتناسلية والذكورة",
      "Department of Diagnostic Radiology|الأشعة التشخيصية",
      "Department of Diagnostic & Therapeutic Radiology|الأشعة التشخيصية والعلاجية",
      "Department of Oncology & Nuclear Medicine|علاج الأورام والطب النووي",
      "Department of General Surgery|الجراحة العامة",
      "Department of Surgery|الجراحة",
      "Department of Orthopedics|جراحة العظام",
      "Department of Pediatric Surgery|جراحة الأطفال",
      "Department of Cardiothoracic Surgery|جراحة القلب والصدر",
      "Department of Vascular Surgery|جراحة الأوعية الدموية",
      "Department of Plastic Surgery|جراحة التجميل",
      "Department of Urology & Andrology|جراحة المسالك البولية والتناسلية",
      "Department of Neurosurgery|جراحة المخ والأعصاب",
      "Department of Ophthalmology|طب وجراحة العيون",
      "Department of ENT (Otorhinolaryngology)|الأنف والأذن والحنجرة",
      "Department of Obstetrics & Gynecology|أمراض النساء والتوليد",
      "Department of Anesthesiology & Surgical Intensive Care|التخدير والعناية المركزة الجراحية وعلاج الألم"
    ];
    medicineSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الطب"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الحاسبات والذكاء الاصطناعي (Faculty of Computer and AI)
    const csSections = [
      "Department of Bioinformatics|نظم المعلومات الحيوية",
      "Department of Software Engineering|هندسة البرمجيات",
      "Department of Multimedia|الوسائط المتعددة",
      "Department of Cyber Security|الأمن السيبراني",
      "Department of Robotics Computing|حوسبة الروبوتات",
      "Department of Digital Environments|الأوساط الرقمية",
      "Department of Computer Systems|نظم الحاسبات",
      "Department of Basic Sciences|العلوم الأساسية",
      "Department of Bio-IT|تقنية المعلومات الحيوية",
      "Department of Information Technology|تقنية المعلومات",
      "Department of Computer Science|علوم الحاسب",
      "Department of Artificial Intelligence|الذكاء الاصطناعي",
      "Department of Information Systems|نظم المعلومات",
      "Department of Operations Research & Decision Support|بحث العمليات ودعم اتخاذ القرار"
    ];
    csSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الحاسبات والذكاء الاصطناعي"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الحقوق (Faculty of Law)
    const lawSections = [
      "Department of Islamic Sharia|الشريعة الإسلامية",
      "Department of Labor Law & Social Legislation|قانون العمل والتشريعات الاجتماعية",
      "Department of Commercial Law|القانون التجاري",
      "Department of Criminal Law|القانون الجنائي",
      "Department of Economics|الاقتصاد",
      "Department of Philosophy & History of Law|فلسفة القانون وتاريخه",
      "Department of Public International Law|القانون الدولي العام",
      "Department of Civil Law|القانون المدني",
      "Department of Private International Law|القانون الدولي الخاص",
      "Department of Civil Procedures|قانون المرافعات",
      "Department of Public Law|القانون العام"
    ];
    lawSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الحقوق"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ===============
    // Insert collected departments (part 1)
    // ===============
    await Department.bulkCreate(departments);
    console.log("🏫 Departments (part 1) seeded successfully!");

    console.log("✅ Part 1 completed successfully!");
  } catch (error) {
    console.error("❌ Seeding part 1 failed:", error);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed (part 1).");
  }
}

seedAllPart1();
