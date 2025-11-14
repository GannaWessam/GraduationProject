const sequelize = require('../connections/db');

const Nationality = require('./Nationality')(sequelize);
const User = require('./User')(sequelize);
const Student = require('./Student')(sequelize);
const Product = require('./Product')(sequelize);
const Payment = require('./Payment')(sequelize);
const university = require('./University')(sequelize);
const college = require('./College')(sequelize);
const university_college = require('./university_college')(sequelize);
const Department = require('./Department')(sequelize);
const ProductAllowedUserType = require('./ProductAllowedUserType')(sequelize);
const course = require('./Course')(sequelize);
const training = require('./Training')(sequelize);
const event = require('./Event')(sequelize);
const trainingReservation = require('./TrainingReservation')(sequelize);
const exam= require('./Exam')(sequelize);
const notification= require('./Notification')(sequelize);
const resource= require('./Resource')(sequelize);
const productCourse= require('./ProductCourse')(sequelize);
const packageProduct = require('./PackageProduct')(sequelize);
const studentCourse= require('./StudentCourse')(sequelize);
const examReservation= require('./ExamReservation')(sequelize);
const package= require('./Packages')(sequelize);
const packageCourse= require('./PackageCourse')(sequelize);
const reservation= require('./Reservation')(sequelize);
const Conversation = require('./Conversation')(sequelize);
const Message = require('./Message')(sequelize);
const ConversationUser = require('./ConversationUser')(sequelize);


User.hasMany(Payment, {
  foreignKey: 'userId',
  as: 'payments', // ✅ alias
});
Payment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'paymentUser', // ✅ alias مختلف
});

Payment.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});
Product.hasMany(Payment, {
  foreignKey: 'productId',
  as: 'payments',
});

// Associations
User.hasOne(Student, {
  foreignKey: { name: 'userId', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Student.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Payment, {
  foreignKey: { name: 'productId', allowNull: false },
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
Payment.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Payment, {
  foreignKey: { name: 'userId', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Payment.belongsTo(User, { foreignKey: 'userId' });


Product.hasMany(ProductAllowedUserType, { //hyakhod el types ka array
  foreignKey: { name: 'productId', allowNull: false },
  as: 'allowedUserTypes',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

university.hasMany(university_college, {
  foreignKey: { name: 'universityId', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

university_college.belongsTo(university, {
  foreignKey: { name: 'universityId', allowNull: false },
  
});


college.hasMany(university_college, {
  foreignKey: { name: 'collegeId', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

university_college.belongsTo(college, {
  foreignKey: { name: 'collegeId', allowNull: false },
  
});

university.belongsToMany(college, {
  through: university_college,
  foreignKey: "universityId",
  otherKey: "collegeId",
  as: "colleges"
});

college.belongsToMany(university, {
  through: university_college,
  foreignKey: "collegeId",
  otherKey: "universityId",
  as: "universities"
});

college.hasMany(Department, {
  foreignKey: 'CollegeId',
  onDelete: 'CASCADE',
});

Department.belongsTo(college, {
  foreignKey: 'CollegeId',
});


course.hasMany(training, { foreignKey: 'courseId' });
training.belongsTo(course, { foreignKey: 'courseId' });

course.hasMany(exam, { foreignKey: 'courseId' });
exam.belongsTo(course, { foreignKey: 'courseId' });

// User ↔ Exam (supervisor relationship)
User.hasMany(exam, { foreignKey: 'supervisorId', as: 'supervisedExams' });
exam.belongsTo(User, { foreignKey: 'supervisorId', as: 'supervisor' });

User.hasMany(training, { foreignKey: 'trainerId', as: 'trainings' });
training.belongsTo(User, { foreignKey: 'trainerId', as: 'trainer' });

User.hasMany(notification, { foreignKey: 'userId' });
notification.belongsTo(User, { foreignKey: 'userId' });

//=====================================================
Product.belongsToMany(course, {
  through: 'productCourse',
  foreignKey: 'productId'
});

course.belongsToMany(Product, {
  through: 'productCourse',
  foreignKey: 'courseId'
});


User.belongsToMany(course, {
  through: 'studentCourse',
  foreignKey: 'userId'
});

course.belongsToMany(User, {
  through: 'studentCourse',
  foreignKey: 'courseId'
});


event.hasMany(training, { foreignKey: 'eventId', as: 'trainings' });
training.belongsTo(event, { foreignKey: 'eventId', as: 'event' });

event.hasOne(exam, { foreignKey: 'eventId' , });
exam.belongsTo(event, { foreignKey: 'eventId' });


// User ↔ ExamReservation
Student.hasMany(examReservation, { foreignKey: 'userId' });
examReservation.belongsTo(Student, { foreignKey: 'userId' });

// Exam ↔ ExamReservation
exam.hasMany(examReservation, { foreignKey: 'examId' });
examReservation.belongsTo(exam, { foreignKey: 'examId' });

// Training ↔ TrainingReservation
training.hasMany(trainingReservation, { foreignKey: 'trainingId' });
trainingReservation.belongsTo(training, { foreignKey: 'trainingId' });

// User ↔ TrainingReservation
Student.hasMany(trainingReservation, { foreignKey: 'userId' });
trainingReservation.belongsTo(Student, { foreignKey: 'userId' });

Student.hasMany(studentCourse, { foreignKey: 'userId' });
studentCourse.belongsTo(Student, { foreignKey: 'userId' });

// Course ↔ StudentCourse
course.hasMany(studentCourse, { foreignKey: 'courseId' });
studentCourse.belongsTo(course, { foreignKey: 'courseId' });



package.belongsToMany(Product, { 
  through: packageProduct,
  foreignKey: 'packageId' }
); 

Product.belongsToMany(package, { 
  through: packageProduct,
  foreignKey: 'productId' }
);


package.belongsToMany(course, {
  through: packageCourse,
  foreignKey: 'packageId',
});

course.belongsToMany(package, {
  through: packageCourse,
  foreignKey: 'courseId',
});


package.hasMany(packageCourse, { foreignKey: 'packageId' });
packageCourse.belongsTo(package, { foreignKey: 'packageId' });


//  package -> event
package.hasMany(event, {
  foreignKey: 'packageId',
  onDelete: 'SET NULL'
});

event.belongsTo(package, {
  foreignKey: 'packageId'
});

//  product -> event
Product.hasMany(event, {
  foreignKey: 'productId',
  onDelete: 'SET NULL'
});

event.belongsTo(Product, {
  foreignKey: 'productId'
});


//  Student -> Reservations
Student.hasMany(reservation, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
reservation.belongsTo(Student, { foreignKey: 'userId' });

//  Event -> Reservations
event.hasMany(reservation, {
  foreignKey: 'eventId',
  onDelete: 'CASCADE'
});
reservation.belongsTo(event, { foreignKey: 'eventId' });

//  Reservation -> ExamReservation
reservation.hasOne(examReservation, {
  foreignKey: 'reservationId',
  onDelete: 'SET NULL'
});
examReservation.belongsTo(reservation, { foreignKey: 'reservationId' });

//  Reservation -> TrainReservation
reservation.hasOne(trainingReservation, {
  foreignKey: 'reservationId',
  onDelete: 'SET NULL'
});
trainingReservation.belongsTo(reservation, { foreignKey: 'reservationId' });

// Chat Associations
// Conversation ↔ ConversationUser (many-to-many through ConversationUser)
Conversation.belongsToMany(User, {
  through: ConversationUser,
  foreignKey: 'conversationId',
  otherKey: 'userId',
  as: 'users'
});

User.belongsToMany(Conversation, {
  through: ConversationUser,
  foreignKey: 'userId',
  otherKey: 'conversationId',
  as: 'conversations'
});

// Conversation ↔ Message (one-to-many)
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
  onDelete: 'CASCADE'
});
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});

// User ↔ Message (sender relationship)
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages',
  onDelete: 'CASCADE'
});
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

// Conversation ↔ Event (for training groups)
event.hasMany(Conversation, {
  foreignKey: 'eventId',
  as: 'conversations',
  onDelete: 'SET NULL'
});
Conversation.belongsTo(event, {
  foreignKey: 'eventId',
  as: 'event'
});

// ConversationUser relationships
ConversationUser.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});
ConversationUser.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});




module.exports = { 
  sequelize, 
  User,
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
  ConversationUser
};
