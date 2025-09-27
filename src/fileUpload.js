// const multer = require("multer");
// const { v4: uuidv4 } = require("uuid");
// export const fileUpload = ({
//   allowedTypes = ["image"],
//   maxSize = 10 * 1024 * 1024,
//   destination = "/uploads",
// } = {}) =>  {
//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, destination),
//     filename: (req, file, cb ) => {
//       cb(null, uuidv4() + "-" + file.originalname);
//     },
//   }); 

//   const fileFilter = (req, file, cb) => {
//     const fileType = file.mimetype.split("/")[0];
//     if (allowedTypes.includes(fileType)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Only ${allowedTypes.join(", ")} files are allowed`), false);
//     }
//   };
//   const upload = multer({
//     storage,
//     limits: {
//       fileSize: maxSize,
//     },
//     fileFilter,
//   });
  
//   return upload;
// };

// export const uploadSingleFile = (fieldName) => fileUpload().single(fieldName);
// export const uploadMultipleFiles = (arrayOfFields) =>
//   fileUpload().fields(arrayOfFields);
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fileUpload = ({
  allowedTypes = ["image"],
  maxSize = 10 * 1024 * 1024,
  destination = "uploads", // بدون "/" عشان يتخزن جوه المشروع
} = {}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      cb(null, uuidv4() + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    const fileType = file.mimetype.split("/")[0];
    if (allowedTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(", ")} files are allowed`), false);
    }
  };

  const upload = multer({
    storage,
    limits: {
      fileSize: maxSize,
    },
    fileFilter,
  });

  return upload;
};

const uploadSingleFile = (fieldName) => fileUpload().single(fieldName);
const uploadMultipleFiles = (arrayOfFields) => fileUpload().fields(arrayOfFields);

module.exports = { fileUpload, uploadSingleFile, uploadMultipleFiles };