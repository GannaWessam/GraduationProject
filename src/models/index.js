const sequelize = require('../connections/db');

const User = require('./User')(sequelize);
const Student = require('./Student')(sequelize);
const Product = require('./Product')(sequelize);
const Payment = require('./Payment')(sequelize);
const university = require('./University')(sequelize);
const college = require('./College')(sequelize);
const university_college = require('./university_college')(sequelize);
const Department = require('./Department')(sequelize);
const ProductAllowedUserType = require('./ProductAllowedUserType')(sequelize);



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







module.exports = { sequelize, User, Student, Product, Payment, ProductAllowedUserType, university , college ,university_college, Department };
