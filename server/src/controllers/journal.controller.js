const { Journal, Sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
// Helper function to check existing tags using database-level query
const checkExistingTags = async (tags) => {
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (error) {
      // If parsing fails, treat it as a single tag
      tags = [tags];
    }
  }
  if (!tags || tags.length === 0) return { existing: [], new: tags };
  try {
    if (!Array.isArray(tags)) {
      throw new Error('Tags must be an array');
    }
    const inputTags = tags.map(tag => tag.toLowerCase());
    // Use database-level query to check which tags exist
    const placeholders = inputTags.map(() => '?').join(',');
    const [results] = await Journal.sequelize.query(`
      SELECT DISTINCT
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']')))) as tag
      FROM journals
      CROSS JOIN (
        SELECT 1 as seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
        UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
        UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      ) as seq
      WHERE JSON_LENGTH(tags) >= seq.seq
        AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']')))) IN (${placeholders})
    `, {
      replacements: inputTags
    });
    const existingTagNames = results.map(r => r.tag);
    const newTagNames = inputTags.filter(tag => !existingTagNames.includes(tag));
    return {
      existing: existingTagNames,
      new: newTagNames
    };
  } catch (error) {
    console.error('Error checking existing tags:', error);
    return { existing: [], new: Array.isArray(tags) ? tags : [] };
  }
};
// Get all journals with optional filtering
const getAllJournals = async (req, res) => {
  try {
    const { category, tags, sort_by = 'created_at', order = 'DESC', page = 1, limit = 10 } = req.query;
    const whereClause = {};
    // Filter by category
    if (category) {
      whereClause.category = category;
    }
    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      whereClause[Op.and] = tagArray.map(tag =>
        Sequelize.where(
          Sequelize.fn('JSON_SEARCH', Sequelize.col('tags'), 'one', tag),
          'IS NOT',
          null
        )
      );
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const journals = await Journal.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      attributes: {
        exclude: ['updated_at']
      }
    });
    res.json({
      success: true,
      data: journals.rows,
      pagination: {
        total: journals.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(journals.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journals',
      error: error.message
    });
  }
};
// Get a single journal by ID or Slug (increments view count)
const getJournalById = async (req, res) => {
  try {
    const { id } = req.params;
    let journal;
    // FIXED: Proper slug/ID detection logic
    // Previous logic used !isNaN(id) which was broken:
    // - !isNaN(123) returns false (treats numeric ID as slug) - INCORRECT
    // - !isNaN("123") returns true (treats string ID as ID) - INCORRECT
    // - !isNaN("") returns true (causes errors) - INCORRECT
    // New logic uses regex to properly detect numeric IDs
    const isNumericId = /^\d+$/.test(id) && parseInt(id) <= Number.MAX_SAFE_INTEGER;
    if (isNumericId) {
      journal = await Journal.findByPk(parseInt(id));
    } else {
      journal = await Journal.findOne({ where: { slug: id } });
    }
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }
    // Increment view count
    await journal.incrementViewCount();
    res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal',
      error: error.message
    });
  }
};
// Create a new journal
const createJournal = async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, featured_images } = req.body;
    // Check existing tags
    const tagCheck = await checkExistingTags(tags);
    // Handle uploaded files from middleware
    const uploadedImages = req.uploadedFiles || [];
    // Convert uploaded files to the expected format
    const uploadedImageObjects = uploadedImages.map(file => ({
      url: file.url,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    // Merge uploaded images with any featured_images from request body
    const allFeaturedImages = [];
    if (featured_images && Array.isArray(featured_images)) {
      allFeaturedImages.push(...featured_images);
    }
    allFeaturedImages.push(...uploadedImageObjects);
    const journal = await Journal.create({
      title,
      content,
      excerpt,
      tags: tags || null,
      category: category || null,
      featured_images: allFeaturedImages.length > 0 ? allFeaturedImages : null,
      // slug will be auto-generated by model hook
    });
    // Prepare response message with tag information
    let message = 'Journal created successfully';
    const tagInfo = [];
    if (tagCheck.existing.length > 0) {
      tagInfo.push(`Used existing tags: ${tagCheck.existing.join(', ')}`);
    }
    if (tagCheck.new.length > 0) {
      tagInfo.push(`Added new tags: ${tagCheck.new.join(', ')}`);
    }
    if (tagInfo.length > 0) {
      message += ' ' + tagInfo.join(', ');
    }
    res.status(201).json({
      success: true,
      message,
      data: journal,
      tagInfo: {
        existing: tagCheck.existing,
        new: tagCheck.new
      }
    });
  } catch (error) {
    // Clean up uploaded images if creation failed
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.uploadedFiles.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (cleanupError) {
            }
        }
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create journal',
      error: error.message
    });
  }
};
// Update a journal with file cleanup
const updateJournal = async (req, res) => {
  try {
    const journal = await Journal.findByPk(req.params.id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }
    const { title, content, excerpt, tags, category, featured_images } = req.body;
    // Store old images for cleanup
    const oldImages = journal.featured_images || [];
    // Check existing tags if tags are being updated
    let tagCheck = null;
    if (tags !== undefined) {
      tagCheck = await checkExistingTags(tags);
    }
    // Handle uploaded files from middleware
    const uploadedImages = req.uploadedFiles || [];
    // Convert uploaded files to the expected format
    const uploadedImageObjects = uploadedImages.map(file => ({
      url: file.url,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    // Merge uploaded images with any featured_images from request body
    let allFeaturedImages = [];
    if (featured_images && Array.isArray(featured_images)) {
      allFeaturedImages.push(...featured_images);
    }
    allFeaturedImages.push(...uploadedImageObjects);
    // Determine final featured images
    const finalFeaturedImages = allFeaturedImages.length > 0 ? allFeaturedImages : (featured_images === null ? null : journal.featured_images);
    // Update journal
    await journal.update({
      title: title || journal.title,
      content: content || journal.content,
      excerpt: excerpt !== undefined ? excerpt : journal.excerpt,
      tags: tags !== undefined ? tags : journal.tags,
      category: category !== undefined ? category : journal.category,
      featured_images: finalFeaturedImages
      // slug updates automatically if title changes, handled by model hook?
      // Sequelize hooks only run on individual hooks if configured.
      // For updates, the beforeValidate hook we added should run if we save.
    });
    // Delete old images that are no longer referenced
    if (finalFeaturedImages && finalFeaturedImages.length > 0 && oldImages.length > 0) {
      const imagesToDelete = oldImages.filter(oldImg => {
        // Check if the old image is not in the new images
        const isInNewImages = finalFeaturedImages.some(newImg => {
          if (typeof newImg === 'string') {
            return newImg === oldImg.url || newImg === oldImg;
          }
          return newImg.url === oldImg.url;
        });
        return !isInNewImages;
      });
      const deletePromises = imagesToDelete.map(async (img) => {
        // Determine the file path
        let filePath;
        if (typeof img === 'string') {
          // If it's a string URL, extract the path
          if (img.startsWith('/uploads/')) {
            filePath = path.join(__dirname, '..', '..', img);
          } else if (img.startsWith('http')) {
            // Skip external URLs
            return;
          } else {
            filePath = path.join(__dirname, '..', '..', 'uploads', img);
          }
        } else if (img.url) {
          // If it's an object with url property
          if (img.url.startsWith('/uploads/')) {
            filePath = path.join(__dirname, '..', '..', img.url);
          } else if (img.url.startsWith('http')) {
            // Skip external URLs
            return;
          } else {
            filePath = path.join(__dirname, '..', '..', 'uploads', img.url);
          }
        } else {
          return;
        }
        try {
          await fsPromises.unlink(filePath);
        } catch (error) {
          // Log but don't fail if file doesn't exist or can't be deleted
          }
      });
      await Promise.all(deletePromises);
    }
    // Prepare response message with tag information if tags were updated
    let message = 'Journal updated successfully';
    let responseTagInfo = null;
    if (tagCheck) {
      responseTagInfo = {
        existing: tagCheck.existing,
        new: tagCheck.new
      };
      const tagInfo = [];
      if (tagCheck.existing.length > 0) {
        tagInfo.push(`Used existing tags: ${tagCheck.existing.join(', ')}`);
      }
      if (tagCheck.new.length > 0) {
        tagInfo.push(`Added new tags: ${tagCheck.new.join(', ')}`);
      }
      if (tagInfo.length > 0) {
        message += ' ' + tagInfo.join(', ');
      }
    }
    res.json({
      success: true,
      message,
      data: journal,
      tagInfo: responseTagInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update journal',
      error: error.message
    });
  }
};
// Delete a journal with file cleanup
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findByPk(req.params.id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }
    // Store images for cleanup before deletion
    const imagesToDelete = journal.featured_images || [];
    // Delete the journal from database
    await journal.destroy();
    // Delete associated image files
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(async (img) => {
        // Determine the file path
        let filePath;
        if (typeof img === 'string') {
          // If it's a string URL, extract the path
          if (img.startsWith('/uploads/')) {
            filePath = path.join(__dirname, '..', '..', img);
          } else if (img.startsWith('http')) {
            // Skip external URLs
            return;
          } else {
            filePath = path.join(__dirname, '..', '..', 'uploads', img);
          }
        } else if (img.url) {
          // If it's an object with url property
          if (img.url.startsWith('/uploads/')) {
            filePath = path.join(__dirname, '..', '..', img.url);
          } else if (img.url.startsWith('http')) {
            // Skip external URLs
            return;
          } else {
            filePath = path.join(__dirname, '..', '..', 'uploads', img.url);
          }
        } else {
          return;
        }
        try {
          await fsPromises.unlink(filePath);
        } catch (error) {
          // Log but don't fail if file doesn't exist or can't be deleted
          }
      });
      await Promise.all(deletePromises);
    }
    res.json({
      success: true,
      message: 'Journal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal',
      error: error.message
    });
  }
};
// Get all unique tags using database-level aggregation
const getAllTags = async (req, res) => {
  try {
    // Use database-level aggregation for counting tags
    const [results] = await Journal.sequelize.query(`
      SELECT
        JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']'))) as tag,
        COUNT(*) as count
      FROM journals
      CROSS JOIN (
        SELECT 1 as seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
        UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
        UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      ) as seq
      WHERE JSON_LENGTH(tags) >= seq.seq
      GROUP BY tag
      ORDER BY tag ASC
    `);
    const uniqueTags = results.map(r => ({
      tag: r.tag,
      count: r.count
    })).filter(t => t.tag); // Filter out null/empty tags
    res.json({
      success: true,
      data: uniqueTags.sort((a, b) => b.count - a.count)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message
    });
  }
};
// Get all unique categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Journal.findAll({
      where: {
        category: {
          [Op.not]: null
        }
      },
      attributes: ['category']
    });
    // Extract all categories
    const allCategories = categories.map(journal => journal.category).filter(Boolean);
    // Get unique categories and count
    const uniqueCategories = [...new Set(allCategories)].map(category => ({
      category,
      count: allCategories.filter(c => c === category).length
    }));
    res.json({
      success: true,
      data: uniqueCategories.sort((a, b) => b.count - a.count)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};
// Check if tags exist
const checkTagsExist = async (req, res) => {
  try {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Tags parameter is required'
      });
    }
    // Parse tags from query (can be comma-separated or array)
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t);
    if (tagArray.length === 0) {
      return res.json({
        success: true,
        data: {
          existing: [],
          new: [],
          message: 'No tags provided'
        }
      });
    }
    const tagCheck = await checkExistingTags(tagArray);
    res.json({
      success: true,
      data: {
        existing: tagCheck.existing,
        new: tagCheck.new,
        total: tagArray.length,
        existingCount: tagCheck.existing.length,
        newCount: tagCheck.new.length
      },
      message: tagCheck.existing.length > 0
        ? `Found ${tagCheck.existing.length} existing tag${tagCheck.existing.length > 1 ? 's' : ''} and ${tagCheck.new.length} new tag${tagCheck.new.length > 1 ? 's' : ''}`
        : `All ${tagCheck.new.length} tag${tagCheck.new.length > 1 ? 's' : ''} are new`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check tags',
      error: error.message
    });
  }
};
// Get tag suggestions for autocomplete using database-level query
const getTagSuggestions = async (req, res) => {
  try {
    const { q } = req.query; // q = query parameter for partial tag search
    if (!q || q.length < 1) {
      return res.json({
        success: true,
        data: [],
        message: 'Query parameter is too short (minimum 1 character)'
      });
    }
    // Use database-level query with LIKE for partial matching
    const [results] = await Journal.sequelize.query(`
      SELECT
        JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']'))) as tag,
        COUNT(*) as count
      FROM journals
      CROSS JOIN (
        SELECT 1 as seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
        UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
        UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      ) as seq
      WHERE JSON_LENGTH(tags) >= seq.seq
        AND JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']'))) LIKE :query
      GROUP BY tag
      ORDER BY
        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']'))) = :exactQuery THEN 0 ELSE 1 END,
        count DESC,
        tag ASC
      LIMIT 10
    `, {
      replacements: {
        query: `%${q}%`,
        exactQuery: q
      }
    });
    const matchedTags = results.map(r => ({
      tag: r.tag,
      count: r.count
    })).filter(t => t.tag); // Filter out null/empty tags
    res.json({
      success: true,
      data: matchedTags,
      query: q,
      totalFound: matchedTags.length,
      message: matchedTags.length > 0
        ? `Found ${matchedTags.length} tag${matchedTags.length > 1 ? 's' : ''} matching "${q}"`
        : `No tags found matching "${q}"`
 });
 } catch (error) {
 res.status(500).json({
 success: false,
 message: 'Failed to get tag suggestions',
 error: error.message
 });
 }
};
// Get popular tags (for initial display) using database-level aggregation
const getPopularTags = async (req, res) => {
 try {
 const { limit = 20 } = req.query;
 // Use database-level aggregation for counting tags
 const [results] = await Journal.sequelize.query(`
   SELECT
     JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', seq.seq - 1, ']'))) as tag,
     COUNT(*) as count
   FROM journals
   CROSS JOIN (
     SELECT 1 as seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
     UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
     UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
   ) as seq
   WHERE JSON_LENGTH(tags) >= seq.seq
   GROUP BY tag
   ORDER BY count DESC, tag ASC
   LIMIT :limit
 `, {
   replacements: { limit: parseInt(limit) }
 });
 const popularTags = results.map(r => ({
   tag: r.tag,
   count: r.count
 })).filter(t => t.tag); // Filter out null/empty tags
 res.json({
 success: true,
 data: popularTags,
 total: popularTags.length,
 limit: parseInt(limit),
 message: `Showing top ${popularTags.length} popular tag${popularTags.length > 1 ? 's' : ''}`
 });
 } catch (error) {
 res.status(500).json({
 success: false,
 message: 'Failed to get popular tags',
 error: error.message
 });
 }
};
// FIXED: Consolidated all exports into a single module.exports statement
// Previous code had three separate module.exports statements, which would cause
// only the last one to be used. This ensures all controller methods are exported.
module.exports = {
  getAllJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
  getAllTags,
  getAllCategories,
  checkTagsExist,
  getTagSuggestions,
  getPopularTags,
  checkExistingTags
};
