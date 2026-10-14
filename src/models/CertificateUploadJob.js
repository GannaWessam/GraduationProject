const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const CertificateUploadJob = sequelize.define('CertificateUploadJob', {
    jobId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
      allowNull: false
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userId'
      },
    },
    fileName: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('uploading', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'uploading'
    },
    totalFiles: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    processedFiles: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    matchedCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    notMatchedCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    notMatchedList: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    currentFile: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'certificate_upload_jobs',
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    indexes: [
      {
        fields: ['uploadedBy']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return CertificateUploadJob;
};
