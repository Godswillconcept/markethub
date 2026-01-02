const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { SuggestedProduct, Product, User, Vendor, VendorFollower, UserProductView, ProductImage, Category } = require('../models');

class SuggestionService {
  constructor() {
    this.SuggestedProduct = SuggestedProduct;
    this.Product = Product;
    this.User = User;
    this.Vendor = Vendor;
    this.VendorFollower = VendorFollower;
    this.UserProductView = UserProductView;
    this.ProductImage = ProductImage;
    this.Category = Category;
    this.sequelize = sequelize;
  }

  /**
   * Get suggested products for a user
   * @param {Object} params - Parameters
   * @param {number} params.userId - User ID (optional for public suggestions)
   * @param {number} params.limit - Number of suggestions to return
   * @param {Array} params.excludeProductIds - Product IDs to exclude from suggestions
   * @returns {Promise<Array>} Array of suggested products
   */
  async getSuggestions({ userId = null, limit = 10, excludeProductIds = [] } = {}) {
    try {
      const suggestions = [];
      const maxSuggestions = Math.min(limit, 20); // Cap at 20 suggestions
      const existingSuggestions = new Set();

      // Get suggestions from different algorithms
      const algorithms = [
        { type: 'followed_vendor', weight: 3, limit: Math.ceil(maxSuggestions * 0.4) },
        { type: 'recently_viewed', weight: 2, limit: Math.ceil(maxSuggestions * 0.3) },
        { type: 'popular', weight: 2, limit: Math.ceil(maxSuggestions * 0.2) },
        { type: 'random', weight: 1, limit: Math.ceil(maxSuggestions * 0.1) }
      ];

      for (const algorithm of algorithms) {
        if (suggestions.length >= maxSuggestions) break;

        const remainingSlots = maxSuggestions - suggestions.length;
        const algorithmLimit = Math.min(algorithm.limit, remainingSlots);

        const algorithmSuggestions = await this.getSuggestionsByAlgorithm({
          type: algorithm.type,
          userId,
          limit: algorithmLimit,
          excludeProductIds: [...excludeProductIds, ...Array.from(existingSuggestions)]
        });

        for (const suggestion of algorithmSuggestions) {
          if (suggestions.length >= maxSuggestions) break;
          
          // Avoid duplicates
          if (!existingSuggestions.has(suggestion.id)) {
            existingSuggestions.add(suggestion.id);
            suggestions.push({
              ...suggestion,
              suggestion_source: algorithm.type
            });
          }
        }
      }

      // If we don't have enough suggestions and user is authenticated, try random
      if (suggestions.length < maxSuggestions && userId) {
        const remainingSlots = maxSuggestions - suggestions.length;
        const randomSuggestions = await this.getSuggestionsByAlgorithm({
          type: 'random',
          userId,
          limit: remainingSlots,
          excludeProductIds: [...excludeProductIds, ...Array.from(existingSuggestions)]
        });

        for (const suggestion of randomSuggestions) {
          if (suggestions.length >= maxSuggestions) break;
          
          if (!existingSuggestions.has(suggestion.id)) {
            existingSuggestions.add(suggestion.id);
            suggestions.push({
              ...suggestion,
              suggestion_source: 'random'
            });
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Get suggestions based on followed vendors
   * @param {Object} params - Parameters
   * @param {number} params.userId - User ID
   * @param {number} params.limit - Limit of suggestions
   * @param {Array} params.excludeProductIds - Product IDs to exclude
   * @returns {Promise<Array>} Array of suggested products
   */
  async getFollowedVendorSuggestions({ userId, limit, excludeProductIds }) {
    try {
      if (!userId) return [];

      const followedVendors = await this.VendorFollower.findAll({
        where: { user_id: userId },
        attributes: ['vendor_id'],
        raw: true
      });

      if (followedVendors.length === 0) return [];

      const vendorIds = followedVendors.map(v => v.vendor_id);

      const products = await this.Product.findAll({
        where: {
          vendor_id: { [Op.in]: vendorIds },
          status: 'active',
          id: { [Op.notIn]: excludeProductIds }
        },
        attributes: [
          'id', 'vendor_id', 'category_id', 'name', 'slug', 'description',
          'thumbnail', 'price', 'discounted_price', 'sku', 'status',
          'impressions', 'sold_units', 'created_at', 'updated_at'
        ],
        include: [
          {
            model: this.Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: this.ProductImage,
            as: 'images',
            limit: 1,
            attributes: ['image_url', 'is_featured']
          }
        ],
        order: [['sold_units', 'DESC'], ['impressions', 'DESC']],
        limit: limit * 2 // Get extra to allow for scoring
      });

      // Score products based on vendor relationship and popularity
      const scoredProducts = products.map(product => {
        const score = this.calculateFollowedVendorScore(product);
        return { ...product.toJSON(), score };
      });

      // Sort by score and return top suggestions
      scoredProducts.sort((a, b) => b.score - a.score);
      return scoredProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting followed vendor suggestions:', error);
      throw error;
    }
  }

  /**
   * Get suggestions based on recently viewed products
   * @param {Object} params - Parameters
   * @param {number} params.userId - User ID
   * @param {number} params.limit - Limit of suggestions
   * @param {Array} params.excludeProductIds - Product IDs to exclude
   * @returns {Promise<Array>} Array of suggested products
   */
  async getRecentlyViewedSuggestions({ userId, limit, excludeProductIds }) {
    try {
      if (!userId) return [];

      const recentViews = await this.UserProductView.findAll({
        where: {
          user_id: userId,
          product_id: { [Op.notIn]: excludeProductIds }
        },
        include: [
          {
            model: this.Product,
            as: 'product',
            where: { status: 'active' },
            attributes: [
              'id', 'vendor_id', 'category_id', 'name', 'slug', 'description',
              'thumbnail', 'price', 'discounted_price', 'sku', 'status',
              'impressions', 'sold_units', 'created_at', 'updated_at'
            ],
            include: [
              {
                model: this.Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
              },
              {
                model: this.ProductImage,
                as: 'images',
                limit: 1,
                attributes: ['image_url', 'is_featured']
              }
            ]
          }
        ],
        order: [['viewed_at', 'DESC']],
        limit: limit * 2
      });

      // Score based on recency and frequency
      const scoredProducts = recentViews.map(view => {
        const score = this.calculateRecentlyViewedScore(view);
        return { ...view.Product.toJSON(), score, viewed_at: view.viewed_at };
      });

      scoredProducts.sort((a, b) => b.score - a.score);
      return scoredProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting recently viewed suggestions:', error);
      throw error;
    }
  }

  /**
   * Get popular products based on sales and views
   * @param {Object} params - Parameters
   * @param {number} params.limit - Limit of suggestions
   * @param {Array} params.excludeProductIds - Product IDs to exclude
   * @returns {Promise<Array>} Array of suggested products
   */
  async getPopularSuggestions({ limit, excludeProductIds }) {
    try {
      const products = await this.Product.findAll({
        where: {
          status: 'active',
          id: { [Op.notIn]: excludeProductIds }
        },
        attributes: [
          'id', 'vendor_id', 'category_id', 'name', 'slug', 'description',
          'thumbnail', 'price', 'discounted_price', 'sku', 'status',
          'impressions', 'sold_units', 'created_at', 'updated_at',
          [
            this.sequelize.literal(
              '(sold_units * 0.7 + impressions * 0.001)'
            ),
            'popularity_score'
          ]
        ],
        include: [
          {
            model: this.Category,
            attributes: ['id', 'name', 'slug']
          },
          {
            model: this.ProductImage,
            as: 'images',
            limit: 1,
            attributes: ['image_url', 'is_featured']
          }
        ],
        order: [[this.sequelize.literal('popularity_score'), 'DESC']],
        limit: limit * 2
      });

      // Add scores
      const scoredProducts = products.map(product => {
        const score = this.calculatePopularScore(product);
        return { ...product.toJSON(), score };
      });

      scoredProducts.sort((a, b) => b.score - a.score);
      return scoredProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting popular suggestions:', error);
      throw error;
    }
  }

  /**
   * Get random products
   * @param {Object} params - Parameters
   * @param {number} params.limit - Limit of suggestions
   * @param {Array} params.excludeProductIds - Product IDs to exclude
   * @returns {Promise<Array>} Array of suggested products
   */
  async getRandomSuggestions({ limit, excludeProductIds }) {
    try {
      const isPostgres = this.sequelize.options.dialect === 'postgres';
      const randomFunc = isPostgres ? 'RANDOM()' : 'RAND()';

      const products = await this.Product.findAll({
        where: {
          status: 'active',
          id: { [Op.notIn]: excludeProductIds }
        },
        attributes: [
          'id', 'vendor_id', 'category_id', 'name', 'slug', 'description',
          'thumbnail', 'price', 'discounted_price', 'sku', 'status',
          'impressions', 'sold_units', 'created_at', 'updated_at'
        ],
        include: [
          {
            model: this.Category,
            attributes: ['id', 'name', 'slug']
          },
          {
            model: this.ProductImage,
            as: 'images',
            limit: 1,
            attributes: ['image_url', 'is_featured']
          }
        ],
        order: this.sequelize.literal(randomFunc),
        limit: limit * 3 // Get more to ensure we have enough after filtering
      });

      // Add random scores
      const scoredProducts = products.map(product => {
        const score = this.calculateRandomScore(product);
        return { ...product.toJSON(), score };
      });

      scoredProducts.sort((a, b) => b.score - a.score);
      return scoredProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting random suggestions:', error);
      throw error;
    }
  }

  /**
   * Get suggestions by specific algorithm
   * @param {Object} params - Parameters
   * @param {string} params.type - Algorithm type
   * @param {number} params.userId - User ID
   * @param {number} params.limit - Limit of suggestions
   * @param {Array} params.excludeProductIds - Product IDs to exclude
   * @returns {Promise<Array>} Array of suggested products
   */
  async getSuggestionsByAlgorithm({ type, userId, limit, excludeProductIds }) {
    switch (type) {
      case 'followed_vendor':
        return this.getFollowedVendorSuggestions({ userId, limit, excludeProductIds });
      case 'recently_viewed':
        return this.getRecentlyViewedSuggestions({ userId, limit, excludeProductIds });
      case 'popular':
        return this.getPopularSuggestions({ limit, excludeProductIds });
      case 'random':
        return this.getRandomSuggestions({ limit, excludeProductIds });
      default:
        return [];
    }
  }

  /**
   * Calculate score for followed vendor suggestions
   * @param {Object} product - Product object
   * @returns {number} Score
   */
  calculateFollowedVendorScore(product) {
    const baseScore = 0.5;
    const salesScore = Math.min(product.sold_units * 0.01, 0.3);
    const impressionScore = Math.min(product.impressions * 0.0001, 0.2);
    return Math.min(baseScore + salesScore + impressionScore, 1.0);
  }

  /**
   * Calculate score for recently viewed suggestions
   * @param {Object} view - View object with Product
   * @returns {number} Score
   */
  calculateRecentlyViewedScore(view) {
    const baseScore = 0.6;
    const recencyHours = (Date.now() - new Date(view.viewed_at).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0.4 - (recencyHours * 0.01), 0.1);
    const frequencyScore = Math.min(view.Product.impressions * 0.0001, 0.2);
    return Math.min(baseScore + recencyScore + frequencyScore, 1.0);
  }

  /**
   * Calculate score for popular suggestions
   * @param {Object} product - Product object
   * @returns {number} Score
   */
  calculatePopularScore(product) {
    const baseScore = 0.4;
    const salesScore = Math.min(product.sold_units * 0.01, 0.4);
    const impressionScore = Math.min(product.impressions * 0.0001, 0.3);
    return Math.min(baseScore + salesScore + impressionScore, 1.0);
  }

  /**
   * Calculate score for random suggestions
   * @param {Object} product - Product object
   * @returns {number} Score
   */
  calculateRandomScore(product) {
    const baseScore = 0.3;
    const salesScore = Math.min(product.sold_units * 0.005, 0.3);
    const impressionScore = Math.min(product.impressions * 0.00005, 0.2);
    const randomBoost = Math.random() * 0.2;
    return Math.min(baseScore + salesScore + impressionScore + randomBoost, 1.0);
  }

  /**
   * Clear old suggestions for a user
   * @param {Object} params - Parameters
   * @param {number} params.userId - User ID
   * @param {number} daysToKeep - Days to keep suggestions
   * @returns {Promise<Object>} Deletion result
   */
  async clearOldSuggestions({ userId, daysToKeep = 7 }) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deletedCount = await this.SuggestedProduct.destroy({
        where: {
          user_id: userId,
          created_at: {
            [Op.lt]: cutoffDate
          }
        }
      });

      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error clearing old suggestions:', error);
      throw error;
    }
  }

  /**
   * Get suggestion statistics for a user
   * @param {Object} params - Parameters
   * @param {number} params.userId - User ID
   * @returns {Promise<Object>} Statistics
   */
  async getSuggestionStats({ userId }) {
    try {
      const stats = await this.SuggestedProduct.findAll({
        where: { user_id: userId },
        attributes: [
          'suggestion_type',
          [this.sequelize.fn('COUNT', this.sequelize.col('suggestion_type')), 'count']
        ],
        group: ['suggestion_type'],
        raw: true
      });

      return stats.reduce((acc, stat) => {
        acc[stat.suggestion_type] = parseInt(stat.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting suggestion stats:', error);
      throw error;
    }
  }
}

module.exports = new SuggestionService();