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
const studentCourse= require('./StudentCourse')(sequelize);
const examReservation= require('./ExamReservation')(sequelize);


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


event.hasOne(training, { foreignKey: 'eventId' });
training.belongsTo(event, { foreignKey: 'eventId' });

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





module.exports = { sequelize, User,Nationality, Student, Product, Payment, ProductAllowedUserType, university , college ,university_college, Department,course , event, training , exam , trainingReservation , notification , resource, productCourse ,examReservation , studentCourse};
