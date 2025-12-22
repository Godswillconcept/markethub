const { User, Role, Vendor, Store } = require('../models');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../app');

describe('Vendor Registration - Existing Customer Upgrade', () => {
  let existingCustomer;
  let customerRole;

  beforeEach(async () => {
    // Create a test customer user
    existingCustomer = await User.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348012345678',
      password: await bcrypt.hash('password123', 12),
      email_verified_at: new Date(),
      is_active: true
    });

    // Get customer role
    customerRole = await Role.findOne({ where: { name: 'customer' } });
    
    // Assign customer role to user
    await existingCustomer.addRole(customerRole, {
      through: { created_at: new Date() }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await Vendor.destroy({ where: { user_id: existingCustomer.id } });
    await Store.destroy({ where: { id: existingCustomer.id } });
    await existingCustomer.destroy();
  });

  test('should allow existing customer to upgrade to vendor', async () => {
    const vendorData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348012345678',
      business_name: 'Doe Enterprises',
      cac_number: 'RC/1234567',
      instagram_handle: '@doeenterprises',
      facebook_handle: 'doeenterprises',
      twitter_handle: '@doeenterprises',
      join_reason: 'Expand customer reach'
    };

    const response = await request(app)
      .post('/api/v1/vendors/register')
      .send(vendorData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('Vendor upgrade successful');
    expect(response.body.data.type).toBe('upgrade');

    // Verify user still exists and has both roles
    const updatedUser = await User.findByPk(existingCustomer.id, {
      include: [{ model: Role, as: 'roles' }]
    });

    expect(updatedUser).toBeTruthy();
    const roleNames = updatedUser.roles.map(role => role.name);
    expect(roleNames).toContain('customer');
    expect(roleNames).toContain('vendor');

    // Verify vendor record was created
    const vendor = await Vendor.findOne({ where: { user_id: existingCustomer.id } });
    expect(vendor).toBeTruthy();
    expect(vendor.status).toBe('pending');

    // Verify store was created
    const store = await Store.findByPk(vendor.store_id);
    expect(store).toBeTruthy();
    expect(store.business_name).toBe('Doe Enterprises');
  });

  test('should not allow existing vendor to register again', async () => {
    // First, upgrade the customer to vendor
    const vendorData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348012345678',
      business_name: 'Doe Enterprises',
      cac_number: 'RC/1234567',
      join_reason: 'Expand customer reach'
    };

    await request(app)
      .post('/api/v1/vendors/register')
      .send(vendorData)
      .expect(201);

    // Try to register again with same email
    const response = await request(app)
      .post('/api/v1/vendors/register')
      .send({
        ...vendorData,
        business_name: 'Doe Enterprises 2'
      })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('already registered as a vendor');
  });

  test('should not allow user with other roles to register as vendor', async () => {
    // Add admin role to the customer
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    await existingCustomer.addRole(adminRole, {
      through: { created_at: new Date() }
    });

    const vendorData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348012345678',
      business_name: 'Doe Enterprises',
      cac_number: 'RC/1234567',
      join_reason: 'Expand customer reach'
    };

    const response = await request(app)
      .post('/api/v1/vendors/register')
      .send(vendorData)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('already registered with a different account type');
  });
});