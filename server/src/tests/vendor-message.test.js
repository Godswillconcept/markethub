const request = require('supertest');
const { app, db } = require('../app');
const { VendorMessage, User } = db;

describe('Vendor Message API', () => {
  let authToken;
  let vendorId;

  beforeAll(async () => {
    // Connect to database
    await db.sequelize.sync({ force: false });
  });

  afterAll(async () => {
    // Clean up
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // Create a test vendor user
    const vendor = await User.create({
      first_name: 'Test',
      last_name: 'Vendor',
      email: 'vendor@example.com',
      phone: '+1234567890',
      password: 'password123'
    });
    vendorId = vendor.id;

    // Mock auth token (in real test, you'd generate a proper JWT)
    authToken = 'mock_token';
  });

  afterEach(async () => {
    // Clean up test data
    await VendorMessage.destroy({ where: {} });
    await User.destroy({ where: { email: 'vendor@example.com' } });
  });

  describe('POST /api/v1/vendor-messages', () => {
    it('should create a new vendor message', async () => {
      const messageData = {
        full_name: 'Test Vendor',
        phone_number: '+1234567890',
        topic: 'Product Support',
        message: 'I need help with my product listing'
      };

      const response = await request(app)
        .post('/api/v1/vendor-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reference_number).toMatch(/^VM-/);
      expect(response.body.data.status).toBe('open');

      // Verify in database
      const savedMessage = await VendorMessage.findByPk(response.body.data.id);
      expect(savedMessage).toBeTruthy();
      expect(savedMessage.full_name).toBe(messageData.full_name);
      expect(savedMessage.topic).toBe(messageData.topic);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/vendor-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'Product Support'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/vendor-messages', () => {
    it('should get vendor messages', async () => {
      // Create test messages
      await VendorMessage.create({
        vendor_id: vendorId,
        full_name: 'Test Vendor',
        phone_number: '+1234567890',
        topic: 'Product Support',
        message: 'Test message 1'
      });

      await VendorMessage.create({
        vendor_id: vendorId,
        full_name: 'Test Vendor',
        phone_number: '+1234567890',
        topic: 'Technical Issue',
        message: 'Test message 2'
      });

      const response = await request(app)
        .get('/api/v1/vendor-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/v1/vendor-messages/:id', () => {
    it('should get specific vendor message', async () => {
      const message = await VendorMessage.create({
        vendor_id: vendorId,
        full_name: 'Test Vendor',
        phone_number: '+1234567890',
        topic: 'Product Support',
        message: 'Test message'
      });

      const response = await request(app)
        .get(`/api/v1/vendor-messages/${message.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(message.id);
      expect(response.body.data.full_name).toBe('Test Vendor');
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .get('/api/v1/vendor-messages/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});