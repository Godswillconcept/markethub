/**
 * Enhanced Authentication System Test Suite
 * Tests for refresh token system, session management, and token blacklisting
 */

const request = require('supertest');
const { sequelize } = require('../config/database');
const { User, Role, RefreshToken, UserSession, TokenBlacklistEnhanced } = require('../models');
const app = require('../../app'); // Your main app file
const bcrypt = require('bcryptjs');
const tokenBlacklistEnhancedService = require('../services/token-blacklist-enhanced.service');
const cleanupService = require('../services/cleanup.service');

// Test configuration
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

// Test utilities
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

    // Assign customer role
    const customerRole = await Role.findOne({ where: { name: 'customer' } });
    if (customerRole) {
      await user.addRole(customerRole);
    }

    return user;
  }

  static async cleanup() {
    await UserSession.destroy({ where: {} });
    await RefreshToken.destroy({ where: {} });
    await TokenBlacklistEnhanced.destroy({ where: {} });
    await User.destroy({ where: {} });
  }

  static async loginTestUser(agent) {
    const response = await agent
      .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
      .send({
        email: TEST_CONFIG.testUser.email,
        password: TEST_CONFIG.testUser.password
      });

    return response.body;
  }

  static generateMockRequest(userAgent = 'TestAgent/1.0', ip = '127.0.0.1') {
    return {
      get: (header) => {
        if (header === 'User-Agent') return userAgent;
        return null;
      },
      ip: ip,
      connection: { remoteAddress: ip }
    };
  }
}

// Test Suite
describe('Enhanced Authentication System', () => {
  let agent;

  beforeAll(async () => {
    await TestUtils.setupTestDB();
    agent = request.agent(app);
  }, 30000);

  afterAll(async () => {
    await TestUtils.cleanup();
    await sequelize.close();
  }, 30000);

  beforeEach(async () => {
    await TestUtils.cleanup();
  }, 10000);

  describe('Enhanced Login with Refresh Tokens', () => {
    it('should login and return access token, refresh token, and session', async () => {
      await TestUtils.createTestUser();

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tokens.access.token).toBeDefined();
      expect(response.body.data.tokens.access.expires_in).toBe(900);
      expect(response.body.data.tokens.refresh.token).toBeDefined();
      expect(response.body.data.session.id).toBeDefined();
      expect(response.body.data.session.device_info).toBeDefined();
    }, 10000);

    it('should create session and refresh token in database', async () => {
      await TestUtils.createTestUser();

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      const sessionId = response.body.data.session.id;
      const refreshToken = response.body.data.tokens.refresh.token;

      // Check session exists
      const session = await UserSession.findByPk(sessionId);
      expect(session).toBeDefined();
      expect(session.user_id).toBe(response.body.data.user.id);

      // Check refresh token exists
      const tokenHash = RefreshToken.generateTokenHash(refreshToken);
      const tokenRecord = await RefreshToken.findByTokenHash(tokenHash);
      expect(tokenRecord).toBeDefined();
      expect(tokenRecord.user_id).toBe(response.body.data.user.id);
      expect(tokenRecord.session_id).toBe(sessionId);
    }, 10000);

    it('should enforce session limit per user', async () => {
      await TestUtils.createTestUser();

      // Create 5 sessions (default limit)
      for (let i = 0; i < 6; i++) {
        const agent = request.agent(app);
        await agent
          .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
          .send({
            email: TEST_CONFIG.testUser.email,
            password: TEST_CONFIG.testUser.password
          });
      }

      // Check that only 5 sessions are active
      const activeSessions = await UserSession.count({
        where: { user_id: 1, is_active: true }
      });

      expect(activeSessions).toBeLessThanOrEqual(5);
    }, 15000);
  });

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/refresh`)
        .send({
          refresh_token: loginData.data.tokens.refresh.token,
          session_id: loginData.data.session.id
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.access.token).toBeDefined();
      expect(response.body.data.refresh.token).toBeDefined();
      expect(response.body.data.refresh.token).not.toBe(loginData.data.tokens.refresh.token); // Token rotation
    }, 10000);

    it('should reject blacklisted refresh token', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      // Blacklist the refresh token
      await TokenBlacklistEnhanced.blacklistToken(
        RefreshToken.generateTokenHash(loginData.data.tokens.refresh.token),
        'refresh',
        Date.now() + 86400000,
        { reason: 'test', userId: 1, sessionId: loginData.data.session.id }
      );

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/refresh`)
        .send({
          refresh_token: loginData.data.tokens.refresh.token,
          session_id: loginData.data.session.id
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('TOKEN_REVOKED');
    }, 10000);

    it('should reject expired session', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      // Expire the session
      await UserSession.update(
        { expires_at: new Date(Date.now() - 1000) },
        { where: { id: loginData.data.session.id } }
      );

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/refresh`)
        .send({
          refresh_token: loginData.data.tokens.refresh.token,
          session_id: loginData.data.session.id
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toContain('Session is invalid or expired');
    }, 10000);
  });

  describe('Session Management', () => {
    it('should get user sessions', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      const response = await agent
        .get(`${TEST_CONFIG.baseURL}/sessions`)
        .set('Authorization', `Bearer ${loginData.data.tokens.access.token}`)
        .set('X-Session-Id', loginData.data.session.id);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.current_session).toBeDefined();
      expect(response.body.data.current_session.id).toBe(loginData.data.session.id);
    }, 10000);

    it('should revoke specific session', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      // Create another session
      const agent2 = request.agent(app);
      const loginData2 = await TestUtils.loginTestUser(agent2);

      // Revoke second session
      const response = await agent
        .delete(`${TEST_CONFIG.baseURL}/sessions/${loginData2.data.session.id}`)
        .set('Authorization', `Bearer ${loginData.data.tokens.access.token}`);

      expect(response.status).toBe(200);

      // Verify session is inactive
      const session = await UserSession.findByPk(loginData2.data.session.id);
      expect(session.is_active).toBe(false);
    }, 10000);

    it('should revoke all sessions except current', async () => {
      await TestUtils.createTestUser();

      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 3; i++) {
        const agent = request.agent(app);
        const loginData = await TestUtils.loginTestUser(agent);
        sessions.push(loginData.data.session.id);
      }

      // Revoke all except first
      const response = await agent
        .delete(`${TEST_CONFIG.baseURL}/sessions`)
        .set('Authorization', `Bearer ${sessions[0].access_token}`)
        .set('X-Session-Id', sessions[0]);

      expect(response.status).toBe(200);

      // Check that only first session is active
      const activeSessions = await UserSession.count({
        where: { is_active: true }
      });

      expect(activeSessions).toBe(1);
    }, 15000);
  });

  describe('Enhanced Logout', () => {
    it('should blacklist access token on logout', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/logout`)
        .set('Authorization', `Bearer ${loginData.data.tokens.access.token}`)
        .send({
          session_id: loginData.data.session.id
        });

      expect(response.status).toBe(200);

      // Verify token is blacklisted
      const isBlacklisted = await tokenBlacklistEnhancedService.isTokenBlacklisted(
        loginData.data.tokens.access.token
      );
      expect(isBlacklisted).toBe(true);
    }, 10000);

    it('should logout all devices', async () => {
      await TestUtils.createTestUser();

      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 3; i++) {
        const agent = request.agent(app);
        const loginData = await TestUtils.loginTestUser(agent);
        sessions.push(loginData);
      }

      // Logout all devices
      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/logout`)
        .set('Authorization', `Bearer ${sessions[0].data.tokens.access.token}`)
        .send({ logout_all: true });

      expect(response.status).toBe(200);

      // Verify all sessions are inactive
      const activeSessions = await UserSession.count({
        where: { is_active: true }
      });
      expect(activeSessions).toBe(0);

      // Verify all refresh tokens are inactive
      const activeTokens = await RefreshToken.count({
        where: { is_active: true }
      });
      expect(activeTokens).toBe(0);
    }, 15000);
  });

  describe('Token Statistics', () => {
    it('should return token and session statistics', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      const response = await agent
        .get(`${TEST_CONFIG.baseURL}/token-stats`)
        .set('Authorization', `Bearer ${loginData.data.tokens.access.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.sessions).toBeDefined();
      expect(response.body.data.tokens.active).toBeGreaterThan(0);
      expect(response.body.data.sessions.active).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Security Features', () => {
    it('should reject token with invalid signature', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      // Create invalid token
      const invalidToken = loginData.data.tokens.access.token.slice(0, -5) + 'xxxxx';

      const response = await agent
        .get(`${TEST_CONFIG.baseURL}/me`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    }, 10000);

    it('should handle concurrent token refresh attempts', async () => {
      await TestUtils.createTestUser();
      const loginData = await TestUtils.loginTestUser(agent);

      // Make multiple refresh requests simultaneously
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          agent
            .post(`${TEST_CONFIG.baseURL}/refresh`)
            .send({
              refresh_token: loginData.data.tokens.refresh.token,
              session_id: loginData.data.session.id
            })
        );
      }

      const results = await Promise.all(promises);
      
      // At least one should succeed
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    }, 15000);

    it('should enforce rate limiting', async () => {
      await TestUtils.createTestUser();

      // Make many login attempts
      const promises = [];
      for (let i = 0; i < 110; i++) {
        promises.push(
          agent
            .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
            .send({
              email: TEST_CONFIG.testUser.email,
              password: TEST_CONFIG.testUser.password
            })
        );
      }

      const results = await Promise.all(promises);
      const rateLimitedCount = results.filter(r => r.status === 429).length;
      
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 20000);
  });

  describe('Device Fingerprinting', () => {
    it('should capture device information on login', async () => {
      await TestUtils.createTestUser();

      const response = await agent
        .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .send({
          email: TEST_CONFIG.testUser.email,
          password: TEST_CONFIG.testUser.password
        });

      expect(response.body.data.session.device_info).toMatchObject({
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop',
        userAgent: expect.any(String)
      });
    }, 10000);
  });

  describe('Cleanup Service', () => {
    it('should clean up expired tokens and sessions', async () => {
      // Create expired data
      const expiredDate = new Date(Date.now() - 86400000);
      
      await UserSession.create({
        id: 'expired-session',
        user_id: 1,
        device_info: {},
        expires_at: expiredDate,
        is_active: false
      });

      await RefreshToken.create({
        user_id: 1,
        token_hash: 'expired-token-hash',
        session_id: 'expired-session',
        device_info: {},
        expires_at: expiredDate,
        is_active: false
      });

      await TokenBlacklistEnhanced.create({
        token_hash: 'expired-blacklist',
        token_type: 'access',
        token_expiry: Date.now() - 1000,
        reason: 'test'
      });

      // Run cleanup
      const result = await cleanupService.cleanupExpiredTokens();

      expect(result.refreshTokenCount).toBeGreaterThan(0);
      expect(result.sessionCount).toBeGreaterThan(0);
      expect(result.blacklistCount).toBeGreaterThan(0);
    }, 10000);
  });
});

// Integration test for complete flow
describe('Complete Authentication Flow Integration', () => {
  beforeAll(async () => {
    await TestUtils.setupTestDB();
  }, 30000);

  afterAll(async () => {
    await TestUtils.cleanup();
    await sequelize.close();
  }, 30000);

  it('should handle complete authentication lifecycle', async () => {
    // 1. Create user
    await TestUtils.createTestUser();

    // 2. Login
    const agent = request.agent(app);
    const loginResponse = await agent
      .post(`${TEST_CONFIG.baseURL}/login-enhanced`)
      .send({
        email: TEST_CONFIG.testUser.email,
        password: TEST_CONFIG.testUser.password
      });

    expect(loginResponse.status).toBe(200);
    const { access, refresh } = loginResponse.body.data.tokens;
    const sessionId = loginResponse.body.data.session.id;

    // 3. Access protected resource
    const meResponse = await agent
      .get(`${TEST_CONFIG.baseURL}/me`)
      .set('Authorization', `Bearer ${access.token}`)
      .set('X-Session-Id', sessionId);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user.email).toBe(TEST_CONFIG.testUser.email);

    // 4. Refresh tokens
    const refreshResponse = await agent
      .post(`${TEST_CONFIG.baseURL}/refresh`)
      .send({
        refresh_token: refresh.token,
        session_id: sessionId
      });

    expect(refreshResponse.status).toBe(200);
    const newAccess = refreshResponse.body.data.access.token;
    const newRefresh = refreshResponse.body.data.refresh.token;

    // 5. Use new access token
    const meResponse2 = await agent
      .get(`${TEST_CONFIG.baseURL}/me`)
      .set('Authorization', `Bearer ${newAccess}`)
      .set('X-Session-Id', sessionId);

    expect(meResponse2.status).toBe(200);

    // 6. Get sessions
    const sessionsResponse = await agent
      .get(`${TEST_CONFIG.baseURL}/sessions`)
      .set('Authorization', `Bearer ${newAccess}`)
      .set('X-Session-Id', sessionId);

    expect(sessionsResponse.status).toBe(200);
    expect(sessionsResponse.body.data.current_session.id).toBe(sessionId);

    // 7. Logout
    const logoutResponse = await agent
      .post(`${TEST_CONFIG.baseURL}/logout`)
      .set('Authorization', `Bearer ${newAccess}`)
      .send({ session_id: sessionId });

    expect(logoutResponse.status).toBe(200);

    // 8. Verify old access token is blacklisted
    const isBlacklisted = await tokenBlacklistEnhancedService.isTokenBlacklisted(newAccess);
    expect(isBlacklisted).toBe(true);

    // 9. Verify session is inactive
    const session = await UserSession.findByPk(sessionId);
    expect(session.is_active).toBe(false);

    // 10. Verify refresh token is inactive
    const tokenHash = RefreshToken.generateTokenHash(newRefresh);
    const tokenRecord = await RefreshToken.findByTokenHash(tokenHash);
    expect(tokenRecord.is_active).toBe(false);
  }, 30000);
});

// Export test utilities for other test files
module.exports = {
  TestUtils,
  TEST_CONFIG
};