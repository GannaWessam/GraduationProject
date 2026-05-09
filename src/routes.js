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
const reservationRoute = require('./modules/user/reserveEvents/reservationRoutes');
const chatRoutes = require('./modules/Chat/chatRoutes');
const TrainerManagmentRoute = require('./modules/SuperAdmin/TrainerManagment/TrainerManagmentRoute');
const SupervisorManagmentRoute = require('./modules/SuperAdmin/SupervisorManagment/SupervisorManagmentRoute');
const SuperAdminManagmentRoute = require('./modules/SuperAdmin/SuperAdminManagment/SuperAdminManagmentRoute');
const AdminManagmentRoute = require('./modules/SuperAdmin/AdminManagment/AdminManagmentRoute');
const permissionRoute = require('./modules/Permission/PermissionRoute');
const profileRoute = require('./modules/Profile/ProfileRoutes');
const ContainerRoute = require('./modules/PermissionContainer/ContainerRoute');
const AttendanceManagmentRoute = require('./modules/attendance/attendanceRoute');
const gradesRoutes = require("./modules/user/handleGrades/gradesRoutes");
const logsRoutes = require("./modules/Log/LogRoutes");
const payment = require("./modules/payment/paymentRoute");
const gradesManagmentRoutes = require("./modules/Grades/gradeRoute");
const serviceRoutes = require("./modules/ServiceManagement/ServiceRoutes");
const ReceiptsRoutes=require("./modules/SuperAdmin/ReceiptsManagment/ReceiptsRoutes");
const statisticsRoutes=require("./modules/statistics/statisticsRoutes");
const OCR=require("./modules/OCR/OCR-Routes")


const { validateToken } = require("./middlewares/token");
const reportRoutes = require("./modules/Report/ReportRoute");

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
router.use('/api/chat', chatRoutes);
router.use("/api/reports", reportRoutes);
router.use("/api/SuperAdmin/Supervisor", SupervisorManagmentRoute);
router.use("/api/SuperAdmin/SuperAdmin", SuperAdminManagmentRoute);
router.use("/api/SuperAdmin/Admin", AdminManagmentRoute);
router.use("/api/SuperAdmin/Receipts", ReceiptsRoutes);
router.use("/api/SuperAdmin", TrainerManagmentRoute);
router.use("/api/Attendance", AttendanceManagmentRoute);
router.use("/api/Permission", permissionRoute);
router.use("/api/Profile", profileRoute);
router.use("/api/Container", ContainerRoute);
router.use("/api/grades", gradesRoutes);
router.use("/api/logs", logsRoutes);
router.use("/api/pay", payment);
router.use("/api/gradesManagment", gradesManagmentRoutes);
router.use("/api/services", serviceRoutes);
router.use("/api/statistics", statisticsRoutes);
router.use("/api/ocr", OCR);


module.exports = router;
