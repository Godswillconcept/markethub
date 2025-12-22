// models/suggested-product.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SuggestedProduct extends Model {
    static associate(models) {
      // SuggestedProduct belongs to User (optional for public suggestions)
      SuggestedProduct.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL'
      });

      // SuggestedProduct belongs to Product
      SuggestedProduct.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  }

  SuggestedProduct.init({
    id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    user_id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      allowNull: true,
      comment: 'ID of authenticated user (null for public suggestions)'
    },
    product_id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      allowNull: false,
      comment: 'ID of suggested product'
    },
    suggestion_type: {
      type: DataTypes.ENUM('followed_vendor', 'random', 'recently_viewed', 'popular'),
      allowNull: false,
      defaultValue: 'random',
      comment: 'Type of suggestion algorithm used'
    },
    score: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: 'Relevance score (0.0000 - 1.0000)'
    },
    context: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional context about the suggestion'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the suggestion was created'
    }
  }, {
    sequelize,
    modelName: 'SuggestedProduct',
    tableName: 'suggested_products',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['suggestion_type']
      },
      {
        fields: ['user_id', 'suggestion_type']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return SuggestedProduct;
};