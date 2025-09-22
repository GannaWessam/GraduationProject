const sequelize = require('../connections/db');
const bcrypt = require('bcrypt');
const { User, Student , Product} = require('../models');
const token = require('../middlewares/token')


async function registerUser(payload) {
  const {
    email,
    password,
    confirmPassword,
    name_ar,
    national_id,
    nationality,
    university,
    faculty,
    department,
    mobile,
    training_type,
    role = 'STUDENT'
  } = payload;
  

  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;
  

  if ( !email || !password || !confirmPassword || !name_ar || !national_id || !training_type ) {
    throw new Error('missing_required_fields');
  }

  const name = name_ar.trim();

  if (name.length < 3) {
    throw new Error('name not valied');
  }
  
  const passwordTrim = password.trim();

  if (passwordTrim.length < 3 && re.test(passwordTrim)) {
    throw new Error('password not valied');
  }

  if (password !== confirmPassword) throw new Error('password mismatch');

  if (nationality == "Egypt" && national_id.length !== 14) {
    throw new Error('national id must be 14 chars');}

  if (nationality == "Sudan" && national_id.length !== 9 &&  /^[A-Za-z]/.test(national_id) ) {
      throw new Error('national id not valid');}

  const cate = "egyptian" ;

  if(nationality !== "Egypt"){
      cate = "other";
  }
  const product = await Product.findOne({where:{product: training_type ,Category :cate }});

  if(!product){
    throw new Error('not found service');
  }
    return await sequelize.transaction(async (t) => {
    
    const existing = await User.findOne({ where: { email }, transaction: t });
    if (existing) throw new Error('email_exists');

    
    const existingNid = await Student.findOne({ where: { nationalId: national_id }, transaction: t });
    if (existingNid) throw new Error('national_id_exists');

    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    
    const user = await User.create({
      email,
      passwordHash: hashedPassword,
      role,
    }, { transaction: t });

    
    const student = await Student.create({
      fullName: name_ar,
      nationality,
      nationalId: national_id,
      university,
      college: faculty,
      department,
      nationalIdImage: "placeholder.png", 
      courseType: "EXAM_ONLY",
      userId: user.userId,
    }, { transaction: t });
    

    return {
      Price: product.price,
      id: user.userId,
      email: user.email,
      role: user.role,
      profile: {
        id: student.id,
        name_ar: student.fullName,
        national_id: student.nationalId,
        university: student.university,
        faculty: student.college,
        department: student.department,
        training_type: student.courseType,
      },
      
    };
  });
}


async function loginUser(email, password) {
  const user = await User.findOne({
    where: { email } 
  });
  if (!user) throw new Error('invalid_email');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('invalid_pass');

  const tok = token.generateToken(email);
  return {
    id: user.userId,
    email: user.email,
    role: user.role,
    profile: user.Student,
    token: tok
  };
}

module.exports = { registerUser, loginUser };