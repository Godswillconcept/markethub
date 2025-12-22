const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { VendorMessage, User, sequelize } = require('../models');

exports.createVendorMessage = catchAsync(async (req, res) => {
  const {
    full_name,
    phone,
    topic,
    message
  } = req.body;

  const vendorId = req.user.id;

  // Generate unique reference number
  let referenceNumber;
  let attempt = 0;
  do {
    referenceNumber = `VM-${uuidv4().slice(0, 8).toUpperCase()}`;
    attempt++;
  } while (await VendorMessage.findOne({ where: { reference_number: referenceNumber } }) && attempt < 5);

  if (attempt >= 5) {
    throw new AppError('Could not generate unique reference number', 500);
  }

  const vendorMessage = await sequelize.transaction(async (t) => {
    return VendorMessage.create({
      vendor_id: vendorId,
      full_name,
      phone,
      topic,
      message,
      reference_number: referenceNumber
    }, { transaction: t });
  });

  logger.info(`Vendor message created - ID: ${vendorMessage.id}, Vendor: ${vendorId}, Ref: ${referenceNumber}`);

  res.status(201).json({
    success: true,
    data: {
      id: vendorMessage.id,
      reference_number: vendorMessage.reference_number,
      status: vendorMessage.status,
      created_at: vendorMessage.created_at
    }
  });
});

exports.getMyVendorMessages = catchAsync(async (req, res) => {
  const vendorId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  // Convert string parameters to integers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;
  const where = { vendor_id: vendorId };
  if (status) where.status = status;

  const { count, rows } = await VendorMessage.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'admin',
      attributes: ['first_name', 'last_name', 'email']
    }]
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(count / limitNum)
    }
  });
});

exports.getVendorMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const vendorMessage = await VendorMessage.findByPk(id, {
    include: [{
      model: User,
      as: 'vendor',
      attributes: ['first_name', 'last_name', 'email']
    }, {
      model: User,
      as: 'admin',
      attributes: ['first_name', 'last_name', 'email']
    }]
  });

  if (!vendorMessage) {
    throw new AppError('Message not found', 404);
  }

  // Check permission - owner or admin
  if (vendorMessage.vendor_id !== req.user.id && !req.user.roles.some(role => role.name === 'admin')) {
    throw new AppError('Unauthorized', 403);
  }

  res.json({
    success: true,
    data: vendorMessage
  });
});

exports.updateVendorMessageStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const vendorMessage = await sequelize.transaction(async (t) => {
    const vm = await VendorMessage.findByPk(id, { transaction: t });
    if (!vm) {
      throw new AppError('Message not found', 404);
    }

    // Check permission - owner or admin
    if (vm.vendor_id !== req.user.id && !req.user.roles.some((role) => role.name === "admin")) {
      throw new AppError('Unauthorized', 403);
    }

    vm.status = status;
    await vm.save({ transaction: t });
    return vm;
  });

  logger.info(`Vendor message status updated - ID: ${id}, Status: ${status}`);

  res.json({
    success: true,
    data: vendorMessage
  });
});

exports.deleteVendorMessage = catchAsync(async (req, res) => {
  const { id } = req.params;

  const vendorMessage = await sequelize.transaction(async (t) => {
    const vm = await VendorMessage.findByPk(id, { transaction: t });
    if (!vm) {
      throw new AppError('Message not found', 404);
    }
    if (vm.vendor_id !== req.user.id && !req.user.roles.some(role => role.name === 'admin')) {
      throw new AppError('Unauthorized', 403);
    }
    await vm.destroy({ transaction: t });
    return vm;
  });

  logger.info(`Vendor message deleted - ID: ${id}`);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

exports.resolveMessage = catchAsync(async (req, res) => {
  const { id } = req.params;

  const vendorMessage = await sequelize.transaction(async (t) => {
    const vm = await VendorMessage.findByPk(id, { transaction: t });
    if (!vm) {
      throw new AppError('Message not found', 404);
    }

    vm.admin_id = req.user.id;
    vm.status = 'resolved';
    await vm.save({ transaction: t });
    return vm;
  });

  logger.info(`Vendor message resolved - ID: ${id}, Admin: ${req.user.id}`);

  res.json({
    success: true,
    data: vendorMessage
  });
});

exports.getAllVendorMessages = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, topic } = req.query;

  // Convert string parameters to integers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;
  const where = {};

  if (status) where.status = status;
  if (topic) where.topic = topic;

  const { count, rows } = await VendorMessage.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'vendor',
      attributes: ['first_name', 'last_name', 'email', 'phone']
    }, {
      model: User,
      as: 'admin',
      attributes: ['first_name', 'last_name', 'email']
    }]
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(count / limitNum)
    }
  });
});