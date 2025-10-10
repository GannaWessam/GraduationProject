// seedAll_part2.js
const { v4: uuidv4 } = require("uuid");
const { sequelize, college, Department } = require("../src/models/index");

async function seedAllPart2() {
  try {
    console.log("🚀 Starting seeding part 2...");
    const now = new Date();

    const createdColleges = await college.findAll();
    const getCollegeId = (collegeNamePart) =>
      createdColleges.find((c) => c.Name.includes(collegeNamePart))?.collegeId;

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

    // ---- كلية الصيدلة (Faculty of Pharmacy)
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

    // ---- كلية العلوم (Faculty of Science)
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

    // ---- كلية الآداب (Faculty of Arts)
    const artsSections = [
      "Department of Arabic Language|قسم اللغة العربية",
      "Department of English Language|قسم اللغة الإنجليزية",
      "Department of French Language|قسم اللغة الفرنسية",
      "Department of German Language|قسم اللغة الألمانية",
      "Department of Chinese Language|قسم اللغة الصينية",
      "Department of Spanish Language|قسم اللغة الإسبانية",
      "Department of Italian Language|قسم اللغة الإيطالية",
      "Department of Hebrew Language|قسم اللغة العبرية",
      "Department of Oriental Languages|قسم اللغات الشرقية",
      "Department of Media|قسم الإعلام",
      "Department of Theatre|قسم المسرح",
      "Department of Archaeology & Civilization|قسم الآثار والحضارة",
      "Department of Philosophy|قسم الفلسفة",
      "Department of Psychology|قسم علم النفس",
      "Department of Geography & GIS|قسم الجغرافيا ونظم المعلومات الجغرافية",
      "Department of History|قسم التاريخ",
      "Department of Sociology|قسم علم الاجتماع",
      "Department of Information Studies|قسم دراسات المعلومات",
      "Department of Library & Information Science|قسم المكتبات والمعلومات",
      "Department of Drama & Theatre Criticism|قسم الدراما والنقد المسرحي",
      "Department of Tourism Guidance|قسم الإرشاد السياحي"
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

    // ---- كلية التمريض (Faculty of Nursing)
    const nursingSections = [
      "Department of Nursing Administration|قسم إدارة التمريض",
      "Department of Psychiatric & Mental Health Nursing|قسم تمريض الصحة النفسية والعقلية",
      "Department of Maternal & Newborn Health Nursing|قسم تمريض صحة الأم وحديثي الولادة",
      "Department of Adult Health Nursing|قسم تمريض صحة البالغين",
      "Department of Community Health Nursing|قسم تمريض صحة المجتمع",
      "Department of Pediatric Nursing|قسم تمريض الأطفال",
      "Department of Critical Care & Emergency Nursing|قسم تمريض الحالات الحرجة والطوارئ",
      "Department of Geriatric Nursing|قسم تمريض المسنين"
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

    // ---- كلية الاقتصاد المنزلي (Faculty of Home Economics)
    const homeEconSections = [
      "Department of Nutrition & Food Sciences|علوم التغذية وعلوم الأطعمة",
      "Department of Clinical Nutrition|التغذية العلاجية",
      "Department of Clothing & Textiles|الملابس والنسيج",
      "Department of Family & Childhood Institutions|إدارة مؤسسات الأسرة والطفولة",
      "Department of Home Economics Education|الاقتصاد المنزلي التربوي",
      "Department of Leather Industries|الصناعات الجلدية"
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

    // ---- كلية الخدمة الاجتماعية (Faculty of Social Work)
    const socialWorkSections = [
      "Department of Individual Social Work|العمل مع الأفراد",
      "Department of Group Social Work|العمل مع الجماعات",
      "Department of Community & Organization Work|العمل مع المجتمعات والمنظمات",
      "Department of Social Planning|التخطيط الاجتماعي",
      "Department of Social Work Fields|مجالات الخدمة الاجتماعية"
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

    // ---- كلية فنون جميلة (Faculty of Fine Arts)
    const fineArtsSections = [
      "Department of Architecture|العمارة",
      "Department of Interior Design & Scenography|الديكور (العمارة الداخلية والسينوغرافيا)",
      "Department of Graphic Design|جرافيك",
      "Department of Painting|التصوير",
      "Department of Sculpture|النحت",
      "Department of Art History|تاريخ الفن",
      "Department of Animation|الرسوم المتحركة",
      "Department of Restoration|الترميم"
    ];
    fineArtsSections.forEach((name) =>
      departments.push({
        DepartmentId: uuidv4(),
        Name: name,
        CollegeId: getCollegeId("كلية فنون جميلة"),
        createdAt: now,
        updatedAt: now,
      })
    );

    // ---- كلية الإعلام (Faculty of Mass Communication)
    const mediaSections = [
      "Department of Digital Media|برنامج الإعلام الرقمي",
      "Department of Media Production|قسم الإنتاج الإعلامي",
      "Department of Journalism|قسم الصحافة",
      "Department of Radio & TV|قسم الإذاعة والتليفزيون",
      "Department of Public Relations & Advertising|قسم العلاقات العامة والإعلان",
      "Department of English Media|شعبة الإعلام باللغة الإنجليزية",
      "Department of Marketing Communication|قسم الاتصالات التسويقية"
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

    // ---- كلية التربية النوعية (Faculty of Specific Education)
    const specificEduSections = [
      "Department of Special Needs|ذوي الاحتياجات الخاصة",
      "Department of Educational & Psychological Sciences|علوم تربوية ونفسية",
      "Department of Music Education|التربية الموسيقية",
      "Department of Art Education|التربية الفنية",
      "Department of Educational Media|إعلام تربوي",
      "Department of Educational Technology|تكنولوجيا التعليم",
      "Department of Home Economics|الاقتصاد المنزلي",
      "Department of Arts|الفنون",
      "Department of Computer Education|معلم الحاسب الآلي",
      "Department of Educational Theatre|المسرح التربوي"
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

    // ---- كلية العلاج الطبيعي (Faculty of Physical Therapy)
    const physioSections = [
      "Department of Basic Sciences|قسم العلوم الأساسية",
      "Department of Biomechanics|قسم الميكانيكا الحيوية",
      "Department of Orthopedic Physical Therapy|قسم العلاج الطبيعي لأمراض العظام وجراحتها",
      "Department of Neurology Physical Therapy|قسم العلاج الطبيعي لأمراض المخ والأعصاب وجراحتها",
      "Department of Pediatric Physical Therapy|قسم العلاج الطبيعي لأمراض الأطفال وجراحتها",
      "Department of Geriatrics & Internal Medicine|قسم العلاج الطبيعي لأمراض الباطنة والمسنين",
      "Department of Women's Health|قسم العلاج الطبيعي لصحة المرأة",
      "Department of Surgery & Burns Rehabilitation|قسم العلاج الطبيعي للجراحة والحروق والأمراض الجلدية"
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

    // ---- كلية الألسن (Languages)
    const languagesSections = [
      "Department of Arabic Language|قسم اللغة العربية",
      "Department of English Language|قسم اللغة الإنجليزية",
      "Department of French Language|قسم اللغة الفرنسية",
      "Department of Italian Language|قسم اللغة الإيطالية",
      "Department of Spanish Language|قسم اللغة الإسبانية",
      "Department of German Language|قسم اللغة الألمانية",
      "Department of Russian Language|قسم اللغة الروسية",
      "Department of Chinese Language|قسم اللغة الصينية",
      "Department of Japanese Language|قسم اللغة اليابانية",
      "Department of Korean Language|قسم اللغة الكورية",
      "Department of Portuguese Language|قسم اللغة البرتغالية",
      "Department of Persian Language|قسم اللغة الفارسية",
      "Department of Turkish Language|قسم اللغة التركية",
      "Department of Hebrew Language|قسم اللغة العبرية"
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

    // ---- كلية السياحة والفنادق (Faculty of Tourism and Hotels)
    const tourismSections = [
      "Department of Tourism Studies|الدراسات السياحية",
      "Department of Hotel Studies|الدراسات الفندقية",
      "Department of Tourism Guidance|الإرشاد السياحي"
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

    // ---- كلية الزراعة (Faculty of Agriculture)
    const agricultureSections = [
      "Department of Rural Sociology & Agricultural Extension|الإجتماع الريفي والإرشاد الزراعي",
      "Department of Soils|الأراضى",
      "Department of Agricultural Economics|الإقتصاد الزراعى",
      "Department of Dairy Science|الألبان",
      "Department of Animal Production|الإنتاج الحيواني",
      "Department of Ornamental Horticulture|بساتين الزينة",
      "Department of Pomology|بساتين الفاكهة",
      "Department of Plant Protection|وقاية النباتات",
      "Department of Genetics|الوراثة",
      "Department of Biochemistry|الكيمياء الحيوية الزراعية",
      "Department of Plant Pathology|أمراض النبات"
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

    // ---- كلية علوم الرياضة (بنين + بنات)
    const sportMenSections = [
      "Department of Sports Administration|الإدارة الرياضية",
      "Department of Recreational Sports|الترويح الرياضي",
      "Department of Individual Sports Training|تدريب الرياضات الفردية",
      "Department of Team Sports Training|تدريب الرياضات الجماعية",
      "Department of Physical Education Curriculum|المناهج وطرق تدريس التربية الرياضية",
      "Department of Sports Biomechanics|علوم الحركة الرياضية",
      "Department of Sports Health Sciences|علوم الصحة الرياضية",
      "Department of Adapted Physical Education|تربية رياضية معدلة",
      "Department of Senior Sports|رياضة كبار السن",
      "Department of Sports Psychology & Evaluation|علم النفس والاجتماع والتقويم الرياضي"
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
      "Department of Sports Health & Biology|العلوم الحيوية والصحة الرياضية",
      "Department of Athletics Training|تدريب مسابقات الميدان والمضمار",
      "Department of Gymnastics & Rhythmic Training|تدريب التمرينات الإيقاعية والجمباز الفني",
      "Department of Movement Expression|تدريب التعبير الحركي والإيقاع الحركي",
      "Department of Games Training|تدريب الألعاب الرياضية",
      "Department of Administration & Recreation|الإدارة الرياضية والترويح",
      "Department of Curriculum & Teaching Methods|المناهج وطرق تدريس التربية الرياضية"
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

    // ---- المعهد القومي للملكية الفكرية (National Institute of Intellectual Property)
    const ipInstituteSections = [
      "Department of Industrial Property|قسم الملكية الصناعية",
      "Department of Literary & Artistic Property|قسم الملكية الأدبية والفنية",
      "Department of Training & Skills Development|قسم التدريب وصقل المهارات",
      "Department of Arbitration & Mediation in IP Disputes|مركز التحكيم والوساطة في منازعات الملكية الفكرية"
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
    console.log("✅ All parts completed successfully!");
  } catch (error) {
    console.error("❌ Seeding part 2 failed:", error);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed (part 2).");
  }
}

seedAllPart2();
