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

  // Optional field validations
  if (examData.place && examData.place.length > 200) {
    errors.push("Place description cannot exceed 200 characters");
  }

  return errors;
};

// Validate exam update data
const validateExamUpdate = (updateData) => {
  const errors = [];
  
  // Validate place length if provided
  if (updateData.place && updateData.place.length > 200) {
    errors.push("Place description cannot exceed 200 characters");
  }

  return errors;
};

module.exports = {
  validateExamData,
  validateExamUpdate
};
