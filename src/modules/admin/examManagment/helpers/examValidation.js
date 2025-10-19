// Simple validation helpers for exam operations

// Validate exam data before creation
const validateExamData = (examData) => {
  const errors = [];

  // Required fields validation
  if (!examData.date) {
    errors.push("Date is required");
  }
  
  if (!examData.capacity) {
    errors.push("Capacity is required");
  }

  return errors;
};

const validateUpdateEvent = (updateData) => {
  if (
    updateData.startDate ||
    updateData.endDate ||
    updateData.capacity ||
    updateData.numberOfRegistered ||
    updateData.status ||
    updateData.type
  ) 
  {
      const eventUpdateData = {};
  
      if (updateData.startDate) eventUpdateData.startDate = updateData.startDate;
      if (updateData.endDate) eventUpdateData.endDate = updateData.endDate;
      if (updateData.capacity) eventUpdateData.capacity = updateData.capacity;
      if (updateData.numberOfRegistered !== undefined)
        eventUpdateData.numberOfRegistered = updateData.numberOfRegistered;
      if (updateData.status) eventUpdateData.status = updateData.status;
      if (updateData.type) eventUpdateData.type = updateData.type;

      return eventUpdateData;
    }
    return null;
  }
  
// // Validate exam update data
// const validateExamUpdate = (updateData) => {
//   const errors = [];
  
//   // Validate place length if provided
//   if (updateData.place && updateData.place.length > 200) {
//     errors.push("Place description cannot exceed 200 characters");
//   }

//   return errors;
// };

module.exports = {
  validateExamData,
  // validateExamUpdate,
  validateUpdateEvent,
};
