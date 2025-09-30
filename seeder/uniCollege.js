const { university_college} = require("../src/models/index");

async function seedHelwanUniversityRelations() {
  try {
    const helwanUniversityId = "52bd1cd7-a39c-4d9c-910a-3210430d02d2"; // ID جامعة حلوان
    const collegeIds = [
      "05686401-c89b-4b52-8531-c8fe6b512b6b",
      "27154b75-d5b5-4951-af90-fe9f438b350f",
      "291f4f63-a93b-4f4e-8744-4c218e1d3c78",
      "2a4d3d09-2006-4d60-8ed7-0eaf5039ef37",
      "368906a9-98d0-4553-aa0f-28da2f5347c6",
      "4b3fa680-44fc-43d9-8f20-a7d7a947ca77",
      "60a3f003-9045-4c13-9685-c267f5c2c678",
      "6886b8e1-88ae-40f4-adf6-b2dc19d129a8",
      "777004d3-0249-4a4b-aa1e-624aadfec7ed",
      "837a02e8-7e5a-44e5-bb28-16e202ca5646",
      "8a0c2b69-9aac-4a55-bb47-f7c24eef4738",
      "9f7cad05-adec-462d-8d78-e26eeaab4aae",
      "a7600913-5817-4521-81fa-10273216373d",
      "b37abb0f-3e09-4c64-a0bf-37bb3fb0d1cf",
      "b6f603a4-7149-4a58-b0f2-4f810dd61e15",
      "b9b2a36d-f99c-4faf-a3ec-cb77fccbba7f",
      "c322479c-d6dc-482c-9177-007bc642870e",
      "ce26a79a-4089-4918-8207-6c2c0e7a6f2c",
      "ce6effcf-8406-41de-b35c-99d0858ade6a",
      "e93972f1-11bd-4c52-bbef-80c2752fad7b",
      "ec15f1c9-f414-4624-a830-8b01c23c4bbc",
      "ee267cf0-2e11-48e2-89e8-9f33a1204e4f",
      "fbd4928a-affe-4a91-8103-8aec8843989d",
      "feeed492-4ffd-47c4-a61f-5489ab8b7048"
    ];

    for (const collegeId of collegeIds) {
      await university_college.create({
        universityId: helwanUniversityId,
        collegeId,
      });
    }

    console.log("✅ تم ربط كل كليات جامعة حلوان");
  } catch (err) {
    console.error("❌ خطأ في Seeder علاقة جامعة حلوان:", err);
  }
}

module.exports = seedHelwanUniversityRelations;