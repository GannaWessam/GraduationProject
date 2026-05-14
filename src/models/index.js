const sequelize = require("../connections/db");
const Receipts = require("./Receipts")(sequelize);

const Nationality = require("./Nationality")(sequelize);
const User = require("./User")(sequelize);
const Student = require("./Student")(sequelize);
const Product = require("./Product")(sequelize);
const Payment = require("./Payment")(sequelize);
const university = require("./University")(sequelize);
const college = require("./College")(sequelize);
const university_college = require("./university_college")(sequelize);
const Department = require("./Department")(sequelize);
const ProductAllowedUserType = require("./ProductAllowedUserType")(sequelize);
const course = require("./Course")(sequelize);
const training = require("./Training")(sequelize);
const event = require("./Event")(sequelize);
const trainingReservation = require("./TrainingReservation")(sequelize);
const exam = require("./Exam")(sequelize);
const notification = require("./Notification")(sequelize);
const resource = require("./Resource")(sequelize);
const productCourse = require("./ProductCourse")(sequelize);
const packageProduct = require("./PackageProduct")(sequelize);
const studentCourse = require("./StudentCourse")(sequelize);
const examReservation = require("./ExamReservation")(sequelize);
const package = require("./Packages")(sequelize);
const packageCourse = require("./PackageCourse")(sequelize);
const reservation = require("./Reservation")(sequelize);
const Conversation = require("./Conversation")(sequelize);
const Message = require("./Message")(sequelize);
const ConversationUser = require("./ConversationUser")(sequelize);
const session = require("./Session")(sequelize);
const supervisor = require("./Supervisor")(sequelize);
const trainer = require("./Trainer")(sequelize);
const SuperAdmin = require("./SuperAdmin")(sequelize);
const Admin = require("./Admin")(sequelize);
const SessionMaterial = require("./SessionMaterial")(sequelize);
const attendance = require("./attendance")(sequelize);
const currency = require("./Currency")(sequelize);
const efada = require("./Efada")(sequelize);
const webhook = require("./Webhook")(sequelize);

const Permission = require("./Permissions")(sequelize);
const UserPermission = require("./UserPermission")(sequelize);
const Profile = require("./Profile")(sequelize);
const ProfilePermission = require("./ProfilePermission")(sequelize);
const Container = require("./Container")(sequelize);
const Service = require("./Service")(sequelize);
const examReservationArchive = require("./ExamReservationArchive")(sequelize);
const Reexam = require("./ReexamRequest")(sequelize);
const Register = require("./RegisterRequest")(sequelize);
const systemdata = require("./SystemData")(sequelize);
const userReceipts = require("./userReceipts")(sequelize);

Student.hasMany(Payment, {
  foreignKey: "userId",
});
Payment.belongsTo(Student, {
  foreignKey: "userId",
});

Payment.belongsTo(Product, {
  foreignKey: "productId",
});
Product.hasMany(Payment, {
  foreignKey: "productId",
  as: "payments",
});

Student.belongsTo(Product,{
  foreignKey:"productId"
})
Product.hasMany(Student,{
  foreignKey:"productId"
})

// Associations

//USERS
//==============================================================

//user - student
User.hasOne(Student, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Student.belongsTo(User, { foreignKey: "userId" });

//user - trainer
User.hasOne(trainer, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

trainer.belongsTo(User, { foreignKey: "userId" });

//user - supervisor
User.hasOne(supervisor, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

supervisor.belongsTo(User, { foreignKey: "userId" });

//user - SuperAdmin
User.hasOne(SuperAdmin, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

SuperAdmin.belongsTo(User, { foreignKey: "userId" });

//user - Admin
User.hasOne(Admin, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Admin.belongsTo(User, { foreignKey: "userId" });

//==============================================================

User.hasMany(Payment, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Payment.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(ProductAllowedUserType, {
  //hyakhod el types ka array
  foreignKey: { name: "productId", allowNull: false },
  as: "allowedUserTypes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

university.hasMany(university_college, {
  foreignKey: { name: "universityId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

university_college.belongsTo(university, {
  foreignKey: { name: "universityId", allowNull: false },
});

college.hasMany(university_college, {
  foreignKey: { name: "collegeId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

university_college.belongsTo(college, {
  foreignKey: { name: "collegeId", allowNull: false },
});

university.belongsToMany(college, {
  through: university_college,
  foreignKey: "universityId",
  otherKey: "collegeId",
  as: "colleges",
});

college.belongsToMany(university, {
  through: university_college,
  foreignKey: "collegeId",
  otherKey: "universityId",
  as: "universities",
});

college.hasMany(Department, {
  foreignKey: "CollegeId",
  onDelete: "CASCADE",
});

Department.belongsTo(college, {
  foreignKey: "CollegeId",
});

course.hasMany(training, { foreignKey: "courseId" });
training.belongsTo(course, { foreignKey: "courseId" });

course.hasMany(exam, { foreignKey: "courseId" });
exam.belongsTo(course, { foreignKey: "courseId" });

// User ↔ Exam (supervisor relationship)
supervisor.hasMany(exam, { foreignKey: "supervisorId", as: "supervisedExams" });
exam.belongsTo(supervisor, { foreignKey: "supervisorId", as: "supervisor" });

trainer.hasMany(training, { foreignKey: "trainerId", as: "trainings" });
training.belongsTo(trainer, { foreignKey: "trainerId", as: "trainer" });

User.hasMany(notification, { foreignKey: "userId" });
notification.belongsTo(User, { foreignKey: "userId" });

//=====================================================
Product.belongsToMany(course, {
  through: "productCourse",
  foreignKey: "productId",
});

course.belongsToMany(Product, {
  through: "productCourse",
  foreignKey: "courseId",
});

User.belongsToMany(course, {
  through: "studentCourse",
  foreignKey: "userId",
});

course.belongsToMany(User, {
  through: "studentCourse",
  foreignKey: "courseId",
});

event.hasMany(training, {
  foreignKey: "eventId",
  as: "trainings",
  onDelete: "CASCADE",
});
training.belongsTo(event, {
  foreignKey: "eventId",
  as: "event",
  onDelete: "CASCADE",
});

event.hasMany(exam, { foreignKey: "eventId", onDelete: "CASCADE" });
exam.belongsTo(event, { foreignKey: "eventId", onDelete: "CASCADE" });

// User ↔ ExamReservation
Student.hasMany(examReservation, { foreignKey: "userId" });
examReservation.belongsTo(Student, { foreignKey: "userId" });

// Exam ↔ ExamReservation
exam.hasMany(examReservation, { foreignKey: "examId" });
examReservation.belongsTo(exam, { foreignKey: "examId" });

// Training ↔ TrainingReservation
training.hasMany(trainingReservation, { foreignKey: "trainingId" });
trainingReservation.belongsTo(training, { foreignKey: "trainingId" });

// User ↔ TrainingReservation
Student.hasMany(trainingReservation, { foreignKey: "userId" });
trainingReservation.belongsTo(Student, { foreignKey: "userId" });

Student.hasMany(studentCourse, { foreignKey: "userId" });
studentCourse.belongsTo(Student, { foreignKey: "userId" });

// Course ↔ StudentCourse
course.hasMany(studentCourse, { foreignKey: "courseId" });
studentCourse.belongsTo(course, { foreignKey: "courseId" });

package.belongsToMany(Product, {
  through: packageProduct,
  foreignKey: "packageId",
});

Product.belongsToMany(package, {
  through: packageProduct,
  foreignKey: "productId",
});

package.belongsToMany(course, {
  through: packageCourse,
  foreignKey: "packageId",
});

course.belongsToMany(package, {
  through: packageCourse,
  foreignKey: "courseId",
});

package.hasMany(packageCourse, { foreignKey: "packageId" });
packageCourse.belongsTo(package, { foreignKey: "packageId" });

//  package -> event
package.hasMany(event, {
  foreignKey: "packageId",
  onDelete: "SET NULL",
});

event.belongsTo(package, {
  foreignKey: "packageId",
});

//  product -> event
Product.hasMany(event, {
  foreignKey: "productId",
  onDelete: "SET NULL",
});

event.belongsTo(Product, {
  foreignKey: "productId",
});

//  Student -> Reservations
Student.hasMany(reservation, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
reservation.belongsTo(Student, { foreignKey: "userId" });

//  Event -> Reservations
event.hasMany(reservation, {
  foreignKey: "eventId",
  onDelete: "CASCADE",
});
reservation.belongsTo(event, {
  foreignKey: "eventId",
  as: "reservationEvent",
  onDelete: "CASCADE",
});
//  Reservation -> ExamReservation
reservation.hasMany(examReservation, {
  foreignKey: "reservationId",
  onDelete: "SET NULL",
});
examReservation.belongsTo(reservation, { foreignKey: "reservationId" });

//  Reservation -> TrainReservation
reservation.hasOne(trainingReservation, {
  foreignKey: "reservationId",
  onDelete: "SET NULL",
});
trainingReservation.belongsTo(reservation, { foreignKey: "reservationId" });

// Chat Associations
// Conversation ↔ ConversationUser (many-to-many through ConversationUser)
Conversation.belongsToMany(User, {
  through: ConversationUser,
  foreignKey: "conversationId",
  otherKey: "userId",
  as: "users",
});

User.belongsToMany(Conversation, {
  through: ConversationUser,
  foreignKey: "userId",
  otherKey: "conversationId",
  as: "conversations",
});

// Conversation ↔ Message (one-to-many)
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
  onDelete: "CASCADE",
});
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

// User ↔ Message (sender relationship)
User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
  onDelete: "CASCADE",
});
Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

// Conversation ↔ Event (for training groups)
event.hasMany(Conversation, {
  foreignKey: "eventId",
  as: "conversations",
  onDelete: "CASCADE",
});
Conversation.belongsTo(event, {
  foreignKey: "eventId",
  as: "event",
  onDelete: "CASCADE",
});

// ConversationUser relationships
ConversationUser.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});
ConversationUser.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

training.hasMany(session, {
  foreignKey: "trainingId",
  as: "sessions",
});

session.belongsTo(training, {
  foreignKey: "trainingId",
  as: "sessionTraining",
});

// User ↔ Permission (Many-to-Many)
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: "userId",
  otherKey: "permissionId",
  as: "permissions",
});

Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: "permissionId",
  otherKey: "userId",
  as: "users",
});

Profile.belongsToMany(Permission, {
  through: ProfilePermission,
  foreignKey: "profileId",
  otherKey: "permissionId",
  as: "permissions",
});

Permission.belongsToMany(Profile, {
  through: ProfilePermission,
  foreignKey: "permissionId",
  otherKey: "profileId",
  as: "profiles",
});

Container.hasMany(Permission, {
  foreignKey: "containerId",
  as: "permissions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Permission.belongsTo(Container, {
  foreignKey: "containerId",
  as: "container",
});

//====session => session material===============
session.hasMany(SessionMaterial, { foreignKey: "sessionId", as: "materials" });
SessionMaterial.belongsTo(session, { foreignKey: "sessionId" });
//==============================================

//====session => attendance===============
session.hasMany(attendance, { foreignKey: "sessionId" });
attendance.belongsTo(session, { foreignKey: "sessionId" });
//==============================================

//====session => attendance===============
Student.hasMany(attendance, { foreignKey: "userId" });
attendance.belongsTo(Student, { foreignKey: "userId" });
//==============================================

course.belongsTo(currency, { foreignKey: "currencyId" });
currency.hasMany(course, { foreignKey: "currencyId" });

Product.belongsTo(currency, { foreignKey: "currencyId" });
currency.hasMany(Product, { foreignKey: "currencyId" });

Service.belongsTo(currency, { foreignKey: "currencyId" });
currency.hasMany(Service, { foreignKey: "currencyId" });

Payment.belongsTo(currency, { foreignKey: "currencyId" });
currency.hasMany(Payment, { foreignKey: "currencyId" });

Payment.belongsTo(Service, { foreignKey: "serviceId" });
Service.hasMany(Payment, { foreignKey: "serviceId" });

efada.belongsTo(Payment, { foreignKey: "paymentId" });
Payment.hasMany(efada, { foreignKey: "paymentId" });

Reexam.belongsTo(Payment, { foreignKey: "paymentId" });
Payment.hasMany(Reexam, { foreignKey: "paymentId" });

Reexam.belongsTo(exam, { foreignKey: "examId" });
exam.hasMany(Reexam, { foreignKey: "examId" });

efada.belongsTo(Student, {
  foreignKey: "userId",
  onDelete: "SET NULL",
});

Student.hasMany(efada, {
  foreignKey: "userId",
  as: "efadas",
});

Reexam.belongsTo(Student, {
  foreignKey: "userId",
  onDelete: "SET NULL",
});

Student.hasMany(Reexam, {
  foreignKey: "userId",
});

examReservationArchive.belongsTo(exam, {
  foreignKey: "examId",
  as: "exam",
  constraints: false,
});

examReservationArchive.belongsTo(Student, {
  foreignKey: "userId",
  as: "Student",
  constraints: false,
});

Register.belongsTo(Student, {
  foreignKey: "userId",
  onDelete: "SET NULL",
});

Student.hasMany(Register, {
  foreignKey: "userId",
});

Register.belongsTo(Payment, { foreignKey: "paymentId" });
Payment.hasMany(Register, { foreignKey: "paymentId" });


Product.belongsTo(Receipts, {
  foreignKey: "receiptId",
});

// Product -> Receipt (Others)
Product.belongsTo(Receipts, {
  foreignKey: "receiptIdOthers",
});


// Reverse relation
Receipts.hasMany(Product, {
  foreignKey: "receiptId",
});

Receipts.hasMany(Product, {
  foreignKey: "receiptIdOthers",
});

// Service -> Receipt (Egypt)
Service.belongsTo(Receipts, {
  foreignKey: "receiptId",
});

// Service -> Receipt (Others)
Service.belongsTo(Receipts, {
  foreignKey: "receiptIdOthers",
});


// Reverse relation
Receipts.hasMany(Service, {
  foreignKey: "receiptId",
});

Receipts.hasMany(Service, {
  foreignKey: "receiptIdOthers",
});



Student.hasMany(userReceipts, {
  foreignKey: 'userId',
  sourceKey: 'userId',
});

userReceipts.belongsTo(Student, {
  foreignKey: 'userId',
  targetKey: 'userId',
});

Payment.hasMany(userReceipts, {
  foreignKey: 'paymentId',
  sourceKey: 'paymentId',
  as: "receipt",
});

userReceipts.belongsTo(Payment, {
  foreignKey: 'paymentId',
  targetKey: 'paymentId',
});

module.exports = {
  sequelize,
  User,
  Permission,
  UserPermission,
  Profile,
  ProfilePermission,
  Container,
  Nationality,
  Student,
  Product,
  Payment,
  ProductAllowedUserType,
  university,
  college,
  university_college,
  Department,
  course,
  event,
  training,
  exam,
  trainingReservation,
  notification,
  resource,
  productCourse,
  examReservation,
  studentCourse,
  packageCourse,
  packageProduct,
  package,
  reservation,
  Conversation,
  Message,
  ConversationUser,
  session,
  SessionMaterial,
  trainer,
  supervisor,
  SuperAdmin,
  Admin,
  attendance,
  currency,
  efada,
  Service,
  webhook,
  examReservationArchive,
  Reexam,
  Register,
  systemdata,
  Receipts,
  userReceipts
};
