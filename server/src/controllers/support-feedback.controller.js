const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { SupportFeedback, User, sequelize } = require('../models');
const path = require('path');
const fs = require('fs');
const { sendSupportFeedbackConfirmation } = require('../services/email.service');

// XSS Protection: Import xss library for HTML sanitization
const xss = require('xss');

/**
 * Sanitize user input to prevent XSS attacks
 * This function provides an additional layer of security beyond validator sanitization
 *
 * @param {Object} data - The data object to sanitize
 * @returns {Object} - Sanitized data object
 */
const sanitizeInput = (data) => {
  const sanitized = { ...data };
  
  // Sanitize string fields that could contain malicious content
  if (sanitized.subject) {
    // No HTML tags allowed in subject - strip all HTML
    sanitized.subject = xss(sanitized.subject, {
      whiteList: {}, // Empty whitelist = no HTML allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  if (sanitized.description) {
    // Allow basic formatting in description but sanitize dangerous elements
    sanitized.description = xss(sanitized.description, {
      whiteList: {
        p: [],
        br: [],
        strong: [],
        em: [],
        u: [],
        ul: [],
        ol: [],
        li: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  }
  
  if (sanitized.contact_email) {
    // No HTML allowed in email
    sanitized.contact_email = xss(sanitized.contact_email, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  if (sanitized.contact_phone) {
    // No HTML allowed in phone
    sanitized.contact_phone = xss(sanitized.contact_phone, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  return sanitized;
};


/**
 * Create a new support feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Created feedback object
 */
exports.createFeedback = catchAsync(async (req, res) => {
  // XSS Protection: Sanitize all user input before processing
  const sanitizedBody = sanitizeInput(req.body);
  
  const {
    subject,
    order_number,
    issue_type,
    description,
    preferred_support_method,
    contact_email,
    contact_phone
  } = sanitizedBody;
  
  const userId = req.user.id;
  // Generate unique reference number
  let referenceNumber;
  let attempt = 0;
  do {
    referenceNumber = `SF-${uuidv4().slice(0, 8).toUpperCase()}`;
    attempt++;
  } while (await SupportFeedback.findOne({ where: { reference_number: referenceNumber } }) && attempt < 5);
  if (attempt >= 5) {
    throw new AppError('Could not generate unique reference number', 500);
  }
  const uploadedFiles = req.uploadedFiles || [];
  const attachments = uploadedFiles.map(file => ({
    filename: file.filename,
    url: file.url,
    mimetype: file.mimetype,
    size: file.size
  }));
  // XSS Protection: All data is sanitized before database insertion
  const feedback = await sequelize.transaction(async (t) => {
    return SupportFeedback.create({
      user_id: userId,
      subject,
      order_number,
      issue_type,
      description,
      preferred_support_method,
      contact_email,
      contact_phone,
      attachments,
      reference_number: referenceNumber
    }, { transaction: t });
  });
  // Send confirmation email
  const user = await User.findByPk(userId, { attributes: ['email', 'first_name', 'last_name'] });
  await sendSupportFeedbackConfirmation(user.email, {
    support: feedback,
    user: user.toJSON(),
    referenceNumber
  });

  logger.info(`Support feedback created - ID: ${feedback.id}, User: ${userId}, Ref: ${referenceNumber}`);

  res.status(201).json({
    success: true,
    data: {
      id: feedback.id,
      reference_number: feedback.reference_number,
      status: feedback.status
    }
  });
});


/**
 * Get user's support feedbacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Array of feedback objects
 */
exports.getMyFeedbacks = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;
  const where = { user_id: userId };
  if (status) where.status = status;
  const { count, rows } = await SupportFeedback.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'User',
      attributes: ['first_name', 'last_name', 'email']
    }]
  });
  res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get a specific support feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Feedback object
 */
exports.getFeedback = catchAsync(async (req, res) => {
  const { id } = req.params;
  const feedback = await SupportFeedback.findByPk(id, {
    include: [{
      model: User,
      as: 'User',
      attributes: ['first_name', 'last_name', 'email']
    }]
  });
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }
  // Check permission - owner or admin
  logger.info('deleteFeedback auth', {
    userId: req.user.id,
    isAdmin: req.user.roles.some((role) => role.name === "admin"),
    userRoles: req.user.roles,
    feedbackUserId: feedback.user_id
  });
  // Owner or admin only
  if (feedback.user_id !== req.user.id && !req.user.roles.some(role => role.name === 'admin')) {
    throw new AppError('Unauthorized', 403);
  }
  res.json({
    success: true,
    data: feedback
  });
});

/**
 * Update support feedback status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Updated feedback object
 */
exports.updateFeedbackStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // XSS Protection: Sanitize status input
  const sanitizedBody = sanitizeInput(req.body);
  const { status } = sanitizedBody;
  
  const feedback = await sequelize.transaction(async (t) => {
    const fb = await SupportFeedback.findByPk(id, { transaction: t });
    if (!fb) {
      throw new AppError('Feedback not found', 404);
    }
    fb.status = status;
    await fb.save({ transaction: t });
    return fb;
  });

  // Note: Admin authorization is handled by middleware in routes
  // No need to check here as isAdmin middleware ensures only admins reach this point

  res.json({
    success: true,
    data: feedback
  });
});

/**
 * Delete support feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Deletion confirmation
 */
exports.deleteFeedback = catchAsync(async (req, res) => {
  const { id } = req.params;
  const feedback = await sequelize.transaction(async (t) => {
    const fb = await SupportFeedback.findByPk(id, { transaction: t });
    if (!fb) {
      throw new AppError('Feedback not found', 404);
    }

    // Note: Authorization is handled by isOwnerOrAdmin middleware in routes
    // No need to check here as middleware ensures only owner or admin reaches this point

    // Delete attachments files
    if (fb.attachments && Array.isArray(fb.attachments)) {
      fb.attachments.forEach(att => {
        const filepath = path.join(process.cwd(), 'public/Upload/support-attachments', att.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      });
    }
    await fb.destroy({ transaction: t });
    return fb;
  });

  logger.info(`Support feedback deleted - ID: ${id}, User: ${req.user.id}`);

  res.json({
    success: true,
    message: 'Feedback deleted successfully'
  });
});

/**
 * Get all feedbacks (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Array of feedback objects with pagination
 */
exports.getAllFeedbacks = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    issue_type,
    sort_by = 'created_at',
    date_from,
    date_to
  } = req.query;
  
  const offset = (page - 1) * limit;
  const where = {};
  
  // Apply filters
  if (status) where.status = status;
  if (issue_type) where.issue_type = issue_type;
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at[sequelize.Op.gte] = new Date(date_from);
    if (date_to) where.created_at[sequelize.Op.lte] = new Date(date_to);
  }
  
  // Determine sort order
  const validSortFields = ['created_at', 'status', 'issue_type'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
  
  const { count, rows } = await SupportFeedback.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortField, 'DESC']],
    include: [{
      model: User,
      as: 'User',
      attributes: ['id', 'first_name', 'last_name', 'email']
    }]
  });
  
  logger.info(`Admin retrieved all feedbacks - Count: ${count}, Admin: ${req.user.id}`);
  
  res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get feedback statistics (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Statistics object
 */
exports.getFeedbackStats = catchAsync(async (req, res) => {
  // Total feedback count
  const totalCount = await SupportFeedback.count();
  
  // Count by status
  const statusCounts = await SupportFeedback.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });
  
  const statusStats = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0
  };
  statusCounts.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  // Count by issue type
  const issueTypeCounts = await SupportFeedback.findAll({
    attributes: [
      'issue_type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['issue_type'],
    raw: true
  });
  
  const issueTypeStats = {};
  issueTypeCounts.forEach(item => {
    issueTypeStats[item.issue_type] = parseInt(item.count);
  });
  
  // Open vs closed ratio
  const openCount = statusStats.open + statusStats.in_progress;
  const closedCount = statusStats.resolved + statusStats.closed;
  const totalForRatio = openCount + closedCount;
  const openClosedRatio = totalForRatio > 0 ? {
    open: Math.round((openCount / totalForRatio) * 100),
    closed: Math.round((closedCount / totalForRatio) * 100)
  } : { open: 0, closed: 0 };
  
  // Average resolution time (for resolved/closed feedback)
  const resolvedFeedbacks = await SupportFeedback.findAll({
    where: {
      status: ['resolved', 'closed']
    },
    attributes: ['id', 'created_at', 'updated_at'],
    raw: true
  });
  
  let totalResolutionTime = 0;
  let resolutionCount = 0;
  
  resolvedFeedbacks.forEach(feedback => {
    const createdTime = new Date(feedback.created_at).getTime();
    const updatedTime = new Date(feedback.updated_at).getTime();
    const resolutionTime = updatedTime - createdTime;
    totalResolutionTime += resolutionTime;
    resolutionCount++;
  });
  
  const avgResolutionTime = resolutionCount > 0
    ? Math.round(totalResolutionTime / resolutionCount / (1000 * 60 * 60)) // Convert to hours
    : 0;
  
  // Feedback volume by date (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyVolume = await SupportFeedback.findAll({
    where: {
      created_at: {
        [sequelize.Op.gte]: thirtyDaysAgo
      }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    raw: true
  });
  
  const volumeByDate = dailyVolume.map(item => ({
    date: item.date,
    count: parseInt(item.count)
  }));
  
  logger.info(`Admin retrieved feedback stats - Admin: ${req.user.id}`);
  
  res.json({
    success: true,
    data: {
      total_feedbacks: totalCount,
      by_status: statusStats,
      by_issue_type: issueTypeStats,
      open_vs_closed_ratio: openClosedRatio,
      avg_resolution_time_hours: avgResolutionTime,
      volume_by_date_last_30_days: volumeByDate
    }
  });
});

/**
 * Add admin reply to feedback (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Updated feedback object with reply
 */
exports.addReply = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  
  // XSS Protection: Sanitize reply content
  const sanitizedBody = sanitizeInput(req.body);
  const { reply_content, update_status } = sanitizedBody;
  
  const feedback = await sequelize.transaction(async (t) => {
    const fb = await SupportFeedback.findByPk(id, {
      transaction: t,
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }]
    });
    
    if (!fb) {
      throw new AppError('Feedback not found', 404);
    }
    
    // Initialize replies array if it doesn't exist
    const replies = fb.replies || [];
    
    // Add new reply
    replies.push({
      admin_id: adminId,
      content: reply_content,
      created_at: new Date().toISOString()
    });
    
    // Update feedback with new reply
    fb.replies = replies;
    
    // Optionally update status
    if (update_status) {
      fb.status = update_status;
    }
    
    await fb.save({ transaction: t });
    return fb;
  });
  
  // Send notification to user (email)
  try {
    await sendSupportFeedbackConfirmation(feedback.User.email, {
      support: feedback,
      user: feedback.User.toJSON(),
      referenceNumber: feedback.reference_number,
      isReply: true,
      replyContent: reply_content
    });
  } catch (error) {
    logger.error(`Failed to send reply notification email`, {
      feedbackId: id,
      userId: feedback.user_id,
      error: error.message
    });
    // Continue even if email fails
  }
  
  logger.info(`Admin added reply to feedback - ID: ${id}, Admin: ${adminId}`);
  
  res.json({
    success: true,
    message: 'Reply added successfully',
    data: feedback
  });
});