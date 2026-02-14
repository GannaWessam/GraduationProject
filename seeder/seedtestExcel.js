const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const reserve = require("../src/modules/user/reserveEvents/reservationService");
const nationalIds = [
"30301121603084",
"29712151801829",
"29112010104744",
"29909082100161",
"29911290101885",
"29408041200845",
"29809231602049",
"29805020100858",
"29412061401283",
"29409282100139",
"30111151304568",
"30010182502189",
"29606252301491",
"29303282201668",
"29808160102167",
"30103121301324",
"29912030100865",
"30012110100887",
"27506271401143",
"29509091201321",
"29209152302393",
"30004132101345",
"29711252101562",
"29904240104844",
"29707241400081",
"29802048800805",
"30201302103127",
"28004151401695",
"29903102100076",
"28909232100561",
"29603182102071",
"29609282104109",
"30307081601227",
"30107221301408",
"27810038800233",
"28405241402245",
"27201140102498",
"29305042301137",
"30005190104547",
"30207290103566",
"29306142102669",
"28604041600461",
"29807011802532",
"29805042103605",
"27508181302238",
"30103250101803",
"28606140103315",
"30207158800746",
"30004132101361",
"27908012703116",
"30201210104666",
"29609300105797",
"28905110100084",
"30103102305025",
"29107011807788",
"29602118800973",
"30109102102637",
"29709208800599",
"28501032100583",
"30009222103225",
"29911250102307",
"29609010104436",
"29809158800805",
"30108012300409",
"30109012624162",
"29701040100226",
];

const { sequelize, User, Student } = require("../src/models");

async function seedStudents() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected...");

    const hashedPassword = await bcrypt.hash("12345678", 10);

    for (let i = 0; i < nationalIds.length; i++) {

      const userId = uuidv4();
      const nationalId = nationalIds[i];

      // 1️⃣ Create User
      const user = await User.create({
        userId: userId,
        email: `student${i + 1}@test.com`,
        passwordHash: hashedPassword,
        role: "STUDENT",
      });

      // 2️⃣ Create Student
      await Student.create({
        userId: user.userId,
        fullName: `Student ${i + 1}`,
        NameEn: `Student ${i + 1}`,
        Mobile: `0100000${(1000 + i)}`,
        StudyLan: "EN",
        nationality: "Egyptian",
        nationalId: nationalId,
        status: "approved",
        university: "Cairo University",
        college: "Computer Science",
        department: "Information Systems",
        type: "1",
      });
    await reserve.registerForExam(user.userId ,"66ab5bc1-544d-4d7e-8468-fab7979cb90e" );
      console.log(`✔ Created Student ${i + 1}`);
    }

    console.log("🎉 ALL STUDENTS SEEDED SUCCESSFULLY");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedStudents();