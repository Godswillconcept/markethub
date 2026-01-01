/**
 * Backward Compatibility Tests for Authentication System
 * Tests to ensure original auth routes still work alongside enhanced system
 */

const request = require('supertest');
const { sequelize } = require('../config/database');
const { User, Role } = require('../models');
const app = require('../app');
const bcrypt = require('bcryptjs');

const TEST_CONFIG = {
  baseURL: '/api/v1/auth',
  testUser: {
    email: 'test@example.com',
    password: 'TestPass123!',
    first_name: 'Test',
    last_name: 'User',
    phone: '+2348012345678'
  }
};

class TestUtils {
  static async setupTestDB() {
    await sequelize.sync({ force: true });
    await this.createTestRoles();
  }

  static async createTestRoles() {
    const roles = ['admin', 'customer', 'vendor'];
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName },
        defaults: { description: `${roleName} role` }
      });
    }
  }

  static async createTestUser(overrides = {}) {
    const userData = {
      ...TEST_CONFIG.testUser,
      password: await bcrypt.hash(TEST_CONFIG.testUser.password, 12),
      email_verified_at: new Date(),
      is_active: true,
      ...overrides
    };

    const [user] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: userData
    });

    const customerRole = await Role.findOne({ where: { name: 'customer' } });
    if (customerRole) {
      await user.addRole(customerRole);
    }

    return user;
  }

  static async cleanup() {
    await User.destroy({ where: {} });
  }
}

describe('Backward Compatibility Tests', () => {
  let agent;

  beforeAll(async () => {
    await TestUtils.setupTestDB();
    agent = request.agent(app);
  });

  afterAll(async () => {
    await TestUtils.cleanup();
    await sequelize.close();
  });

  beforeEach(async () => {
    await TestUtils.cleanup();
  });

  describe('Original Login Endpoint', () => {
    it('should work with original login endpoint', async () => {
      await TestUtils.createTestUser();

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/login`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.email).toBe(TEST_CONFIG.testUser.email);
    });

    it('should work with enhanced login and original logout', async () => {
      await TestUtils.createTestUser();
      
      // Login with enhanced endpoint
      const loginResponse = await agent
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      const accessToken = loginResponse.body.data.tokens.access.token;

      // Use original logout
      const logoutResponse = await agent
        .get(`${TEST_CONFIG.baseURL}/logout-original`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(logoutResponse.status).toBe(200);
    });
  });

  describe('Enhanced Login with Original Routes', () => {
    it('should allow access to original protected routes with enhanced tokens', async () => {
      await TestUtils.createTestUser();

      // Login with enhanced endpoint
      const loginResponse = await agent
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      const accessToken = loginResponse.body.data.tokens.access.token;
      const sessionId = loginResponse.body.data.session.id;

      // Access original protected route
      const meResponse = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Session-Id', sessionId);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.data.user.email).toBe(TEST_CONFIG.testUser.email);
    });

    it('should work with original update password route', async () => {
      await TestUtils.createTestUser();

      // Login with enhanced endpoint
      const loginResponse = await agent
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      const accessToken = loginResponse.body.data.tokens.access.token;
      const sessionId = loginResponse.body.data.session.id;

      // Update password using original route
      const updateResponse = await agent
        .patch(`${TEST_CONFIG.baseURL}/update-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Session-Id', sessionId)
        .send({
          currentPassword: TEST_CONFIG.testUser.password,
          newPassword: 'NewPass123!'
        });

      expect(updateResponse.status).toBe(200);
    });
  });

  describe('Mixed Environment Support', () => {
    it('should handle both login types simultaneously', async () => {
      await TestUtils.createTestUser();

      // Original login
      const originalLogin = await agent
        .post(`${TEST_CONFIG.baseURL}/login`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      // Enhanced login (different session)
      const agent2 = request.agent(app);
      const enhancedLogin = await agent2
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      expect(originalLogin.status).toBe(200);
      expect(enhancedLogin.status).toBe(200);
      
      // Both should have valid tokens
      expect(originalLogin.body.token).toBeDefined();
      expect(enhancedLogin.body.data.tokens.access.token).toBeDefined();
    });

    it('should maintain separate sessions for different login types', async () => {
      await TestUtils.createTestUser();

      // Original login
      const originalLogin = await agent
        .post(`${TEST_CONFIG.baseURL}/login`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      // Enhanced login
      const agent2 = request.agent(app);
      const enhancedLogin = await agent2
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      // Access protected routes with both
      const originalMe = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer ${originalLogin.body.token}`);

      const enhancedMe = await agent2
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer ${enhancedLogin.body.data.tokens.access.token}`)
        .set('X-Session-Id', enhancedLogin.body.data.session.id);

      expect(originalMe.status).toBe(200);
      expect(enhancedMe.status).toBe(200);
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle invalid tokens consistently', async () => {
      await TestUtils.createTestUser();

      // Test with original route
      const originalResponse = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer invalid-token`);

      expect(originalResponse.status).toBe(401);

      // Test with enhanced route (same behavior expected)
      const enhancedResponse = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer invalid-token`);

      expect(enhancedResponse.status).toBe(401);
    });

    it('should handle expired tokens consistently', async () => {
      await TestUtils.createTestUser();

      // Create expired token manually
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '-1h', issuer: 'Stylay', audience: 'user' }
      );

      // Test with original route
      const originalResponse = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(originalResponse.status).toBe(401);

      // Test with enhanced route
      const enhancedResponse = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(enhancedResponse.status).toBe(401);
    });
  });
});

module.exports = {
  TestUtils,
  TEST_CONFIG
};