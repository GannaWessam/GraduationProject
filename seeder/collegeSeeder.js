const { v4: uuidv4 } = require("uuid");
const { college } = require("../src/models/index");

async function seedColleges() {
  const colleges = [
    "كلية الآداب|Faculty of Arts",
    "كلية الاقتصاد المنزلى|Faculty of Home Economics",
    "كلية التربية|Faculty of Education",
    "كلية التمريض|Faculty of Nursing",
    "كلية الحاسبات والذكاء الاصطناعى|Faculty of Computers & AI",
    "كلية الخدمة الاجتماعية|Faculty of Social Work",
    "كلية الصيدلة|Faculty of Pharmacy",
    "كلية الطب|Faculty of Medicine",
    "كلية العلوم|Faculty of Science",
    "كلية الفنون التطبيقية|Faculty of Applied Arts",
    "كلية الفنون الجميلة|Faculty of Fine Arts",
    "كلية علوم الرياضة بنين|Faculty of Physical Education (Boys)",
    "كلية الهندسة (المطرية)|Faculty of Engineering (El Mataria)",
    "كلية الهندسة (حلوان)|Faculty of Engineering (Helwan)",
    "كلية التجارة وإدارة الأعمال|Faculty of Commerce & Business Administration",
    "كلية علوم الرياضة بنات|Faculty of Physical Education (Girls)",
    "كلية التربية الفنية|Faculty of Art Education",
    "المعهد القومي للملكية الفكرية|National Institute of Intellectual Property",
    "معهد التمريض|Nursing Institute",
    "كلية التكنولوجيا والتعليم|Faculty of Technology & Education",
    "كلية الحقوق|Faculty of Law",
    "كلية التربية الموسيقية|Faculty of Music Education",
    "كلية السياحة والفنادق|Faculty of Tourism & Hotels",
    "كلية علوم التغذية|Faculty of Nutrition Science"
  ];
  
    const data = colleges.map((name) => ({
      collegeId: uuidv4(),
      Name: name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  
    await college.bulkCreate(data, { ignoreDuplicates: true });
    console.log("✅ Colleges seeded successfully");
  }
  
  module.exports = seedColleges;