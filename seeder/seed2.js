// seedAll_part2.js
const { v4: uuidv4 } = require("uuid");
const { sequelize, college, Department } = require("../src/models/index");

async function seedAllPart2() {
  try {
    console.log("🚀 Starting seeding part 2...");
    const now = new Date();

    const createdColleges = await college.findAll();

    const getCollegeId = (collegeNamePart) =>
      createdColleges.find((c) =>
        c.Name.includes(collegeNamePart)
      )?.collegeId;

    const departments = [];

    // ---- كلية التجارة (Faculty of Commerce)
    const commerceSections = [
      "Department of Accounting|قسم المحاسبة",
      "Department of Business Administration|قسم إدارة الأعمال",
      "Department of Political Science|قسم العلوم السياسية",
      "Department of Economics & Foreign Trade|قسم الاقتصاد والتجارة الخارجية",
      "Department of Statistics, Insurance & Actuarial Science|قسم الإحصاء والتأمين والرياضة",
      "Department of Information Systems|قسم نظم المعلومات"
    ];
    commerceSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية التجارة"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الصيدلة
    const pharmacySections = [
      "Department of Pharmacognosy|قسم العقاقير",
      "Department of Pharmaceutics & Industrial Pharmacy|قسم الصناعات الصيدلية",
      "Department of Pharmacy Practice|قسم ممارسة الصيدلة",
      "Department of Pharmacology & Toxicology|قسم الأدوية والسموم",
      "Department of Pharmaceutical Chemistry|قسم الكيمياء الصيدلية",
      "Department of Analytical Chemistry|قسم الكيمياء التحليلية الصيدلية",
      "Department of Organic Chemistry|قسم الكيمياء العضوية الصيدلية",
      "Department of Biochemistry & Molecular Biology|قسم الكيمياء الحيوية والبيولوجيا الجزيئية",
      "Department of Microbiology & Immunology|قسم الميكروبيولوجيا والمناعة",
      "Department of Clinical Pharmacy|قسم الصيدلة الإكلينيكية"
    ];
    pharmacySections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الصيدلة"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية العلوم
    const scienceSections = [
      "Department of Mathematics|قسم الرياضيات",
      "Department of Physics|قسم الفيزياء",
      "Department of Chemistry|قسم الكيمياء",
      "Department of Geology|قسم الجيولوجيا",
      "Department of Zoology & Botany|قسم علم الحيوان والنبات",
      "Department of Biochemistry|قسم الكيمياء الحيوية",
      "Department of Geophysics|قسم الجيوفيزياء",
      "Department of Botany & Microbiology|قسم النبات والميكروبيولوجيا"
    ];
    scienceSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية العلوم"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الآداب
    const artsSections = [
      "Department of Arabic Language|قسم اللغة العربية",
      "Department of English Language|قسم اللغة الإنجليزية",
      "Department of French Language|قسم اللغة الفرنسية",
      "Department of German Language|قسم اللغة الألمانية",
      "Department of Chinese Language|قسم اللغة الصينية",
      "Department of Spanish Language|قسم اللغة الإسبانية",
      "Department of Italian Language|قسم اللغة الإيطالية",
      "Department of Hebrew Language|قسم اللغة العبرية",
      "Department of Media|قسم الإعلام",
      "Department of Psychology|قسم علم النفس",
      "Department of Sociology|قسم علم الاجتماع",
      "Department of History|قسم التاريخ",
      "Department of Geography & GIS|قسم الجغرافيا ونظم المعلومات الجغرافية"
    ];
    artsSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الآداب"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية التمريض
    const nursingSections = [
      "Department of Nursing Administration|قسم إدارة التمريض",
      "Department of Psychiatric Nursing|تمريض الصحة النفسية",
      "Department of Maternal Health Nursing|تمريض الأمومة"
    ];
    nursingSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية التمريض"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الاقتصاد المنزلي
    const homeEconSections = [
      "Department of Nutrition & Food Sciences|علوم التغذية",
      "Department of Clothing & Textiles|الملابس والنسيج"
    ];
    homeEconSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الاقتصاد المنزلي"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الخدمة الاجتماعية
    const socialWorkSections = [
      "Department of Individual Social Work|العمل مع الأفراد",
      "Department of Community Work|العمل مع المجتمع"
    ];
    socialWorkSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الخدمة الاجتماعية"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الفنون الجميلة
    const fineArtsSections = [
      "Department of Architecture|العمارة",
      "Department of Painting|التصوير",
      "Department of Sculpture|النحت"
    ];
    fineArtsSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الفنون الجميلة"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الإعلام
    const mediaSections = [
      "Department of Journalism|الصحافة",
      "Department of Radio & TV|الإذاعة والتليفزيون"
    ];
    mediaSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الإعلام"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية التربية النوعية
    const specificEduSections = [
      "Department of Art Education|التربية الفنية",
      "Department of Music Education|التربية الموسيقية",
      "Department of Educational Technology|تكنولوجيا التعليم"
    ];
    specificEduSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية التربية النوعية"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية العلاج الطبيعي
    const physioSections = [
      "Department of Basic Sciences|العلوم الأساسية",
      "Department of Orthopedic Therapy|العلاج الطبيعي للعظام"
    ];
    physioSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية العلاج الطبيعي"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الألسن
    const languagesSections = [
      "Department of English Language|اللغة الإنجليزية",
      "Department of French Language|اللغة الفرنسية"
    ];
    languagesSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الألسن"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية السياحة والفنادق
    const tourismSections = [
      "Department of Tourism Studies|السياحة",
      "Department of Hotel Studies|الفنادق"
    ];
    tourismSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية السياحة والفنادق"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الزراعة
    const agricultureSections = [
      "Department of Animal Production|الإنتاج الحيواني",
      "Department of Plant Protection|وقاية النباتات"
    ];
    agricultureSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية الزراعة"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية علوم الرياضة
    const sportMenSections = [
      "Department of Sports Administration|الإدارة الرياضية"
    ];
    sportMenSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية علوم الرياضة بنين"),
        createdAt: now,
        updatedAt: now,
      })
    );

    const sportWomenSections = [
      "Department of Sports Training|التدريب الرياضي"
    ];
    sportWomenSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية علوم الرياضة بنات"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- المعهد القومي للملكية الفكرية
    const ipInstituteSections = [
      "Department of Intellectual Property|الملكية الفكرية"
    ];
    ipInstituteSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("المعهد القومي للملكية الفكرية"),
        createdAt: now,
        updatedAt: now,
      })
    );

    await Department.bulkCreate(departments);

    console.log("🏫 Departments (part 2) seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding part 2 failed:", error);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed (part 2).");
  }
}

seedAllPart2();