const { Op } = require("sequelize");
const { Product, event, package, packageCourse, productCourse: ProductCourse, studentCourse } = require("../../../../models");

async function getAvailableEventsForUser(userId, productId) {
    // ✅ هنجمع الـ events اللي هتعدي كل الشروط
    const filteredEvents = [];
  
    // 🧩 هات بيانات الـ product علشان نعرف عدد الكورسات المطلوبة
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");
  
    // 🧩 هات كل الكورسات المرتبطة بالـ product
    const productCourses = await ProductCourse.findAll({ where: { productId } });
  
    // 🧩 احسب عدد الكورسات الإلزامية (mandatory)
    const mandatoryCourses = productCourses.filter(pc => pc.status === "mandatory").length;
    const optionalAllowed = product.requirdCourses - mandatoryCourses;
  
    // 🧩 هات الكورسات اللي المستخدم خلصها
    const doneCourses = await studentCourse.findAll({
      where: {
        userId,
        trainingStatus: "done"
      },
      attributes: ["courseId"]
    });
    const doneCourseIds = doneCourses.map(c => c.courseId);
   
  
    // 🧩 هات كل الأحداث (events) اللي حالتها مفتوحة والباقة فيها packageId مش null
    const events = await event.findAll({
      where: {
        status: "open",
        productId,
        packageId: { [Op.ne]: null }
      },
      include: [
        {
          model: package,
          include: [
            {
              model: packageCourse,
              attributes: ["courseId"]
            }
          ]
        }
      ]
    });
  
    // 🧩 فلترة الـ events بناءً على الشروط
    for (const event of events) {
      const packageCourses = event.package?.packageCourses || [];
      const packageCourseIds = packageCourses.map(pc => pc.courseId);
    
  
      // ❌ لو المستخدم خلص أي كورس من كورسات الباقة => استبعد الباقة
      const userDidAnyCourseInPackage = doneCourseIds.some(id => packageCourseIds.includes(id));
      if (userDidAnyCourseInPackage) continue;
  
      // ✅ اجمع الكورسات الإجمالية (اللي خلصها + اللي في الباقة)
      const totalCoursesCount = doneCourseIds.length + packageCourseIds.length;
  
      // ✅ الشرط الأول: العدد الإجمالي ≤ المسموح
      if (totalCoursesCount <= product.requirdCourses) {
  
        // 🟩 الكورسات الاختيارية كلها في الـ product
        const optionalProductCourses = productCourses.filter(pc => pc.status === "optional");
  
        // 🟩 الكورسات الاختيارية اللي المستخدم خلصها
        const doneOptionalCourses = optionalProductCourses.filter(pc => doneCourseIds.includes(pc.courseId));
  
        // 🟩 الكورسات الاختيارية في الباقة الحالية
        const packageOptionalCourses = optionalProductCourses.filter(pc => packageCourseIds.includes(pc.courseId));
  
        // 🧮 المجموع الكلي للكورسات الاختيارية
        const totalOptional = doneOptionalCourses.length + packageOptionalCourses.length;
  
        // ✅ الشرط الثاني: عدد الاختيارية ≤ المسموح
        if (totalOptional <= optionalAllowed) {
          filteredEvents.push(event);
        }
      }
    }
  
    return filteredEvents;
  }

  module.exports = { getAvailableEventsForUser };