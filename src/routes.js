const express = require("express");
const authRoutes = require("./modules/Auth/AuthRoute");
const productRoutes = require("./modules/Product/ProductRoute");
const universityRoutes = require("./modules/university/universityRoute");
const collegeRoutes = require("./modules/college/collegeRoute");
const universityCollegeRoutes = require("./modules/university-college/universityCollegeRoute");
const adminRoutes = require("./modules/admin/routes");
const Department = require("./modules/Department/DepartmentRoute");
const Nationality = require("./modules/nationality/NationalityRoute");
const notifications=require('./modules/Notifications/NotificationRoutes');
const course = require('./modules/Courses/CourseRoute');
const reservationRoute = require('./modules/user/reserveEvents/reservationRoutes')

const { validateToken } = require("./middlewares/token");

const router = express.Router();

router.use("/api/admin", adminRoutes);
router.use("/api", authRoutes);
router.use("/api/products",  productRoutes);
router.use("/api/universities", universityRoutes);
router.use("/api/colleges", collegeRoutes);
router.use("/api/university-colleges", universityCollegeRoutes);
router.use("/api/Department", Department);
router.use("/api/nationality", Nationality);
router.use('/api/notifications', notifications);
router.use('/api/courses', course);
router.use('/api/reservations', reservationRoute);
module.exports = router;
