/**
 * Test script for Exam CRUD operations
 * Run with: node src/modules/admin/examManagment/test-exam-crud.js
 */

const examService = require('./examService');
const { Exam, Course, User, Event } = require('../../../models');

// Test data
const testExamData = {
  courseId: null, // Will be set after creating test course
  supervisorId: null, // Will be set after creating test supervisor
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  place: 'Test Room A101',
  eventId: null // Will be set after creating test event
};

async function runTests() {
  console.log('🧪 Starting Exam CRUD Tests...\n');

  try {
    // Test 1: Create test entities
    console.log('1️⃣ Creating test entities...');
    
    const testCourse = await Course.create({
      courseName: 'Test Mathematics',
      courseDescription: 'Test course for CRUD operations'
    });
    testExamData.courseId = testCourse.courseId;
    console.log('✅ Test course created:', testCourse.courseId);

    const testSupervisor = await User.create({
      email: 'test-supervisor@example.com',
      passwordHash: 'hashed-password',
      role: 'ADMIN'
    });
    testExamData.supervisorId = testSupervisor.userId;
    console.log('✅ Test supervisor created:', testSupervisor.userId);

    const testEvent = await Event.create({
      eventName: 'Test Final Exam',
      eventDescription: 'Test event for CRUD operations'
    });
    testExamData.eventId = testEvent.eventId;
    console.log('✅ Test event created:', testEvent.eventId);

    // Test 2: Create Exam
    console.log('\n2️⃣ Testing CREATE operation...');
    const createdExam = await examService.createExam(testExamData);
    console.log('✅ Exam created successfully:', createdExam.examId);
    console.log('   - Course:', createdExam.course?.courseName);
    console.log('   - Supervisor:', createdExam.supervisor?.email);
    console.log('   - Event:', createdExam.event?.eventName);
    console.log('   - Date:', createdExam.date);
    console.log('   - Place:', createdExam.place);

    // Test 3: Read Exam by ID
    console.log('\n3️⃣ Testing READ by ID operation...');
    const retrievedExam = await examService.getExamById(createdExam.examId);
    console.log('✅ Exam retrieved successfully:', retrievedExam.examId);
    console.log('   - Place:', retrievedExam.place);

    // Test 4: Update Exam
    console.log('\n4️⃣ Testing UPDATE operation...');
    const updateData = {
      place: 'Updated Test Room B202',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    };
    const updatedExam = await examService.updateExam(createdExam.examId, updateData);
    console.log('✅ Exam updated successfully');
    console.log('   - New place:', updatedExam.place);
    console.log('   - New date:', updatedExam.date);

    // Test 5: Get All Exams
    console.log('\n5️⃣ Testing READ ALL operation...');
    const ApiFeature = require('../../../Util/ApiFeatures');
    const features = new ApiFeature({ page: 1, limit: 10 });
    const allExams = await examService.getAllExams(features);
    console.log('✅ All exams retrieved successfully');
    console.log('   - Total exams:', allExams.pagination.totalItems);
    console.log('   - Current page:', allExams.pagination.currentPage);

    // Test 6: Get Exams by Course
    console.log('\n6️⃣ Testing READ by Course operation...');
    const courseExams = await examService.getExamsByCourseId(testCourse.courseId, features);
    console.log('✅ Course exams retrieved successfully');
    console.log('   - Exams for course:', courseExams.pagination.totalItems);

    // Test 7: Get Exams by Supervisor
    console.log('\n7️⃣ Testing READ by Supervisor operation...');
    const supervisorExams = await examService.getExamsBySupervisorId(testSupervisor.userId, features);
    console.log('✅ Supervisor exams retrieved successfully');
    console.log('   - Exams for supervisor:', supervisorExams.pagination.totalItems);

    // Test 8: Get Upcoming Exams
    console.log('\n8️⃣ Testing READ Upcoming operation...');
    const upcomingExams = await examService.getUpcomingExams(features);
    console.log('✅ Upcoming exams retrieved successfully');
    console.log('   - Upcoming exams:', upcomingExams.pagination.totalItems);

    // Test 9: Delete Exam
    console.log('\n9️⃣ Testing DELETE operation...');
    const deleteResult = await examService.deleteExam(createdExam.examId);
    console.log('✅ Exam deleted successfully');
    console.log('   - Deleted count:', deleteResult.deletedCount);

    // Test 10: Verify deletion
    console.log('\n🔟 Testing DELETE verification...');
    try {
      await examService.getExamById(createdExam.examId);
      console.log('❌ Exam still exists after deletion!');
    } catch (error) {
      if (error.message === 'exam_not_found') {
        console.log('✅ Exam successfully deleted (not found as expected)');
      } else {
        throw error;
      }
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await testCourse.destroy();
    await testSupervisor.destroy();
    await testEvent.destroy();
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All CRUD tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().then(() => {
    console.log('\n✨ Test execution completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
