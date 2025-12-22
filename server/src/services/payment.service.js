const axios = require('axios');
const crypto = require('crypto');
const AppError = require('../utils/appError');
require('dotenv').config();
class PaymentService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!this.secretKey || !this.secretKey.startsWith('sk_')) {
      console.warn('⚠️ WARNING: PAYSTACK_SECRET_KEY appears to be missing or invalid. It should start with "sk_test_" or "sk_live_".');
    }

    this.paystack = axios.create({
      baseURL: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
    });
    
    // Initialize sub-services
    this.transactions = new TransactionService(this.paystack);
    this.customers = new CustomerService(this.paystack);
    this.transfers = new TransferService(this.paystack);
    this.plans = new PlanService(this.paystack);
    this.subscriptions = new SubscriptionService(this.paystack);
    this.refunds = new RefundService(this.paystack);
    this.settlements = new SettlementService(this.paystack);
    this.subaccounts = new SubaccountService(this.paystack);
    this.paymentPages = new PaymentPageService(this.paystack);
    this.dedicatedAccounts = new DedicatedAccountService(this.paystack);
    this.transactionSplits = new TransactionSplitService(this.paystack);
    this.banks = new BankService(this.paystack);
  }

  /**
   * Initialize a new payment transaction
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment initialization response
   */
  async initializePayment(paymentData) {
    try {
      const response = await this.paystack.post('/transaction/initialize', {
        email: paymentData.email,
        amount: Math.round(paymentData.amount * 100), // Convert to kobo
        reference: paymentData.reference,
        currency: 'NGN',
        callback_url: paymentData.callbackUrl,
        metadata: {
          orderId: paymentData.orderId,
          userId: paymentData.userId,
          items: paymentData.items,
        },
      });

      return response.data;
    } catch (error) {
      console.error('PayStack initialization error:', error);
      // console.error('PayStack initialization error - data:', error.response?.data);
      console.error('PayStack initialization error - message:', error.message);
      throw new AppError('Payment initialization failed', 400);
    }
  }

  /**
   * Initialize a new payment transaction with retry mechanism
   * @param {Object} paymentData - Payment details
   * @param {number} retries - Number of retries
   * @returns {Promise<Object>} Payment initialization response
   */
  async initializePaymentWithRetry(paymentData, retries = 3) {
    try {
      let attempt = 0;
      while (attempt < retries) {
        try {
          const response = await this.initializePayment(paymentData);
          return response;
        } catch (error) {
          attempt++;
          console.error(`Attempt ${attempt} failed:`, error.message);
          if (attempt === retries) {
            throw error;
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    } catch (error) {
      console.error('Payment initialization failed after multiple retries:', error);
      throw new AppError('Payment initialization failed after multiple retries', 400);
    }
  }

  /**
   * Verify a payment transaction
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} Transaction verification response
   */
  async verifyPayment(reference) {
    try {
      const response = await this.paystack.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('PayStack verification error:', error.response?.data || error.message);
      throw new AppError('Payment verification failed', 400);
    }
  }

  /**
   * Handle PayStack webhook
   * @param {Object} event - Webhook event data
   * @returns {Promise<Object>} Webhook processing result
   */
  async handleWebhook(event) {
    try {
      // Verify the event is from PayStack
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
        .update(JSON.stringify(event))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        throw new AppError('Invalid webhook signature', 401);
      }

      const { event: eventType, data } = event;

      switch (eventType) {
        case 'charge.success':
          return await this.handleSuccessfulCharge(data);
        case 'charge.failed':
          return await this.handleFailedCharge(data);
        case 'transfer.success':
          return await this.handleSuccessfulTransfer(data);
        case 'transfer.failed':
          return await this.handleFailedTransfer(data);
        default:
          return { status: 'success', message: 'Event not handled' };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  // ======================
  // Transaction Methods
  // ======================

  /**
   * List transactions
   * @param {Object} options - Query parameters
   * @returns {Promise<Object>} List of transactions
   */
  async listTransactions(options = {}) {
    try {
      const response = await this.paystack.get('/transaction', { params: options });
      return response.data;
    } catch (error) {
      this._handleError('Failed to list transactions', error);
    }
  }

  /**
   * Fetch a single transaction
   * @param {string|number} id - Transaction ID or reference
   * @returns {Promise<Object>} Transaction details
   */
  async fetchTransaction(id) {
    try {
      const response = await this.paystack.get(`/transaction/${id}`);
      return response.data;
    } catch (error) {
      this._handleError('Failed to fetch transaction', error);
    }
  }

  /**
   * Charge authorization
   * @param {Object} chargeData - Charge details
   * @returns {Promise<Object>} Charge response
   */
  async chargeAuthorization(chargeData) {
    try {
      const response = await this.paystack.post('/transaction/charge_authorization', {
        ...chargeData,
        amount: Math.round(chargeData.amount * 100), // Convert to kobo
      });
      return response.data;
    } catch (error) {
      this._handleError('Charge authorization failed', error);
    }
  }

  /**
   * Check authorization
   * @param {Object} authData - Authorization details
   * @returns {Promise<Object>} Authorization check response
   */
  async checkAuthorization(authData) {
    try {
      const response = await this.paystack.post('/transaction/check_authorization', {
        ...authData,
        amount: Math.round(authData.amount * 100), // Convert to kobo
      });
      return response.data;
    } catch (error) {
      this._handleError('Authorization check failed', error);
    }
  }

  // ======================
  // Customer Methods
  // ======================

  /**
   * Create a customer
   * @param {Object} customerData - Customer details
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    try {
      const response = await this.paystack.post('/customer', customerData);
      return response.data;
    } catch (error) {
      this._handleError('Failed to create customer', error);
    }
  }

  /**
   * List customers
   * @param {Object} options - Query parameters
   * @returns {Promise<Object>} List of customers
   */
  async listCustomers(options = {}) {
    try {
      const response = await this.paystack.get('/customer', { params: options });
      return response.data;
    } catch (error) {
      this._handleError('Failed to list customers', error);
    }
  }

  // ======================
  // Transfer Methods
  // ======================

  /**
   * Initiate transfer
   * @param {Object} transferData - Transfer details
   * @returns {Promise<Object>} Transfer response
   */
  async initiateTransfer(transferData) {
    try {
      const response = await this.paystack.post('/transfer', {
        ...transferData,
        amount: Math.round(transferData.amount * 100), // Convert to kobo
      });
      return response.data;
    } catch (error) {
      this._handleError('Transfer initiation failed', error);
    }
  }

  // ======================
  // Plan & Subscription Methods
  // ======================

  /**
   * Create a plan
   * @param {Object} planData - Plan details
   * @returns {Promise<Object>} Created plan
   */
  async createPlan(planData) {
    try {
      const response = await this.paystack.post('/plan', {
        ...planData,
        amount: Math.round(planData.amount * 100), // Convert to kobo
      });
      return response.data;
    } catch (error) {
      this._handleError('Failed to create plan', error);
    }
  }

  // ======================
  // Refund Methods
  // ======================

  /**
   * Create a refund
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund response
   */
  async createRefund(refundData) {
    try {
      const response = await this.paystack.post('/refund', refundData);
      return response.data;
    } catch (error) {
      this._handleError('Refund creation failed', error);
    }
  }

  // ======================
  // Utility Methods
  // ======================

  /**
   * Handle API errors
   * @private
   */
  _handleError(message, error) {
    console.error(`${message}:`, error.response?.data || error.message);
    throw new AppError(message, error.response?.status || 400);
  }

  // Private handler methods
  async handleSuccessfulCharge(data) {
    // Update order status to paid
    // Send confirmation email
    // Process vendor payouts if needed
    return { status: 'success', message: 'Charge successful' };
  }

  async handleFailedCharge(data) {
    // Update order status to payment_failed
    // Send failure notification
    return { status: 'success', message: 'Charge failed' };
  }

  async handleSuccessfulTransfer(data) {
    // Update vendor balance
    // Log successful transfer
    return { status: 'success', message: 'Transfer successful' };
  }

  async handleFailedTransfer(data) {
    // Log failed transfer
    // Notify admin
    return { status: 'success', message: 'Transfer failed' };
  }
}

// Sub-service classes
class TransactionService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async list(options = {}) {
    const response = await this.paystack.get('/transaction', { params: options });
    return response.data;
  }

  async fetch(id) {
    const response = await this.paystack.get(`/transaction/${id}`);
    return response.data;
  }

  async chargeAuthorization(chargeData) {
    const response = await this.paystack.post('/transaction/charge_authorization', {
      ...chargeData,
      amount: Math.round(chargeData.amount * 100),
    });
    return response.data;
  }

  async exportTransactions(params = {}) {
    const response = await this.paystack.get('/transaction/export', { params });
    return response.data;
  }
}

class CustomerService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(customerData) {
    const response = await this.paystack.post('/customer', customerData);
    return response.data;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/customer', { params });
    return response.data;
  }

  async fetch(customerId) {
    const response = await this.paystack.get(`/customer/${customerId}`);
    return response.data;
  }

  async update(customerId, customerData) {
    const response = await this.paystack.put(`/customer/${customerId}`, customerData);
    return response.data;
  }
}

class TransferService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async initiate(transferData) {
    const response = await this.paystack.post('/transfer', {
      ...transferData,
      amount: Math.round(transferData.amount * 100),
    });
    return response.data;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/transfer', { params });
    return response.data;
  }

  async createRecipient(recipientData) {
    const response = await this.paystack.post('/transferrecipient', recipientData);
    return response.data;
  }

  async listRecipients(params = {}) {
    const response = await this.paystack.get('/transferrecipient', { params });
    return response.data;
  }
}

class BankService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/bank', { params });
    return response.data;
  }

  async resolveAccount(accountNumber, bankCode) {
    const response = await this.paystack.get('/bank/resolve', {
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
    });
    return response.data;
  }
}

class PlanService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(planData) {
    const payload = {
      name: planData.name,
      amount: Math.round(planData.amount * 100),
      interval: planData.interval,
    };

    // Add optional fields if provided
    if (planData.description) payload.description = planData.description;
    if (planData.send_invoices !== undefined) payload.send_invoices = planData.send_invoices;
    if (planData.send_sms !== undefined) payload.send_sms = planData.send_sms;
    if (planData.currency) payload.currency = planData.currency;
    if (planData.invoice_limit) payload.invoice_limit = planData.invoice_limit;

    const response = await this.paystack.post('/plan', payload);
    return response.data;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/plan', { params });
    return response.data;
  }

  async fetch(idOrCode) {
    const response = await this.paystack.get(`/plan/${idOrCode}`);
    return response.data;
  }

  async update(idOrCode, planData) {
    const payload = {};

    if (planData.name) payload.name = planData.name;
    if (planData.amount) payload.amount = Math.round(planData.amount * 100);
    if (planData.interval) payload.interval = planData.interval;
    if (planData.description !== undefined) payload.description = planData.description;
    if (planData.send_invoices !== undefined) payload.send_invoices = planData.send_invoices;
    if (planData.send_sms !== undefined) payload.send_sms = planData.send_sms;
    if (planData.currency) payload.currency = planData.currency;
    if (planData.invoice_limit) payload.invoice_limit = planData.invoice_limit;
    if (planData.update_existing_subscriptions !== undefined) {
      payload.update_existing_subscriptions = planData.update_existing_subscriptions;
    }

    const response = await this.paystack.put(`/plan/${idOrCode}`, payload);
    return response.data;
  }
}

class SubscriptionService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(subscriptionData) {
    const response = await this.paystack.post('/subscription', subscriptionData);
    return response.data;
  }
}

class RefundService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(refundData) {
    const response = await this.paystack.post('/refund', refundData);
    return response.data;
  }
}

class SettlementService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/settlement', { params });
    return response.data;
  }
}

class SubaccountService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(subaccountData) {
    const response = await this.paystack.post('/subaccount', subaccountData);
    return response.data;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/subaccount', { params });
    return response.data;
  }

  async fetch(id) {
    const response = await this.paystack.get(`/subaccount/${id}`);
    return response.data;
  }

  async update(subaccountId, subaccountData) {
    const response = await this.paystack.put(`/subaccount/${subaccountId}`, subaccountData);
    return response.data;
  }
}

class PaymentPageService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(pageData) {
    const payload = {
      name: pageData.name,
    };

    // Add optional fields if provided
    if (pageData.description) payload.description = pageData.description;
    if (pageData.amount) payload.amount = Math.round(pageData.amount * 100);
    if (pageData.currency) payload.currency = pageData.currency;
    if (pageData.slug) payload.slug = pageData.slug;
    if (pageData.type) payload.type = pageData.type;
    if (pageData.plan) payload.plan = pageData.plan;
    if (pageData.fixed_amount !== undefined) payload.fixed_amount = pageData.fixed_amount;
    if (pageData.split_code) payload.split_code = pageData.split_code;
    if (pageData.metadata) payload.metadata = pageData.metadata;
    if (pageData.redirect_url) payload.redirect_url = pageData.redirect_url;
    if (pageData.success_message) payload.success_message = pageData.success_message;
    if (pageData.notification_email) payload.notification_email = pageData.notification_email;
    if (pageData.collect_phone !== undefined) payload.collect_phone = pageData.collect_phone;
    if (pageData.custom_fields) payload.custom_fields = pageData.custom_fields;

    const response = await this.paystack.post('/page', payload);
    return response.data;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/page', { params });
    return response.data;
  }

  async fetch(idOrSlug) {
    const response = await this.paystack.get(`/page/${idOrSlug}`);
    return response.data;
  }

  async update(idOrSlug, pageData) {
    const payload = {};

    if (pageData.name) payload.name = pageData.name;
    if (pageData.description !== undefined) payload.description = pageData.description;
    if (pageData.amount !== undefined) payload.amount = Math.round(pageData.amount * 100);
    if (pageData.active !== undefined) payload.active = pageData.active;

    const response = await this.paystack.put(`/page/${idOrSlug}`, payload);
    return response.data;
  }

  async checkSlugAvailability(slug) {
    const response = await this.paystack.get(`/page/check_slug_availability/${slug}`);
    return response.data;
  }

  async addProducts(pageId, productIds) {
    const payload = {
      product: productIds,
    };

    const response = await this.paystack.post(`/page/${pageId}/product`, payload);
    return response.data;
  }
}

class DedicatedAccountService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(dedicatedAccountData) {
    const response = await this.paystack.post('/dedicated_account', dedicatedAccountData);
    return response.data;
  }
}

class TransactionSplitService {
  constructor(paystack) {
    this.paystack = paystack;
  }

  async create(splitData) {
    const payload = {
      name: splitData.name,
      type: splitData.type,
      currency: splitData.currency,
      subaccounts: splitData.subaccounts,
    };

    // Add optional fields if provided
    if (splitData.bearer_type) payload.bearer_type = splitData.bearer_type;
    if (splitData.bearer_subaccount) payload.bearer_subaccount = splitData.bearer_subaccount;

    const response = await this.paystack.post('/split', payload);
    return response.data;
  }

  async list(params = {}) {
    const response = await this.paystack.get('/split', { params });
    return response.data;
  }

  async fetch(id) {
    const response = await this.paystack.get(`/split/${id}`);
    return response.data;
  }

  async update(id, splitData) {
    const payload = {};

    if (splitData.name) payload.name = splitData.name;
    if (splitData.active !== undefined) payload.active = splitData.active;
    if (splitData.bearer_type) payload.bearer_type = splitData.bearer_type;
    if (splitData.bearer_subaccount) payload.bearer_subaccount = splitData.bearer_subaccount;

    const response = await this.paystack.put(`/split/${id}`, payload);
    return response.data;
  }

  async addSubaccount(splitId, subaccountData) {
    const payload = {
      subaccount: subaccountData.subaccount,
      share: subaccountData.share,
    };

    const response = await this.paystack.post(`/split/${splitId}/subaccount/add`, payload);
    return response.data;
  }

  async removeSubaccount(splitId, subaccountCode) {
    const payload = {
      subaccount: subaccountCode,
    };

    const response = await this.paystack.post(`/split/${splitId}/subaccount/remove`, payload);
    return response.data;
  }
}

module.exports = new PaymentService();


