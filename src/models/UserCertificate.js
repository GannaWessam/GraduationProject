const { DataTypes, UUIDV4 } = require('sequelize');
require('dotenv').config();

module.exports = (sequelize) => {
  const UserCertificate = sequelize.define('UserCertificate', {
    certificateId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'userId'
      }
    },
    fileName: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    certificatePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('certificatePath');
        return rawValue ? `${process.env.HOST_BACK}/${rawValue}` : null;
      }
    },
    uploadBatch: {
      type: DataTypes.STRING(200),
      allowNull: true,
    }
  }, {
    tableName: 'user_certificates',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'fileName'],
        name: 'unique_user_certificate'
      },
      {
        fields: ['userId']
      },
      {
        fields: ['uploadBatch']
      }
    ]
  });

  return UserCertificate;
};
