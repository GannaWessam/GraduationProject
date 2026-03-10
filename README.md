## Project Overview

**GraduationProject** is a **Certification Management Platform** backend for managing academic and professional certification programs. It supports:

- **Student onboarding and registration** with product-based enrollment.
- **Courses, trainings, exams, and events** (sessions, reservations, re-exams).
- **Payments and service purchases** (courses, packages, certificates, services).
- **Role-based administration** for Admins, Supervisors, Trainers, and Super Admins.
- **Notifications, logging, attendance tracking, and chat** between users.

The system is designed as the **central backend** for CAPU’s LMS (`https://lms4.capu.edu.eg`) and related web clients (e.g. Vite frontend on port 5173). It exposes a rich REST API and WebSocket interface used by frontends to manage the full certification lifecycle: registration, training, attendance, exam reservation, grade import, and certificate (Efada) issuance.

---

## Core Business Logic: Certification Management Platform

This section describes the **core concept of the system** as a certification management platform: certification types, enrollment options, training, attendance, communication, exams, grade import, certificate issuing, re-examination, and the full student journey. Implementation details and feature verification are included.

### 1. Certification Types

The system supports **three main certification tracks**, represented by the **student type** (`Student.type` and `UserType` in `src/UsersType.js`):

| Type Code | Track | Description |
|-----------|--------|-------------|
| **1** | Postgraduate Diploma | Prerequisite certificate for diploma-level programs. |
| **2** | Postgraduate Master's | Prerequisite certificate required for Master's programs. |
| **3** | Postgraduate PhD | Prerequisite certificate required for PhD programs. |
| **4** | Faculty Member | Certificate required for faculty members' promotion. |

- **How it works:** On registration, the student selects a **product** (certification program). Products can be restricted to specific user types via **ProductAllowedUserType** (userType `'1'`, `'2'`, `'3'`, `'4'`). The student’s `type` is stored on the `Student` record and is used throughout the system (e.g. which Efada template to use, which services/pricing apply).
- **Implementation:** `src/UsersType.js`, `src/models/ProductAllowedUserType.js`, `src/models/Student.js` (field `type`), and Efada service logic that branches on `student.type` (e.g. `index.html` vs `efada2.html` for certificate text).

### 2. Course and Training Options

Students enroll in certifications through **products** and **packages** that define which courses they must take and whether training and/or exam are included.

- **Product** (`Product` model): Represents a certification offering (e.g. “Prerequisite for Master’s”). It has:
  - **requirdCourses**: Number of courses the student must pass to complete the certification (used when uploading grades and determining success).
  - **examStatus** / **trainingStatus**: Booleans indicating whether this product allows exam and/or training.
  - **ProductCourse**: Links the product to courses; each link can be mandatory (`status === "true"`) or optional. The system enforces mandatory vs optional and **requiredTotal** (total number of courses to pass) when determining which events a student can book.

- **Package** (`Package` + `PackageCourse`): A named bundle of courses. Events can be linked to a **product** (product-based events) or to a **package** (package-based events). Package events are used for multi-course exam or training batches.

- **Learning paths** (as implemented in the codebase):
  - **Single / double / N courses:** A product is configured with one or more courses via `ProductCourse`. The student is assigned all product courses to `StudentCourse` at registration. Event eligibility is derived from product and package rules.
  - **Package of courses:** Events with `packageId` group multiple courses; reservation creates exam/training reservations for all exams or trainings in that package.
  - **Training + Exam:** Products with both `trainingStatus` and `examStatus` allow the student to reserve both training events and exam events. `StudentCourse` tracks `trainingStatus` and `examStatus` (e.g. `pending`, `done`) so the system knows when the student can book exam (after training is done or if not required).
  - **Exam only:** Products with `examStatus === true` and training not required allow students to reserve exam-only events when their course status allows it.
  - **Material + Exam** and **Exam only (if allowed)** are supported by the same event/reservation and product flags; the frontend can restrict which events are shown (e.g. “exam only” events) based on product and `StudentCourse` status.

- **Implementation:** `src/modules/user/reserveEvents/helpers/helper.js` (`getProductCourseRules`, `getStudentCourseStatus`, `filterEligibleEvents`), `src/models/Product.js`, `src/models/ProductCourse.js`, `src/models/Package.js`, `src/models/PackageCourse.js`, `src/models/StudentCourse.js`.

### 3. Training Management

Training is managed entirely through the platform.

- **Trainers:** Stored in the `Trainer` model and linked to `User`. Admins assign trainers to **trainings** via `Training.trainerId`. Trainers are managed under SuperAdmin/Admin modules (`src/modules/SuperAdmin/TrainerManagment/`).
- **Sessions:** Each **Training** has many **Sessions** (`Session` model). A session has:
  - **name**, **date**, **startTime**, **endTime**
  - **virtualLink**: Used for online sessions (e.g. Microsoft Teams link).
  - Sessions are created/updated by admins via `src/modules/admin/sessionManagement/` (session services and routes).
- **Course materials:** **SessionMaterial** is linked to each session. Admins upload files (e.g. PDF, DOCX, PPT) via session management; materials are stored under `uploads/sessions/`. Students can list and download session materials (including as a ZIP) through the session APIs.
- **Implementation:** `src/models/Session.js` (`virtualLink`), `src/models/SessionMaterial.js`, `src/modules/admin/sessionManagement/sessionServices.js` (create session, upload materials, download ZIP), `src/modules/admin/trainingManagement/trainingService.js` (create training, assign trainer).

### 4. Attendance System (QR Code)

Attendance is tracked via **QR codes generated by the platform**.

- **How QR codes are generated:** For a given **session**, the backend generates a short-lived JWT containing `sessionId`, `sessionName`, and `trainingId` (see `src/Util/SessionToken.js`). It then builds a URL: `{HOST}/Attendance?token={token}` and encodes it as a QR image (Data URL) using the `qrcode` library. The admin/trainer obtains this QR via the session API (e.g. `GET` session QR endpoint in `src/modules/admin/sessionManagement/sessionController.js` → `sessionService.QRservice(sessionId)`). Token expiry is set to a short window (e.g. 3 minutes) to limit reuse.
- **How students scan:** The student opens the frontend (e.g. on phone); the frontend URL can be the same `HOST/Attendance?token=...` when the student scans the QR. The frontend reads the `token` from the query string, decodes it (or calls a backend that verifies the token and returns `sessionId`), and then calls the attendance API with the current user and that session.
- **How attendance is recorded:** The backend exposes `POST /api/Attendance/:sessionId` (see `src/modules/attendance/attendanceRoute.js`). The student must be authenticated (`validateToken`). The controller uses `req.userData.id` as `userId` and `req.params.sessionId` as `sessionId`, and calls `attendanceService.createAttendance(userId, sessionId, req)`. The service creates one **attendance** record per (userId, sessionId) and rejects duplicates.
- **How trainers/admins view attendance:** They use `GET /api/Attendance` (paginated list), `GET /api/Attendance/:id` (one record), `GET /api/Attendance/Session-Attendance/:sessionId` (by session), or `GET /api/Attendance/Attendance/user` (by current user). Responses include student and session details.
- **Implementation:** `src/modules/admin/sessionManagement/sessionServices.js` (`QRservice`), `src/Util/SessionToken.js`, `src/modules/attendance/attendanceService.js`, `src/modules/attendance/attendanceController.js`, `src/modules/attendance/attendanceRoute.js`.

### 5. Communication System (Chat)

The platform includes an **internal chat system** between students, trainers, and administrators.

- **Group chats:** Conversations can be created as group conversations (`POST /api/chat/conversations/group`). When an event reaches capacity and is closed, the system can automatically create a **group conversation** for that event (`handleCreateGroupChatForEvent` in reservation helper), linking the conversation to the event so participants can discuss in one place.
- **One-to-one messaging:** Direct conversations are created via `POST /api/chat/conversations/direct`. Messages are sent with `POST /api/chat/messages` or `POST /api/chat/voice` (voice notes).
- **Message status:** The **Message** model has a `status` field: `'sent'`, `'delivered'`, `'seen'`. It also has `seenBy` (array of user IDs) for multi-recipient visibility. The API includes `PUT /api/chat/messages/seen` to mark messages as seen.
- **Online status:** The WebSocket server (`src/Services/WebSocket.js`) maintains an `onlineUsers` set. When a client sends `{ type: "register", userId }`, the user is marked online; on disconnect they are removed. The server notifies users who share conversations with the connecting user so the frontend can show “online”/“offline”.
- **Voice notes:** Messages support `type: 'voice'` (and `duration`). Voice is uploaded via `uploadVoiceMessage` middleware and `POST /api/chat/voice`.
- **Role integration:** Any user (student, trainer, admin) with a `User` account can participate in conversations; chat is role-agnostic and fits into the training workflow by linking group chats to events and allowing direct chats between any two users.
- **Implementation:** `src/modules/Chat/chatRoutes.js`, `src/modules/Chat/chatController.js`, `src/models/Message.js` (status, type, seenBy), `src/Services/WebSocket.js`, `src/modules/user/reserveEvents/helpers/helper.js` (`handleCreateGroupChatForEvent`).

### 6. Exam Reservation System

- **How students book exam sessions:** Students see **available events** for their product (and language) via `GET /api/reservations/events`. Events are filtered by product, open status, reservation window (`startDateRes` / `endDateRes`), and eligibility (mandatory/optional courses, required total, and whether the student has completed training and is allowed to take the exam). The student then submits `POST /api/reservations/register-exam` with the chosen `eventId`. The backend creates a **Reservation** and one **ExamReservation** per exam in that event (for product or package), increments event capacity, updates `StudentCourse` (e.g. examStatus), and can create a group chat when the event becomes full.
- **Exam tickets / QR codes:** The repository does **not** implement a separate “exam ticket” document or exam-specific QR. Each **student** has a **profile QR** (`profilePhoto` on `Student`): a QR image encoding the student’s name and national ID, generated at registration (`src/modules/Auth/helpers/userHelper.js` → `generateQr`). In real life, the student can present this profile QR (e.g. on the LMS app) at the exam venue for identity verification; the actual exam attendance and grading are tied to `ExamReservation` and the grade upload flow.
- **Exam attendance in real life:** Students attend the physical exam; their identity can be verified using the profile QR. Exam results are not entered in the exam hall—they are imported later via the Excel grade upload (see below).

- **Implementation:** `src/modules/user/reserveEvents/reservationService.js` (`registerForExam`), `src/modules/user/reserveEvents/reservationRoutes.js`, `src/modules/user/reserveEvents/helpers/helper.js` (event eligibility), `src/modules/Auth/helpers/userHelper.js` (profile QR).

### 7. Exam Process Integration (External Grades → Platform)

Exams are conducted **physically**; grades are produced by an **external system** and brought into this platform as follows.

1. **External system exports grades** into an Excel file (e.g. `.xlsx`) with a structure the platform expects: e.g. national ID column and one column per course (column header = course **title** as stored in the database).
2. **Staff uploads the file:** An authorized user (with `UPLOAD_RESULTS` permission) calls `POST /api/grades/upload/:eventId` with the Excel file in the request body (e.g. `multipart/form-data`, field `file`). The route is in `src/modules/user/handleGrades/gradesRoutes.js`; the controller is in `gradesController.js`.
3. **Platform processes the file:** The controller reads the buffer and calls `parseGradesFromExcelBuffer` (`gradesParsingService.js`), which loads course titles from the DB, maps header columns to course titles, and parses each row (national ID + grades). Output is a list of `{ nationalId, uploadDate, quizzes: [ { courseTitle, grade } ] }`.
4. **Validation and DB insertion:** The controller then calls `uploadFromExcel(parsedData, eventId)` (`gradesUploadService.js`). For each student (by national ID) and each course (by course title → exam in that event), the service:
   - Computes reservation status: grade ≥ 65 → `succeeded`, &lt; 65 → `failed`, null and exam date before upload → `absent`, else `reserved`.
   - Updates or creates **ExamReservation** (and can archive old reservations). It uses **Product.requirdCourses** (or default 7) to determine how many exams must be passed for the event.
5. **Results visible:** Updated `examReservation` and related data are stored in PostgreSQL. Students and admins see results through the grades/reservation and Efada-related APIs (e.g. grade views, certificate eligibility).

- **Implementation:** `src/modules/user/handleGrades/gradesController.js`, `src/modules/user/handleGrades/gradesParsingService.js`, `src/modules/user/handleGrades/gradesUploadService.js`, `src/modules/user/handleGrades/gradesRoutes.js`.

### 8. Certification Issuing (Efada / PDF Certificate)

After a student has completed the required courses/training and passed the exam, the system can issue a **PDF certificate** (Efada).

- **Eligibility and request:** The student (or admin on their behalf) can request an Efada. The backend creates a **Payment** for the appropriate service (“Statement request | طلب افادة دراسات عليا” for types 1–3, “Statement request | طلب افادة اعضاء هيئة تدريس” for type 4) and an **Efada** record linked to that payment. Eligibility (e.g. “all required exams passed”) may be enforced by business policy or admin verification; the code focuses on service selection by student type and payment creation.
- **Certificate generation:** An admin (with `GENERATE_STATEMENTS` permission) calls the generate endpoint with parameters such as `nationalId`, `date`, and `picturePath` (signature/image). `EfadaService.createEfadaPDF` loads the student by national ID, selects an HTML template by student type (`index.html` for type 1, `efada2.html` for types 2, 3, 4), injects student name, national ID, date, college, and system data (signatory titles/names), renders the HTML with Puppeteer, and returns a PDF buffer.
- **How students access certificates:** The generated PDF is returned by the API (e.g. as a download). The frontend can offer it as a download to the student or admin. Stored Efada records are listed via `GET /api/admin/efada` (with permission `VIEW_STATEMENTS`); students may have a dedicated endpoint or view that lists their own certificates and allows download.

- **Implementation:** `src/modules/admin/EfadaManagement/EfadaService.js`, `src/modules/admin/EfadaManagement/EfadaController.js`, `src/modules/admin/EfadaManagement/EfadaRoute.js`, `src/modules/admin/EfadaManagement/index.html` and `efada2.html`, `src/models/Efada.js`.

### 9. Re-Examination

If a student **fails** an exam (grade &lt; 65), they can request a **re-exam**.

- **Re-exam rules:** A **ReexamRequest** is created per exam attempt, linked to the student, the **exam**, and a **Payment** for the “Re Exam | اعادة امتحان” service. System-wide re-exam attempt limits are stored in **SystemData** (`numberOfAttemptsAvailableToReexam`, default 3); the application may enforce this limit in business logic or admin workflows (the model exists; enforcement in code may be in admin or payment flow).
- **Booking another exam:** After paying for the re-exam service, the student can reserve a new exam event via the same reservation flow (`POST /api/reservations/register-exam`). Eligibility helpers (e.g. `checkStudentEligibility`) consider past failed attempts so that only students with a failure (or who are allowed to re-sit) can see or book re-exam events where applicable.
- **Tracking attempts:** **ExamReservation** and **ExamReservationArchive** store `reservationStatus` (e.g. `failed`, `succeeded`) and `result`. **StudentCourse** tracks `attempts`. **ReexamRequest** records each paid re-exam request (userId, examId, paymentId). Together, these allow the system to know how many times a student has attempted or paid for re-exams.

- **Implementation:** `src/modules/admin/examManagment/examService.js` (`ReexamService`), `src/modules/admin/examManagment/examController.js` (`ReexamController`), `src/modules/admin/examManagment/examRoutes.js` (`/Reexam/:courseId`), `src/models/ReexamRequest.js`, `src/models/SystemData.js`, `src/modules/user/reserveEvents/helpers/checkStudentEligibility.js`, `src/modules/payment/paymentService.js` (reexam payment handling).

### 10. Full System Flow (Student Journey)

End-to-end flow:

1. **Registration** — Student registers via `POST /api/register` with personal data, national ID image, and **ProductId** (and optionally type). Backend creates User, Student, assigns courses from ProductCourse to StudentCourse, creates registration payment/request, and generates profile QR (name + national ID).
2. **Course/package selection** — Effectively done at registration (product choice). Optional: admin can assign additional courses or packages; student sees assigned courses and product rules (mandatory/optional, required total).
3. **Training** — Admin creates events (type: training) and trainings with sessions; assigns trainers and sets session `virtualLink` (e.g. Teams). Student reserves training via `POST /api/reservations/register-training`. Student attends sessions (joins via virtualLink); trainer shows session QR for attendance.
4. **Attendance** — Trainer/admin gets session QR from API; students scan QR, open frontend with token, frontend calls `POST /api/Attendance/:sessionId`; attendance is stored. Trainers/admins view attendance via session or user attendance APIs.
5. **Exam booking** — Student calls `GET /api/reservations/events` and `POST /api/reservations/register-exam` with chosen eventId. Backend creates reservation and exam reservations. Student may use profile QR at exam venue for identity.
6. **Physical exam** — Exam is held on-site; external system records grades and exports Excel.
7. **Grade upload** — Staff uploads Excel via `POST /api/grades/upload/:eventId`. Platform parses file, matches by national ID and course title, updates exam reservations (succeeded/failed/absent), and makes results visible.
8. **Certificate generation** — Once results are in and (per policy) eligibility is met, student requests Efada (payment + Efada record). Admin generates PDF via generate endpoint; student or admin downloads the certificate.

If the student **fails**, they request a re-exam (payment + ReexamRequest), then book another exam event and repeat from step 5.

### 11. Feature Verification

| Feature | Status | Location / Notes |
|--------|--------|-------------------|
| **Certification types** | Implemented | `UserType` (1–4), `Student.type`, `ProductAllowedUserType`, Efada template selection by type. |
| **Course/package enrollment** | Implemented | Products, ProductCourse, Package, PackageCourse, StudentCourse, event eligibility in `helper.js`. |
| **Training management** | Implemented | Training, Session (with virtualLink), Trainer, SessionMaterial, session CRUD and material upload/download. |
| **QR attendance** | Implemented | Session token → QR URL, `POST /api/Attendance/:sessionId`, attendance model and list/by-session/by-user. |
| **Chat system** | Implemented | Conversations (group/direct), messages (text/voice), status (sent/delivered/seen), seenBy, WebSocket online status, voice upload. |
| **Exam reservation** | Implemented | `register-exam`, event eligibility, capacity, ExamReservation, group chat on full event. |
| **Excel grade import** | Implemented | `POST /api/grades/upload/:eventId`, parsing by course title and national ID, status computation, DB update. |
| **Certificate generation** | Implemented | Efada request + payment, Puppeteer PDF from HTML templates, system data for signatures. |
| **Re-examination** | Implemented | ReexamRequest, payment for re-exam service, reservation flow for next exam; attempt limits in SystemData. |
| **Exam ticket / exam QR** | Partial | No dedicated exam ticket or exam-specific QR; student **profile QR** (name + national ID) is used for identity at exam. |

**Gaps or clarifications:**

- **Certification types** are encoded as student type and product allowed types; there is no separate “certification type” entity—the business meaning (Master’s prerequisite, PhD prerequisite, faculty promotion) is implied by product naming and student type.
- **Re-exam route** uses `courseId` in the URL (`/Reexam/:courseId`); the service creates a Reexam with `examId`. If the controller passes `courseId`, the service must resolve it to an `examId` elsewhere (e.g. in a wrapper or different code path); otherwise the route parameter may be intended as `examId`.
- **Attendance with QR:** The backend provides the QR (URL with token) and the `POST /api/Attendance/:sessionId` endpoint; the **frontend** must implement the page at `HOST/Attendance?token=...` that reads the token, extracts sessionId (client-side decode or backend verify), and calls the API with the logged-in user. So “how students scan” is a frontend responsibility.
- **Efada eligibility:** The code does not automatically block Efada request when required exams are not passed; such rules can be added in the Efada service or enforced by admin process.

---

## Main Features

- **Authentication & Authorization**
  - User registration with national ID, OCR flag, and product selection.
  - Login with JWT-based tokens and roles (STUDENT, ADMIN, SUPERVISOR, TRAINER, SUPERADMIN).
  - Password reset, OTP verification, and email verification.
  - Fine-grained **permissions & profiles** (permissions, containers, user profiles).

- **User & Student Management**
  - Students linked to users with rich profile data (university, college, department, nationality, status, etc.).
  - Role-specific user entities (Admin, Supervisor, Trainer, SuperAdmin).
  - Profile and permission containers for grouping permissions.

- **Academic Structure Management**
  - Universities, colleges, departments, and university-college relationships.
  - Courses with multi-currency pricing and linkage to products and packages.
  - Packages and products that group courses and events.

- **Events, Trainings, Exams**
  - Events modeled as academic occasions that can contain trainings and exams.
  - Training management (training sessions, trainers, schedules, reservations).
  - Exam management (exam definitions, reservations, archives, re-exam requests).
  - Background jobs to auto-finish exams and trainings based on schedule.

- **Reservations & Attendance**
  - Exam and training reservations tied to events, students, and products.
  - Attendance tracking per session and per student.

- **Grades & Certificates**
  - Grade management (grades by course, archives).
  - File upload and parsing for bulk grades (Excel-based parsing and upload).
  - Efada (certificate) management with PDF generation and QR integration.

- **Payment & Services**
  - Payment handling for products, packages, services, and re-exam/efada fees.
  - Service management (general services with pricing and currencies).
  - Webhook model for external payment gateways.

- **Notifications & Logging**
  - Push notifications (web push + Redis based infrastructure).
  - Internal notification entities and service.
  - Centralized **audit logging** of write operations into MongoDB.

- **Chat & Real-Time Communication**
  - WebSocket server for real-time chat (`src/Services/WebSocket.js`).
  - Conversations, messages, and conversation-user relations.
  - Online/offline presence updates and syncing of offline messages.

- **Reports & Excel Export**
  - Reporting routes for analytics/exports.
  - Excel generation for student data exports.

---

## System Architecture

At a high level, the architecture is:

- **Node.js / Express HTTP API**
  - Entry point `app.js` configures Express, middleware, CORS, routes, and error handling.
  - API routes under `/api/**` organized by domain (Auth, Products, Courses, Admin, SuperAdmin, etc.).

- **PostgreSQL (Primary Data Store)**
  - Accessed via **Sequelize** (`src/connections/db.js`, `src/models/**`, `src/models/index.js`).
  - Holds all transactional data: users, students, courses, products, events, exams, reservations, permissions, payments, etc.

- **MongoDB (Logging Store)**
  - Accessed via **Mongoose** (`src/connections/mongo.js`).
  - Stores structured logs generated by the `logger` utility and `auditContext` middleware.

- **Background Services**
  - `src/background/index.js` loads and runs background job modules (e.g. `finishStudentExam.js`, `finishStudentTraining.js`).
  - Jobs handle scheduled or asynchronous business logic (finishing trainings/exams, archiving, etc.).

- **Real-Time Services**
  - WebSocket server (`src/Services/WebSocket.js`) on port 2000.
  - Handles chat, online status, and targeted real-time notifications.

- **Supporting Utilities**
  - Logging and audit (`src/Util/logger.js`, `src/middlewares/auditContext.js`).
  - Pagination and API features (`src/Util/ApiFeatures.js`, `src/Util/MongoApiFeature.js`, `src/Util/PaginatedResponse.js`).
  - File upload, Excel generation, PDF generation, QR generation, etc.

The external frontend (not in this repo) talks exclusively to this backend through HTTP (`/api/**`) and WebSocket (ws://host:2000).

---

## Technologies Used

- **Runtime & Framework**
  - Node.js
  - Express 5

- **Databases**
  - PostgreSQL (via Sequelize ORM)
  - MongoDB (via Mongoose) for application logs
  - redis


- **Realtime & Messaging**
  - `ws` for WebSocket server
  - `web-push` for push notifications
  - `redis` (used as a cache / message broker in supporting services)

- **Security & Auth**
  - `jsonwebtoken` for JWT tokens
  - `bcrypt` for password hashing
  - `express-rate-limit` for basic rate limiting
  - Role & permission system via Sequelize models

- **File Handling & Documents**
  - `multer` for file uploads
  - `exceljs` for Excel parsing/generation
  - `pdfkit` for PDF generation (e.g. Efada certificates)
  - `qrcode` for generating QR images

- **HTTP / External Services**
  - `axios` and `form-data` for external HTTP calls

- **Background & Scheduling**
  - `node-cron` for scheduled background tasks
  - `fs-extra` and `archiver` for file system operations/archiving

- **Other**
  - `dotenv` for environment variables
  - `uuid` for IDs
  - `arabic-date`, `arabic-reshaper`, `arabic-persian-reshaper`, `bidi-js` for RTL and Arabic formatting.

---

## Project Structure

- **`app.js`**
  - Main Express server bootstrap.
  - Connects Mongo (`connectMongo`), syncs DB, loads background services, sets up WebSocket service, CORS, rate limiting, JSON parsing, static uploads, audit middleware, routes, login endpoint, and global error handler.

- **`src/`**
  - **`routes.js`**: Aggregates and mounts all module router files under `/api/...`.
  - **`models/`**: Sequelize models and associations, with `index.js` as central registry.
  - **`connections/`**: DB connection files for PostgreSQL and Mongo (`db.js`, `mongo.js`, `syncDB.js`).
  - **`modules/`**: Business modules grouped by domain:
    - `Auth/`, `Product/`, `Courses/`, `Grades/`, `ServiceManagement/`
    - `university/`, `college/`, `Department/`, `nationality/`, `university-college/`
    - `admin/` (events, exams, trainings, packages, currencies, sessions, Efada, system data, users)
    - `SuperAdmin/` (Admin, Supervisor, Trainer, SuperAdmin management)
    - `user/` (reservations, grades upload/parsing)
    - `payment/`, `Notifications/`, `Attendance/`, `Profile/`, `Permission/`, `PermissionContainer/`, `Log/`, `Chat/`, `Report/`
  - **`middlewares/`**: `token`, `auditContext`, `errorHandler`, `catchError`, `checkPermission`, upload helpers.
  - **`background/`**: Background job bootstrap and individual services (`finishStudentExam`, `finishStudentTraining`, etc.).
  - **`Services/`**: `WebSocket.js` for chat and presence, `pushService.js` for push notifications.
  - **`Util/`**: Helpers for logging, pagination, and query features.

- **`seeder/`**
  - Database seed scripts (students, events, reservations).

- **`uploads/`**
  - Runtime directory for uploaded files (grades, images, etc.).

- **`package.json`**
  - Dependencies, scripts, and project metadata.

---

## Application Flow

### Startup Flow

1. `npm start` runs `nodemon app.js`.
2. `app.js`:
   - Loads environment variables.
   - Connects to PostgreSQL and MongoDB.
   - Initializes WebSocket server (`src/Services/WebSocket.js`).
   - Loads and starts background services (`src/background/index.js`).
   - Configures CORS, rate limiting, JSON body parsing, and static `/uploads`.
   - Applies `auditContext` for logging non-GET requests.
   - Mounts all API routes via `src/routes.js`.
   - Adds `/login` and `/dashboard` for token demo and role test.
   - Registers global error handler.

### Typical Request Flow

1. HTTP request → Express server.
2. Global middleware: CORS → rate limiting → JSON parser → `auditContext`.
3. Route matching under `/api/...`:
   - Domain router (e.g. `CourseRoute`) selects controller method.
   - Token + permission middlewares (e.g. `validateToken`, `checkPermission`) run.
4. Controller calls a service (e.g. `CourseService`) which:
   - Executes business logic.
   - Interacts with Sequelize models inside optional transactions.
   - Populates `req.audit` with `affectedUser/Thing` and message.
5. Controller sends response.
6. `auditContext`’s `res.on("finish")` listener:
   - For non-GET, non-chat URLs, writes a log document to Mongo via `logger.log`.

### Real-Time & Background

- **WebSocket**
  - Clients connect to `ws://<host>:2000` and send `{ "type": "register", "userId": <id> }`.
  - Server tracks `onlineUsers`, syncs offline messages, and notifies peers with common conversations on online/offline.

- **Background Services**
  - Auto-loaded from `src/background` and started on boot.
  - Used for scheduled operations such as finalizing trainings, exams, and archiving reservations.

---

## Key Modules

- **Auth (`src/modules/Auth`)**
  - Handles registration, login, password reset, OTP flows, email verification, and user info retrieval.
  - Integrates users with students, products, payments, and permissions.

- **Courses (`src/modules/Courses`)**
  - CRUD operations for courses with pricing/currency.
  - Linking courses to products (`ProductCourse`) and students (`StudentCourse`).

- **Admin (`src/modules/admin`)**
  - Comprehensive admin management: events, trainings, exams, packages, currencies, sessions, system data, Efada, Excel exports, and users.

- **SuperAdmin (`src/modules/SuperAdmin`)**
  - Manages Admins, Supervisors, Trainers, and SuperAdmins, providing higher-level governance.

- **User & Reservations (`src/modules/user`)**
  - Student-facing reservations (event/exam/training) and grade upload/parsing workflows.

- **Payment (`src/modules/payment`)**
  - Payment creation and webhooks for products, packages, services, re-exam, and certificates.

- **Notifications (`src/modules/Notifications`)**
  - Notification management integrated with push and real-time infrastructure.

- **Permissions & Profiles (`src/modules/Permission*`, `Profile`)**
  - Fine-grained permission system and grouping through profiles and containers.

- **Chat (`src/modules/Chat`, `src/Services/WebSocket.js`)**
  - REST APIs plus WebSocket-based real-time messaging and presence.

- **Logging & Audit (`src/modules/Log`, `src/middlewares/auditContext`, `src/Util/logger.js`)**
  - Centralized audit trail of all write operations stored in MongoDB.

---

## API / Backend Flow

The backend follows a **Routes → Controllers → Services → Models** pattern:

- **Routes (`*Route.js`)**
  - Define endpoints, attach middlewares (`validateToken`, `checkPermission`, `catchError`), and forward to controllers.

- **Controllers (`*Controller.js`)**
  - Translate HTTP requests into service calls, map service results to HTTP responses, delegate error handling to `errorHandler`.

- **Services (`*Service.js`)**
  - Implement business logic, orchestrate multiple models, and set audit context (`req.audit`) for logging.

- **Models (`src/models/**`)**
  - Sequelize models and relations reflecting the academic, payment, permission, and chat domains.

---

## Database Design

### PostgreSQL (Transactional Data)

Key entities (non-exhaustive):

- **User**: Core account (email, passwordHash, role, tokenVersion).
- **Student**: Academic persona of a user (nationalId, fullName, university, college, department, productId, status).
- **Admin**, **Supervisor**, **Trainer**, **SuperAdmin**: Role-specific tables linked 1:1 with `User`.
- **Product** and **Package**: Commercial units grouping courses and events, with pricing (Egyptian/Other).
- **Course**: Course definition with prices and currency.
- **Event**, **Training**, **Exam**: Academic sessions linked to courses and events (and to trainers/supervisors).
- **Reservation**, **TrainingReservation**, **ExamReservation**, **ExamReservationArchive**: Reservation lifecycle for events, trainings, and exams.
- **StudentCourse**: Link between students and courses with exam/training statuses.
- **Payment**, **Service**, **Currency**, **Webhook**: Payment and financial abstractions.
- **Efada**, **ReexamRequest**, **RegisterRequest**: Certificates, re-exam, and registration payment flows.
- **University**, **College**, **Department**, **university_college**, **Nationality**: Academic structure and geo/classification data.
- **Notification**: User notifications.
- **Conversation**, **Message**, **ConversationUser**: Chat domain.
- **Session**, **SessionMaterial**, **attendance**: Training sessions with materials and attendance tracking.
- **Permission**, **UserPermission**, **Profile**, **ProfilePermission**, **Container**: Permissions, permission groups, and profiles.
- **SystemData**: Global system settings and configuration.

All associations are defined in `src/models/index.js` and should be treated as the canonical ERD.

### MongoDB (Logging)

- **Log** collection:
  - `ip`, `user`, `type` (read/modification/edit/delete), `level` (success/error), `affectedUser`, `affectedThing`, `message`, `meta`, `userAgent`.
  - Populated by `auditContext` → `logger.log`.

---

## Setup and Installation

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- MongoDB
- (Optional) Redis and mail server for notifications and email flows.

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd GraduationProject
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory (see **Environment Variables** section).

### 4. Setup PostgreSQL

- Create a database (default `appdb`).
- Ensure `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT` are set in `.env`.

### 5. Setup MongoDB

- Ensure MongoDB is running.
- Set `MONGO_URI` in `.env` (defaults to `mongodb://127.0.0.1:27017/app_logs`).

### 6. Seed the database (optional, for dev/demo)

```bash
npm run seed
npm run seed:students
npm run seed:events
```

### 7. Start the server

```bash
npm start
```

- HTTP API: `http://localhost:3000`
- WebSocket: `ws://localhost:2000`

---

## Environment Variables

Example `.env`:

```env
# PostgreSQL
DB_NAME=appdb
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432

# MongoDB for logging
MONGO_URI=mongodb://127.0.0.1:27017/app_logs

# JWT (names inferred)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email / SMTP (for OTP and email-based flows)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Redis (if used by notification services)
REDIS_URL=redis://localhost:6379

# Web push (if enabled)
PUSH_PUBLIC_KEY=your-vapid-public-key
PUSH_PRIVATE_KEY=your-vapid-private-key
PUSH_SUBJECT=mailto:you@example.com

# Certification / attendance (QR and session token)
HOST=https://lms4.capu.edu.eg
SESSION_SECRET=your-session-jwt-secret
```

> Check the payment, notification, and mailer modules for any additional environment variables required in your deployment. `HOST` is used to build the attendance QR URL; `SESSION_SECRET` is used to sign the short-lived session token embedded in that URL.

---

## Example Usage

### Student Registration

1. Client collects registration data and `nationalIdImage`.
2. Sends `POST /api/register` (multipart/form-data) with:
   - Fields: `email`, `password`, `confirmPassword`, `name_ar`, `name_En`, `national_id`, `university`, `faculty`, `department`, `nationality`, `ProductId`, `OCR`, etc.
   - File: `nationalIdImage`.
3. Backend creates:
   - `User` and `Student`
   - Course assignments via `ProductCourse` → `StudentCourse`
   - Registration/payment records
   - Audit log entry for successful registration.

### Login and Accessing Courses

1. `POST /api/login` with `email`, `password`, `rememberMe`.
2. Backend verifies password, resolves role entity, generates JWT and permissions.
3. Client calls `GET /api/courses` with `Authorization: Bearer <token>` to retrieve course list.

### Admin Creating a Course

1. Admin logs in and obtains a JWT with `ADD_COURSE` permission.
2. `POST /api/courses`:
   ```json
   {
     "name": "Course Name",
     "title": "Full Course Title",
     "priceEgyptian": 1000,
     "priceOther": 2000,
     "currencyId": 1
   }
   ```
3. Backend creates the course, links it to all products through `ProductCourse`, and logs the action.

### Real-Time Chat

1. Client opens WebSocket connection to `ws://localhost:2000`.
2. Sends:
   ```json
   { "type": "register", "userId": 123 }
   ```
3. Server marks user as online, syncs missed messages, and notifies conversation participants of status changes.

---

## Future Improvements

- **Automated Testing**
  - Add unit and integration tests for services, controllers, and routes (e.g. Jest/Mocha).

- **Configuration Management**
  - Centralize environment-specific config and secrets using a secure vault or configuration service.

- **API Documentation**
  - Add OpenAPI/Swagger documentation for all `/api/**` endpoints with example requests/responses.

- **Observability**
  - Enhance logging with correlation IDs, structured logs, and integration with log aggregators.
  - Add metrics and health endpoints for monitoring.

- **Scalability**
  - Optionally split chat, payments, and notifications into separate services for large-scale deployments.

- **Developer Experience**
  - Provide a frontend SDK/client library that wraps authentication, API calls, and WebSocket handling.

---

## Conclusion

This project is a **full-featured academic management backend** built with Node.js, Express, PostgreSQL, and MongoDB. It models users, students, courses, products, events, trainings, exams, payments, grades, certificates, permissions, notifications, and chat, exposing them through a modular REST API and WebSocket interface. With proper configuration and a compatible frontend, it can serve as the backbone of a production-grade LMS for universities and training institutions.

