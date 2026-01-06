# Tiered Data Seeding Strategy

This document outlines the refined tiered approach for data seeding across different deployment environments. The strategy implements clear distinctions between production (lowest), staging (medium), and development (highest) data volumes.

## Overview

The seeding strategy uses environment-based conditional logic to control data volumes:

```javascript
const items = process.env.NODE_ENV === 'production' ? lowest : process.env.NODE_ENV === 'staging' ? medium : highest;
```

## Environment-Specific Data Volumes

### 1. Customer Seeder (`20250824030000-seed-customers.js`)

- **Production**: 100 customers (lowest)
- **Staging**: 500 customers (medium) 
- **Development**: 1000 customers (highest)

**Rationale**:
- Production uses minimal data for basic functionality testing
- Staging provides realistic user loads for performance testing
- Development offers comprehensive data for UI/UX and feature testing

### 2. Vendor Seeder (`20250825000000-seed-vendors.js`)

- **Production**: 5 vendors (lowest)
- **Staging**: 10 vendors (medium)
- **Development**: 20 vendors (highest)

**Rationale**:
- Production ensures basic marketplace functionality
- Staging allows for multi-vendor scenario testing
- Development provides diverse vendor data for comprehensive testing

### 3. Order Seeder (`20250901000000-seed-orders.js`)

- **Production**: 100 orders (lowest)
- **Staging**: 500 orders (medium)
- **Development**: 1000 orders (highest)

**Rationale**:
- Production covers basic order workflow testing
- Staging simulates realistic e-commerce activity
- Development provides comprehensive order data for analytics and edge case testing

### 4. Journal Seeder (`20250830000000-seed-journals.js`)

- **Production**: 5 journal entries (lowest)
- **Staging**: 10 journal entries (medium)
- **Development**: 20 journal entries (highest)

**Rationale**:
- Production provides basic content for SEO and user engagement
- Staging allows for content browsing and search functionality testing
- Development offers rich content for comprehensive CMS testing

## Implementation Pattern

All seeders follow the same conditional logic pattern:

```javascript
// Example from customer seeder
const totalCustomers = process.env.NODE_ENV === 'production' ? 100 :
                      process.env.NODE_ENV === 'staging' ? 500 : 1000;
```

## Benefits

1. **Environment Optimization**: Each environment gets data volumes appropriate for its purpose
2. **Resource Efficiency**: Production uses minimal resources while development has comprehensive data
3. **Consistent Pattern**: All seeders use the same tiered approach for maintainability
4. **Easy Scaling**: Data volumes can be adjusted by simply modifying environment variables
5. **Clear Documentation**: Each seeder includes detailed comments explaining the strategy

## Maintenance

To modify data volumes:
1. Update the conditional logic in each seeder file
2. Ensure the documentation reflects the new volumes
3. Test the changes in development before deploying to staging/production

## Future Enhancements

- Consider adding a configuration file for centralized volume management
- Implement dynamic scaling based on system resources
- Add environment-specific data quality controls

## Version History

- **2025-12-25**: Refined tiered approach with clear production/staging/development distinctions
- **2025-08-24**: Initial implementation with development/staging/production focus