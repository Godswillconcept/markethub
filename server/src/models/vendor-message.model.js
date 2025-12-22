// models/vendor-message.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VendorMessage extends Model {
    static associate(models) {
      VendorMessage.belongsTo(models.User, {
        foreignKey: 'vendor_id',
        as: 'vendor'
      });
      VendorMessage.belongsTo(models.User, {
        foreignKey: 'admin_id',
        as: 'admin',
        allowNull: true
      });
    }
  }

  VendorMessage.init({
    id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    vendor_id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      allowNull: false
    },
    admin_id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      allowNull: true
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    topic: {
      type: DataTypes.ENUM(
        'Loan',
        'Product Support',
        'Technical Issue',
        'General Inquiry',
        'Other'
      ),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open'
    },
    reference_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'VendorMessage',
    tableName: 'vendor_messages',
    timestamps: true,
    underscored: true
  });

  VendorMessage.beforeCreate((instance) => {
    instance.created_at = new Date();
    instance.updated_at = new Date();
  });

  VendorMessage.beforeUpdate((instance) => {
    instance.updated_at = new Date();
  });

  return VendorMessage;
};