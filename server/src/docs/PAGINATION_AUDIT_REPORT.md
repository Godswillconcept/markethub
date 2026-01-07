# Dashboard Controller Pagination Audit Report

**Date:** 2026-01-05  
**Controller:** `server/src/controllers/dashboard.controller.js`  
**Audit Scope:** All methods excluding `getVendorProducts` (lines 562-640)

---

## Executive Summary

This audit identified **8 methods with pagination issues** across the dashboard controller, ranging from critical count/data mismatches to missing pagination implementations. Issues are categorized by severity and prioritized for immediate remediation.

### Severity Breakdown
- **CRITICAL:** 2 issues (immediate action required)
- **HIGH:** 3 issues (fix within 1 week)
- **MEDIUM:** 2 issues (fix within 2 weeks)
- **LOW:** 1 issue (fix within 1 month)

---

## Critical Issues

### 1. CRITICAL: getVendorEarningsBreakdown - Count/Data Mismatch After Filtering
**Location:** Lines 833-942  
**Severity:** CRITICAL  
**Impact:** Pagination metadata is incorrect, causing frontend pagination failures

#### Issue Description
The method filters data AFTER the database query (lines 889-891), but uses the original unfiltered `count` for pagination metadata. This creates a mismatch where:
- `count` includes all OrderItem records
- `data` array contains only filtered records (those with valid Order and Product)
- Pagination metadata shows incorrect totalPages, totalItems, hasNextPage, hasPrevPage

#### Root Cause
```javascript
// Line 849: Query returns count of ALL matching records
const { count, rows: earnings } = await db.OrderItem.findAndCountAll({
  where: { vendor_id: vendorId },
  // ... includes with required: true
});

// Lines 889-891: Post-query filtering removes invalid records
const validEarnings = earnings.filter(earning => {
  return earning.order && earning.product && earning.order.id && earning.product.id;
});

// Line 935: Uses original count (includes filtered-out records)
const response = createPaginationResponse(
  earningsWithPayouts,  // filtered data
  page,
  limit,
  count  // ❌ WRONG: includes filtered records
);
```

#### Recommended Fix
Use `distinct: true` and ensure all required associations are properly filtered in the database query:

```javascript
const getVendorEarningsBreakdown = catchAsync(async (req, res, next) => {
  const vendor = await db.Vendor.findOne({
    where: { user_id: req.user.id },
  });

  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  const vendorId = vendor.id;
  const { page = 1, limit = 20 } = req.query;
  const { limit: limitNum, offset } = paginate(page, limit);

  // ✅ FIX: Use subquery to filter valid records in database
  const { count, rows: earnings } = await db.OrderItem.findAndCountAll({
    where: {
      vendor_id: vendorId,
      // ✅ FIX: Ensure Order exists and is paid at database level
      order_id: {
        [Op.in]: literal(`
          SELECT o.id 
          FROM orders o 
          WHERE o.payment_status = 'paid'
        `)
      },
      // ✅ FIX: Ensure Product exists at database level
      product_id: {
        [Op.in]: literal(`
          SELECT p.id 
          FROM products p 
          WHERE p.id IS NOT NULL
        `)
      }
    },
    include: [
      {
        model: db.Order,
        as: "order",
        where: { payment_status: "paid" },
        attributes: ["id", "order_date", "total_amount", "payment_status", "order_status"],
        required: true, // ✅ Already correct
      },
      {
        model: db.Product,
        as: "product",
        attributes: ["id", "name", "price", "thumbnail"],
        required: true, // ✅ Already correct
      },
    ],
    attributes: [
      "id", "order_id", "product_id", "vendor_id",
      "quantity", "price", "sub_total", "created_at", "updated_at",
    ],
    order: [["created_at", "DESC"]],
    limit: limitNum,
    offset,
    distinct: true, // ✅ ADD THIS: Prevents duplicate rows
  });

  // ✅ FIX: Remove post-query filtering since database handles it
  // const validEarnings = earnings.filter(...); // ❌ DELETE THIS

  // Get payout dates for all earnings
  const payoutRecords = await db.Payout.findAll({
    where: { vendor_id: vendorId, status: "paid" },
    attributes: ["payout_date"],
    order: [["payout_date", "ASC"]],
  });

  const sortedPayoutDates = payoutRecords
    .map((p) => (p.payout_date ? new Date(p.payout_date) : null))
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime());

  const earningsWithPayouts = earnings.map((earning) => {
    const earningCreatedAt = new Date(earning.created_at);
    let payoutDate = null;

    for (const pDate of sortedPayoutDates) {
      if (earningCreatedAt <= pDate) {
        payoutDate = pDate.toISOString();
        break;
      }
    }

    return {
      date: earning.created_at,
      product: earning.product.name,
      orderId: earning.order.id,
      earnings: parseFloat(earning.sub_total || 0).toFixed(2),
      units: earning.quantity || 0,
      payoutDate,
    };
  });

  // ✅ FIX: count now matches data length
  const response = createPaginationResponse(
    earningsWithPayouts,
    page,
    limit,
    count  // ✅ CORRECT: matches filtered data
  );
  
  res.status(200).json({
    status: "success",
    ...response,
  });
});
```

#### Testing Checklist
- [ ] Verify count matches data.length after fix
- [ ] Test with vendor having invalid order items
- [ ] Test pagination navigation (next/prev pages)
- [ ] Verify totalPages calculation accuracy

---

### 2. CRITICAL: getVendorOverview - Count/Data Mismatch with GROUP BY
**Location:** Lines 2390-2656  
**Severity:** CRITICAL  
**Impact:** Pagination metadata incorrect, products breakdown shows wrong total count

#### Issue Description
The method uses `findAndCountAll` with `group: ["Product.id"]` and `subQuery: false`, which causes Sequelize to return an array for `count` instead of a single number. The pagination metadata uses `totalProducts` (from a separate count query) instead of the actual count from the paginated query.

#### Root Cause
```javascript
// Lines 2507-2542: Query with GROUP BY
const { count: totalPaginatedProducts, rows: vendorProducts } =
  await db.Product.findAndCountAll({
    where: { vendor_id: vendorID },
    // ... includes
    group: ["Product.id"],  // ❌ Causes count to be array
    subQuery: false,  // ❌ Required for GROUP BY but affects count
    limit: limitNum,
    offset: offset,
  });

// Lines 2642-2649: Uses separate totalProducts for pagination
products_pagination: {
  currentPage: parseInt(page),
  totalPages: Math.ceil(totalProducts / limitNum),  // ❌ WRONG: totalProducts from separate query
  totalItems: totalProducts,  // ❌ WRONG: doesn't match paginated query
  itemsPerPage: parseInt(limit),
  hasNextPage: page < Math.ceil(totalProducts / limitNum),
  hasPrevPage: page > 1,
}
```

#### Recommended Fix
Use separate count query for accurate pagination:

```javascript
const getVendorOverview = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const vendorID = parseInt(vendorId);
  if (isNaN(vendorID) || vendorID <= 0) {
    return next(new AppError("Invalid vendor ID", 400));
  }

  const { limit: limitNum, offset } = paginate(page, limit);

  // Get vendor basic information
  const vendor = await db.Vendor.findOne({
    where: { id: vendorID },
    include: [
      {
        model: db.User,
        attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
      },
      {
        model: db.Store,
        as: "store",
        attributes: ["id", "business_name", "cac_number"],
      },
    ],
  });

  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  // Calculate overall metrics
  const [
    totalSales,
    totalPayouts,
    productTagsCount,
    totalProducts,
    totalViews,
  ] = await Promise.all([
    db.OrderItem.sum("sub_total", {
      where: { vendor_id: vendorID },
      include: [
        {
          model: db.Order,
          as: "order",
          where: { payment_status: "paid" },
        },
      ],
    }).then((val) => val || 0),
    db.Payout.count({
      where: { vendor_id: vendorID, status: "paid" },
    }),
    db.VendorProductTag.count({
      where: { vendor_id: vendorID },
    }),
    db.Product.count({
      where: { vendor_id: vendorID },
    }),
    db.Product.sum("impressions", {
      where: { vendor_id: vendorID },
    }).then((val) => val || 0),
  ]);

  const earningsConversion = totalViews > 0 ? (totalSales / totalViews).toFixed(2) : "0.00";
  const salesConversion = earningsConversion;

  // Get monthly ratings
  const monthlyRatings = await db.Review.findAll({
    attributes: [
      [literal("DATE_FORMAT(`Review`.`created_at`, '%Y-%m')"), "month"],
      [fn("AVG", col("Review.rating")), "average_rating"],
      [fn("COUNT", col("Review.id")), "total_reviews"],
    ],
    include: [{
      model: db.Product,
      as: 'product',
      where: { vendor_id: vendorID },
      attributes: [],
      required: true
    }],
    group: [literal("DATE_FORMAT(`Review`.`created_at`, '%Y-%m')")],
    order: [[literal("DATE_FORMAT(Review.created_at, '%Y-%m')"), "DESC"]],
    limit: 12,
    raw: true,
  }).catch((error) => {
    console.error("[DEBUG] Error in monthly ratings query:", error.message);
    throw error;
  });

  const formattedMonthlyRatings = monthlyRatings.map((rating) => ({
    month: rating.month,
    average_rating: parseFloat(rating.average_rating).toFixed(1),
    total_reviews: parseInt(rating.total_reviews),
  }));

  // ✅ FIX: Separate count query for accurate pagination
  const productsBreakdownCount = await db.Product.count({
    where: { vendor_id: vendorID },
  });

  // Get products breakdown with pagination
  const vendorProducts = await db.Product.findAll({
    where: { vendor_id: vendorID },
    attributes: [
      "id", "name", "sold_units", "impressions", "updated_at",
      [literal("COALESCE(AVG(`reviews`.`rating`), 0)"), "average_rating"],
    ],
    include: [
      {
        model: db.Review,
        as: "reviews",
        attributes: [],
        required: false,
      },
      {
        model: db.Supply,
        attributes: ["id"],
        required: false,
      },
    ],
    group: ["Product.id"],
    subQuery: false,
    raw: false,
    limit: limitNum,
    offset: offset,
  }).catch((error) => {
    console.error("[DEBUG] Error in products breakdown query:", error.message);
    throw error;
  });

  // Get stock data separately for each product
  var productIds = vendorProducts.map((p) => p.id);
  const stockData = await Promise.all(
    productIds.map(async (productId) => {
      const totalStock = (await db.VariantCombination.sum("stock", {
        where: { product_id: productId },
      })) || 0;
      return { product_id: productId, total_stock: totalStock };
    })
  );

  const stockMap = new Map();
  stockData.forEach((item) => {
    stockMap.set(item.product_id, item.total_stock);
  });

  // Get sales data for each product
  productIds = vendorProducts.map((p) => p.id);
  const productSales = await Promise.all(
    productIds.map(async (productId) => {
      const sales = (await db.OrderItem.sum("sub_total", {
        where: { product_id: productId },
        include: [
          {
            model: db.Order,
            as: "order",
            where: { payment_status: "paid" },
          },
        ],
      })) || 0;

      const supplyCount = await db.Supply.count({
        where: { product_id: productId },
      });

      return {
        product_id: productId,
        total_sales: parseFloat(sales).toFixed(2),
        supplied_count: supplyCount,
      };
    })
  );

  const salesMap = new Map();
  const supplyMap = new Map();
  productSales.forEach((item) => {
    salesMap.set(item.product_id, item.total_sales);
    supplyMap.set(item.product_id, item.supplied_count);
  });

  const productsBreakdown = vendorProducts.map((product) => ({
    product_id: product.id,
    product_name: product.name,
    units_sold: product.sold_units || 0,
    supplied_count: supplyMap.get(product.id) || 0,
    stock_status: stockMap.get(product.id) || 0,
    total_sales: salesMap.get(product.id) || "0.00",
    views: product.impressions || 0,
    average_rating: product.average_rating
      ? parseFloat(product.average_rating).toFixed(1)
      : 0,
    last_updated: product.updated_at,
  }));

  const response = {
    vendor_info: {
      id: vendor.id,
      name: vendor.User
        ? `${vendor.User.first_name || ""} ${vendor.User.last_name || ""}`.trim() || "Unknown Vendor"
        : "Unknown Vendor",
      profile_image: vendor.User.profile_image,
      business_name: vendor.store?.business_name || "Unknown Business",
      email: vendor.User?.email || "No Email",
      phone: vendor.User?.phone || "No Phone",
      cac_number: vendor.store?.cac_number || "No CAC Number",
      status: vendor.status,
      date_joined: vendor.approved_at,
    },
    overall_metrics: {
      total_sales: parseFloat(totalSales).toFixed(2),
      total_earnings: parseFloat(totalSales).toFixed(2),
      total_payouts: totalPayouts,
      product_tags_count: productTagsCount,
      total_products: totalProducts,
      total_views: totalViews,
      earnings_conversion: earningsConversion,
      sales_conversion: salesConversion,
    },
    monthly_ratings: formattedMonthlyRatings,
    products_breakdown: productsBreakdown,
    products_pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(productsBreakdownCount / limitNum),  // ✅ FIXED
      totalItems: productsBreakdownCount,  // ✅ FIXED
      itemsPerPage: parseInt(limit),
      hasNextPage: page < Math.ceil(productsBreakdownCount / limitNum),  // ✅ FIXED
      hasPrevPage: page > 1,
    },
  };

  res.status(200).json({
    status: "success",
    data: response,
  });
});
```

#### Testing Checklist
- [ ] Verify products_pagination.totalItems matches actual products count
- [ ] Test pagination navigation through all pages
- [ ] Verify totalPages calculation with different limit values
- [ ] Test with vendors having 0 products

---

## High Severity Issues

### 3. HIGH: getTrendingNow - Missing Pagination Implementation
**Location:** Lines 232-302  
**Severity:** HIGH  
**Impact:** Cannot paginate through trending products, returns all results in single response

#### Issue Description
The method accepts `limit` and `page` parameters but doesn't implement proper pagination. It only applies a limit without offset, making it impossible to navigate through pages of results.

#### Root Cause
```javascript
// Lines 233-234: Accepts page parameter but doesn't use it
const { limit = 10, page = 1 } = req.query;
const limitNum = Math.max(1, Math.min(parseInt(limit) || 10, 50));

// Lines 240-296: Query only uses limit, no offset
const products = await db.Product.findAll({
  // ... attributes and includes
  limit: limitNum,  // ❌ No offset parameter
  // Missing: offset calculation
});
```

#### Recommended Fix
Implement proper pagination with offset:

```javascript
const getTrendingNow = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;
  const { limit: limitNum, offset } = paginate(page, limit); // ✅ ADD THIS
  
  const limitForQuery = Math.max(1, Math.min(limitNum, 50));
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // ✅ FIX: Use findAndCountAll for pagination metadata
  const { count, rows: products } = await db.Product.findAndCountAll({
    attributes: [
      "id", "vendor_id", "category_id", "name", "slug", "description",
      "thumbnail", "price", "discounted_price", "sku", "status",
      "impressions", "sold_units", "created_at", "updated_at",
      [
        literal(`(
          SELECT COUNT(DISTINCT oi.order_id)
          FROM order_items oi
          INNER JOIN orders o ON oi.order_id = o.id
          WHERE oi.product_id = Product.id
            AND o.payment_status = 'paid'
            AND oi.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        )`),
        "recent_sales"
      ],
    ],
    include: [
      {
        model: db.Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      },
      {
        model: db.Vendor,
        as: "vendor",
        attributes: ["id"],
        include: [
          {
            model: db.User,
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      },
    ],
    where: {
      status: "active",
    },
    order: [
      [literal("recent_sales"), "DESC"],
      ["impressions", "DESC"],
    ],
    limit: limitForQuery,
    offset,  // ✅ ADD THIS: Enable pagination
    distinct: true,  // ✅ ADD THIS: Prevent duplicates
  });

  // ✅ FIX: Return paginated response
  const response = createPaginationResponse(products, page, limit, count);
  
  res.status(200).json({
    status: "success",
    ...response,
  });
});
```

#### Testing Checklist
- [ ] Test pagination through multiple pages
- [ ] Verify count matches total trending products
- [ ] Test with limit values at boundaries (1, 50)
- [ ] Verify recent_sales calculation accuracy

---

### 4. HIGH: getVendorOnboardingStats - Count/Data Mismatch with HAVING Clause
**Location:** Lines 2743-3006  
**Severity:** HIGH  
**Impact:** Pagination count may be incorrect when using HAVING filters

#### Issue Description
The method uses `findAndCountAll` with a `having` clause and `subQuery: false`. When HAVING is used with GROUP BY, Sequelize may return an array for count instead of a single number, causing pagination issues.

#### Root Cause
```javascript
// Lines 2921-2951: Query with HAVING clause
const { count, rows: vendors } = await db.Vendor.findAndCountAll({
  attributes: [
    "id", "user_id", "store_id", "join_reason", "status", "approved_at",
    [totalEarningsLiteral, "total_earnings"],
    [productTagsLiteral, "product_tags_count"]
  ],
  // ... includes
  having: Object.keys(havingClause).length > 0 ? havingClause : undefined,  // ❌ May cause count issues
  order,
  limit: limitNum,
  offset,
  subQuery: false,  // ❌ Required for HAVING but affects count
});

// Lines 2957-2962: Handle array count
let totalFiltered = 0;
if (Array.isArray(count)) {
  totalFiltered = count.length;  // ❌ Workaround, but may not be accurate
} else {
  totalFiltered = count;
}
```

#### Recommended Fix
Use separate count query when HAVING clause is present:

```javascript
const getVendorOnboardingStats = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    dateFrom,
    dateTo,
    minEarnings,
    maxEarnings,
    minProductTags,
    maxProductTags,
    sortBy = "approved_at",
    sortOrder = "DESC",
  } = req.query;

  const { limit: limitNum, offset } = paginate(page, limit);

  const validStatuses = ["approved", "pending", "rejected", "suspended", "deactivated"];
  const validSortFields = [
    "approved_at", "vendor_name", "business_name",
    "total_earnings", "product_tags_count", "date_joined",
  ];
  const validSortOrders = ["ASC", "DESC"];

  const whereClause = {};
  const storeWhereClause = {};

  if (status && validStatuses.includes(status)) {
    if (status === "deactivated") {
      storeWhereClause[Op.or] = [
        { is_verified: false },
        { is_verified: null },
        { status: 0 }
      ];
    } else if (status === "suspended") {
      whereClause.status = "approved";
      storeWhereClause[Op.or] = [
        { is_verified: false },
        { is_verified: null },
        { status: 0 }
      ];
    } else {
      whereClause.status = status;
    }
  } else if (!status) {
    whereClause.status = "approved";
  }

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    if (!isNaN(fromDate.getTime())) {
      whereClause.approved_at = {
        ...whereClause.approved_at,
        [Op.gte]: fromDate,
      };
    }
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    if (!isNaN(toDate.getTime())) {
      whereClause.approved_at = {
        ...whereClause.approved_at,
        [Op.lt]: toDate,
      };
    }
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    whereClause[Op.or] = [
      { "$User.first_name$": { [Op.like]: `%${searchTerm}%` } },
      { "$User.last_name$": { [Op.like]: `%${searchTerm}%` } },
      { "$User.email$": { [Op.like]: `%${searchTerm}%` } },
      { "$store.business_name$": { [Op.like]: `%${searchTerm}%` } },
    ];
  }

  const totalEarningsLiteral = literal(`(
    SELECT COALESCE(SUM(oi.sub_total), 0)
    FROM \`order_items\` AS oi
    INNER JOIN \`orders\` AS o ON oi.order_id = o.id
    WHERE oi.vendor_id = \`Vendor\`.\`id\`
    AND o.payment_status = 'paid'
  )`);

  const productTagsLiteral = literal(`(
    SELECT COUNT(*)
    FROM \`vendor_product_tags\` AS vpt
    WHERE vpt.vendor_id = \`Vendor\`.\`id\`
  )`);

  const havingClause = {};
  
  if (minEarnings !== undefined) {
    const minEarn = parseFloat(minEarnings);
    if (!isNaN(minEarn)) {
      havingClause.total_earnings = { [Op.gte]: minEarn };
    }
  }

  if (maxEarnings !== undefined) {
    const maxEarn = parseFloat(maxEarnings);
    if (!isNaN(maxEarn)) {
      havingClause.total_earnings = {
        ...havingClause.total_earnings,
        [Op.lte]: maxEarn,
      };
    }
  }

  if (minProductTags !== undefined) {
    const minTags = parseInt(minProductTags);
    if (!isNaN(minTags)) {
      havingClause.product_tags_count = { [Op.gte]: minTags };
    }
  }

  if (maxProductTags !== undefined) {
    const maxTags = parseInt(maxProductTags);
    if (!isNaN(maxTags)) {
      havingClause.product_tags_count = {
        ...havingClause.product_tags_count,
        [Op.lte]: maxTags,
      };
    }
  }

  let order;
  const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase())
    ? sortOrder.toUpperCase()
    : "DESC";
    
  switch (sortBy) {
    case "vendor_name":
      order = [[literal("CONCAT(`User`.`first_name`, ' ', `User`.`last_name`)"), finalSortOrder]];
      break;
    case "business_name":
      order = [[{ model: db.Store, as: "store" }, "business_name", finalSortOrder]];
      break;
    case "total_earnings":
      order = [[literal("total_earnings"), finalSortOrder]];
      break;
    case "product_tags_count":
      order = [[literal("product_tags_count"), finalSortOrder]];
      break;
    case "date_joined":
    case "approved_at":
    default:
      order = [["approved_at", finalSortOrder]];
      break;
  }

  // ✅ FIX: Separate count query when HAVING is used
  let totalFiltered;
  if (Object.keys(havingClause).length > 0) {
    // Use raw count query with HAVING
    totalFiltered = await db.Vendor.count({
      attributes: ["id"],
      where: whereClause,
      include: [
        {
          model: db.User,
          attributes: [],
        },
        {
          model: db.Store,
          as: "store",
          attributes: [],
          where: storeWhereClause,
          required: true,
        },
      ],
      having: havingClause,
      distinct: true,
    });
  } else {
    // Standard count without HAVING
    totalFiltered = await db.Vendor.count({
      where: whereClause,
      include: [
        {
          model: db.Store,
          as: "store",
          attributes: [],
          where: storeWhereClause,
          required: true,
        },
      ],
      distinct: true,
    });
  }

  const { rows: vendors } = await db.Vendor.findAll({
    attributes: [
      "id", "user_id", "store_id", "join_reason", "status", "approved_at",
      [totalEarningsLiteral, "total_earnings"],
      [productTagsLiteral, "product_tags_count"]
    ],
    include: [
      {
        model: db.User,
        attributes: ["id", "first_name", "last_name", "email", "phone"],
      },
      {
        model: db.Store,
        as: "store",
        attributes: ["id", "business_name", "cac_number"],
        where: storeWhereClause,
        required: true,
      },
    ],
    where: whereClause,
    having: Object.keys(havingClause).length > 0 ? havingClause : undefined,
    order,
    limit: limitNum,
    offset,
    subQuery: false,
  });

  const formattedVendors = vendors.map((vendor) => ({
    vendor_id: vendor.id,
    vendor_name: vendor.User
      ? `${vendor.User.first_name || ""} ${vendor.User.last_name || ""}`.trim() || "Unknown Vendor"
      : "Unknown Vendor",
    business_name: vendor.store?.business_name || "Unknown Business",
    email: vendor.User?.email || "No Email",
    phone: vendor.User?.phone || "No Phone",
    product_tags_count: vendor.getDataValue("product_tags_count") || 0,
    join_reason: vendor.join_reason || null,
    total_earnings: parseFloat(vendor.getDataValue("total_earnings") || 0).toFixed(2),
    status: vendor.status,
    date_joined: vendor.approved_at,
  }));

  const response = createPaginationResponse(
    formattedVendors,
    page,
    limit,
    totalFiltered  // ✅ FIXED: Accurate count
  );

  res.status(200).json({
    status: "success",
    ...response,
    filters: {
      appliedFilters: JSON.stringify({
        status: whereClause.status,
        search,
        dateFrom,
        dateTo,
        minEarnings: minEarnings ? parseFloat(minEarnings) : undefined,
        maxEarnings: maxEarnings ? parseFloat(maxEarnings) : undefined,
        minProductTags: minProductTags ? parseInt(minProductTags) : undefined,
        maxProductTags: maxProductTags ? parseInt(maxProductTags) : undefined,
        sortBy,
        sortOrder: finalSortOrder,
      }),
      totalFiltered,
    },
  });
});
```

#### Testing Checklist
- [ ] Test with minEarnings/maxEarnings filters
- [ ] Test with minProductTags/maxProductTags filters
- [ ] Verify pagination count accuracy with filters
- [ ] Test sorting by different fields

---

### 5. HIGH: getVendorTopSellingProducts - Incorrect Count Query
**Location:** Lines 3140-3489  
**Severity:** HIGH  
**Impact:** Pagination count doesn't match actual paginated results

#### Issue Description
The method uses a separate count query (lines 3418-3438) that counts distinct product_ids, but the main query groups by product_id with limit and offset. This creates a mismatch where the count represents total products sold, but the pagination shows products per page.

#### Root Cause
```javascript
// Lines 3199-3229: Main query with GROUP BY and limit/offset
const productSalesData = await db.OrderItem.findAll({
  attributes: [
    "product_id",
    [fn("SUM", col("quantity")), "units_sold"],
    [fn("SUM", col("sub_total")), "revenue"],
    [fn("COUNT", fn("DISTINCT", col("order_id"))), "order_count"],
  ],
  group: ["product_id"],
  order: [[fn("SUM", col("quantity")), "DESC"]],
  limit: limitNum,
  offset,  // ❌ Offset applies to grouped results
  raw: true,
});

// Lines 3418-3438: Count query doesn't match main query logic
const totalProductsSold = await db.OrderItem.count({
  include: [
    {
      model: db.Order,
      as: "order",
      where: {
        payment_status: "paid",
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      attributes: [],
    },
  ],
  where: {
    vendor_id: vendorId,
    product_id: { [Op.ne]: null },
  },
  distinct: true,  // ❌ Counts distinct product_ids, not grouped results
});
```

#### Recommended Fix
Use findAndCountAll with proper GROUP BY handling:

```javascript
const getVendorTopSellingProducts = catchAsync(async (req, res, next) => {
  try {
    const { page = 1, limit = 20, year, month } = req.query;
    
    console.log(`[Vendor Top Selling Products] Request received - User: ${req.user?.id}, Year: ${year}, Month: ${month}, Page: ${page}, Limit: ${limit}`);
    
    const { limit: limitNum, offset } = paginate(page, limit);
    
    const vendor = await db.Vendor.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: db.User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: db.Store,
          as: "store",
          attributes: ["id", "business_name"],
        },
      ],
    });

    if (!vendor) {
      console.error(`[Vendor Top Selling Products] Vendor not found for user: ${req.user.id}`);
      return next(new AppError("Vendor not found or not approved", 404));
    }

    if (vendor.status !== "approved") {
      console.error(`[Vendor Top Selling Products] Vendor not approved. Status: ${vendor.status}`);
      return next(new AppError("Access denied. Vendor account is not approved", 403));
    }

    const vendorId = vendor.id;
    console.log(`[Vendor Top Selling Products] Processing for vendor ID: ${vendorId}`);
    
    let dateRange;
    try {
      dateRange = calculateDateRange(year, month);
    } catch (error) {
      console.error(`[Vendor Top Selling Products] Date validation error: ${error.message}`);
      return next(new AppError(error.message, 400));
    }
    
    const { startDate, endDate, targetYear, targetMonth, isFuture, isLeapYear } = dateRange;
    
    console.log(`[Vendor Top Selling Products] Processing products for ${formatMonthName(targetYear, targetMonth)} (${targetYear}-${targetMonth})`);
    if (isFuture) {
      console.log(`[Vendor Top Selling Products] Warning: Requested future period, defaulted to current month`);
    }
    if (isLeapYear && targetMonth === 2) {
      console.log(`[Vendor Top Selling Products] Leap year detected: ${targetYear}`);
    }

    // ✅ FIX: Use findAndCountAll with subquery for accurate count
    const { count, rows: productSalesData } = await db.OrderItem.findAndCountAll({
      attributes: [
        "product_id",
        [fn("SUM", col("quantity")), "units_sold"],
        [fn("SUM", col("sub_total")), "revenue"],
        [fn("COUNT", fn("DISTINCT", col("order_id"))), "order_count"],
      ],
      include: [
        {
          model: db.Order,
          as: "order",
          where: {
            payment_status: "paid",
            created_at: {
              [Op.gte]: startDate,
              [Op.lt]: endDate,
            },
          },
          attributes: [],
        },
      ],
      where: {
        vendor_id: vendorId,
        product_id: { [Op.ne]: null },
      },
      group: ["product_id"],
      order: [[fn("SUM", col("quantity")), "DESC"]],
      limit: limitNum,
      offset,
      raw: true,
      distinct: true,  // ✅ ADD THIS
      subQuery: false,  // ✅ ADD THIS for GROUP BY
    });

    // Handle count array from GROUP BY
    const totalProductsSold = Array.isArray(count) ? count.length : count;

    const productIds = productSalesData.map((item) => item.product_id);

    if (productIds.length === 0) {
      const isDefault = !year && !month;
      
      return res.status(200).json({
        status: "success",
        data: {
          vendor_info: {
            vendor_id: vendor.id,
            vendor_name: vendor.User
              ? `${vendor.User.first_name || ""} ${vendor.User.last_name || ""}`.trim() || "Unknown Vendor"
              : "Unknown Vendor",
            business_name: vendor.store?.business_name || "Unknown Business",
            email: vendor.User?.email || "No Email",
          },
          products: [],
          monthly_aggregations: {
            total_revenue: "0.00",
            total_units_sold: 0,
            total_products_sold: 0,
            average_profit_margin: "0.00",
            top_performer_id: null,
            top_performer_name: null,
          },
        },
        metadata: {
          period: formatMonthName(targetYear, targetMonth),
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          isFuture,
          isDefault,
          leapYear: isLeapYear,
          filters: {
            year: parseInt(year) || null,
            month: parseInt(month) || null,
          },
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit),
          hasNextPage: false,
          hasPrevPage: false,
        },
        message: `No products sold for ${formatMonthName(targetYear, targetMonth)}.`,
      });
    }

    const products = await db.Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        vendor_id: vendorId,
      },
      attributes: [
        "id", "name", "slug", "price", "discounted_price",
        "thumbnail", "impressions", "sold_units",
        [literal(`(
          SELECT COALESCE(SUM(vc.stock), 0)
          FROM variant_combinations vc
          WHERE vc.product_id = Product.id
        )`), "current_stock"],
      ],
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["name", "slug"],
        },
      ],
      subQuery: false,
    });

    const monthlyStats = await db.OrderItem.findOne({
      attributes: [
        [fn("SUM", col("quantity")), "total_units_sold"],
        [fn("SUM", col("sub_total")), "total_revenue"],
        [fn("COUNT", fn("DISTINCT", col("product_id"))), "total_products_sold"],
        [fn("AVG", col("price")), "average_price"],
      ],
      include: [
        {
          model: db.Order,
          as: "order",
          where: {
            payment_status: "paid",
            created_at: {
              [Op.gte]: startDate,
              [Op.lt]: endDate,
            },
          },
          attributes: [],
        },
      ],
      where: {
        vendor_id: vendorId,
      },
      raw: true,
    });

    const salesMap = new Map(
      productSalesData.map((item) => [
        item.product_id,
        {
          units_sold: parseInt(item.units_sold) || 0,
          revenue: parseFloat(item.revenue) || 0,
          order_count: parseInt(item.order_count) || 0,
        },
      ])
    );

    const processedProducts = products.map((product) => {
      const sales = salesMap.get(product.id) || {
        units_sold: 0,
        revenue: 0,
        order_count: 0,
      };
      
      const currentStock = parseInt(product.getDataValue("current_stock") || 0);
      const views = product.impressions || 0;
      const impressions = product.impressions || 0;
      
      let stockStatus = "out_of_stock";
      if (currentStock > 0) {
        stockStatus = currentStock > 10 ? "in_stock" : "low_stock";
      }
      
      const conversionRate = views > 0 ? ((sales.units_sold / views) * 100).toFixed(2) : "0.00";
      
      const costBasis = product.price * 0.7;
      const profitMargin = sales.revenue > 0 ? 
        (((sales.revenue - (sales.units_sold * costBasis)) / sales.revenue) * 100).toFixed(2) : "0.00";
      
      return {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        units_sold: sales.units_sold,
        revenue: sales.revenue.toFixed(2),
        profit_margin: profitMargin,
        current_stock: currentStock,
        stock_status: stockStatus,
        views: views,
        impressions: impressions,
        conversion_rate: conversionRate,
        is_featured: sales.units_sold >= 10,
        thumbnail: product.thumbnail,
        category: product.Category,
        price: parseFloat(product.price),
        discounted_price: product.discounted_price ? parseFloat(product.discounted_price) : null,
      };
    });

    processedProducts.sort((a, b) => b.units_sold - a.units_sold);

    const monthlyAggregations = {
      total_revenue: parseFloat(monthlyStats?.total_revenue || 0).toFixed(2),
      total_units_sold: parseInt(monthlyStats?.total_units_sold || 0),
      total_products_sold: parseInt(monthlyStats?.total_products_sold || 0),
      average_profit_margin: "30.00",
      top_performer_id: processedProducts[0]?.product_id || null,
      top_performer_name: processedProducts[0]?.product_name || null,
    };

    const isDefault = !year && !month;

    const response = {
      status: "success",
      data: {
        vendor_info: {
          vendor_id: vendor.id,
          vendor_name: vendor.User
            ? `${vendor.User.first_name || ""} ${vendor.User.last_name || ""}`.trim() || "Unknown Vendor"
            : "Unknown Vendor",
          business_name: vendor.store?.business_name || "Unknown Business",
          email: vendor.User?.email || "No Email",
          status: vendor.status,
        },
        products: processedProducts,
        monthly_aggregations: monthlyAggregations,
      },
      metadata: {
        period: formatMonthName(targetYear, targetMonth),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        isFuture,
        isDefault,
        leapYear: isLeapYear,
        filters: {
          year: parseInt(year) || null,
          month: parseInt(month) || null,
        },
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProductsSold / limitNum),  // ✅ FIXED
        totalItems: totalProductsSold,  // ✅ FIXED
        itemsPerPage: limitNum,
        hasNextPage: page < Math.ceil(totalProductsSold / limitNum),  // ✅ FIXED
        hasPrevPage: page > 1,
      },
    };

    console.log(`[Vendor Top Selling Products] Successfully processed ${processedProducts.length} products for vendor ${vendorId}`);
    console.log(`[Vendor Top Selling Products] Total revenue: ${monthlyAggregations.total_revenue}, Top performer: ${monthlyAggregations.top_performer_name}`);

    res.status(200).json(response);
    
  } catch (error) {
    console.error(`[Vendor Top Selling Products] Unexpected error: ${error.message}`, error.stack);
    return next(new AppError("Internal server error while processing vendor top selling products", 500));
  }
});
```

#### Testing Checklist
- [ ] Verify pagination count matches grouped results
- [ ] Test pagination through multiple pages
- [ ] Test with vendors having many products
- [ ] Verify monthly aggregations accuracy

---

## Medium Severity Issues

### 6. MEDIUM: getTopSellingItems - No Pagination Metadata
**Location:** Lines 2099-2272  
**Severity:** MEDIUM  
**Impact:** Cannot paginate through top selling items, returns fixed limit

#### Issue Description
The method accepts `limit` parameter but doesn't implement pagination. It returns a fixed number of items without pagination metadata (totalPages, hasNextPage, etc.).

#### Root Cause
```javascript
// Lines 2101-2104: Accepts limit but no page parameter
const { limit = 10, year, month } = req.query;
const limitNum = Math.max(1, Math.min(parseInt(limit) || 10, 100));

// Lines 2129-2152: Query only uses limit
const topSellingProducts = await db.OrderItem.findAll({
  // ... attributes and includes
  group: ["product_id"],
  order: [[fn("SUM", col("quantity")), "DESC"]],
  limit: limitNum,  // ❌ No offset or pagination
  raw: true,
});

// Lines 2240-2260: No pagination metadata in response
const response = {
  status: "success",
  data: topSellingItems,
  metadata: {
    // ... metadata without pagination
  },
  // ❌ Missing pagination object
};
```

#### Recommended Fix
Implement full pagination:

```javascript
const getTopSellingItems = catchAsync(async (req, res, next) => {
  try {
    const { limit = 10, page = 1, year, month } = req.query;  // ✅ ADD page parameter

    const limitNum = Math.max(1, Math.min(parseInt(limit) || 10, 100));
    const { offset } = paginate(page, limit);  // ✅ ADD offset calculation

    console.log(`[Top Selling Items] Request received - Year: ${year}, Month: ${month}, Page: ${page}, Limit: ${limitNum}`);
    
    let dateRange;
    try {
      dateRange = calculateDateRange(year, month);
    } catch (error) {
      console.error(`[Top Selling Items] Date validation error: ${error.message}`);
      return next(new AppError(error.message, 400));
    }
    
    const { startDate, endDate, targetYear, targetMonth, isFuture, isLeapYear } = dateRange;
    
    console.log(`[Top Selling Items] Processing items for ${formatMonthName(targetYear, targetMonth)} (${targetYear}-${targetMonth})`);
    if (isFuture) {
      console.log(`[Top Selling Items] Warning: Requested future period, defaulted to current month`);
    }
    if (isLeapYear && targetMonth === 2) {
      console.log(`[Top Selling Items] Leap year detected: ${targetYear}`);
    }

    // ✅ FIX: Use findAndCountAll for pagination
    const { count, rows: topSellingProducts } = await db.OrderItem.findAndCountAll({
      attributes: ["product_id", [fn("SUM", col("quantity")), "total_quantity"]],
      include: [
        {
          model: db.Order,
          as: "order",
          where: { 
            payment_status: "paid",
            created_at: {
              [Op.gte]: startDate,
              [Op.lt]: endDate,
            },
          },
          attributes: [],
        },
      ],
      where: {
        product_id: { [Op.ne]: null },
      },
      group: ["product_id"],
      order: [[fn("SUM", col("quantity")), "DESC"]],
      limit: limitNum,
      offset,  // ✅ ADD offset
      raw: true,
      distinct: true,  // ✅ ADD distinct
    });

    // Handle count array from GROUP BY
    const totalItems = Array.isArray(count) ? count.length : count;

    const productIds = topSellingProducts.map((item) => item.product_id);

    if (productIds.length === 0) {
      const isDefault = !year && !month;
      
      return res.status(200).json({
        status: "success",
        data: [],
        metadata: {
          period: formatMonthName(targetYear, targetMonth),
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          isFuture,
          isDefault,
          leapYear: isLeapYear,
          filters: {
            year: parseInt(year) || null,
            month: parseInt(month) || null,
          },
        },
        pagination: {  // ✅ ADD pagination metadata
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNextPage: false,
          hasPrevPage: false,
        },
        message: `No selling items data available for ${formatMonthName(targetYear, targetMonth)}.`,
      });
    }

    const products = await db.Product.findAll({
      attributes: [
        "id", "vendor_id", "category_id", "name", "slug", "description",
        "thumbnail", "price", "discounted_price", "sku", "status",
        "impressions", "sold_units", "created_at", "updated_at",
      ],
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Vendor,
          as: "vendor",
          attributes: ["id"],
          include: [
            {
              model: db.User,
              attributes: ["id", "first_name", "last_name"],
            },
          ],
        },
      ],
      where: {
        id: { [Op.in]: productIds },
        status: "active",
      },
    });

    const topSellingItems = topSellingProducts
      .map((salesItem) => {
        const product = products.find((p) => p.id === salesItem.product_id);
        return {
          product_id: salesItem.product_id,
          total_quantity: parseInt(salesItem.total_quantity) || 0,
          product: product || null,
        };
      })
      .filter((item) => item.product !== null);

    const isDefault = !year && !month;

    const response = {
      status: "success",
      data: topSellingItems,
      metadata: {
        period: formatMonthName(targetYear, targetMonth),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        isFuture,
        isDefault,
        leapYear: isLeapYear,
        filters: {
          year: parseInt(year) || null,
          month: parseInt(month) || null,
        },
      },
      pagination: {  // ✅ ADD pagination metadata
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems: totalItems,
        itemsPerPage: limitNum,
        hasNextPage: page < Math.ceil(totalItems / limitNum),
        hasPrevPage: page > 1,
      },
    };

    console.log(`[Top Selling Items] Successfully processed ${topSellingItems.length} items for ${formatMonthName(targetYear, targetMonth)}`);
    console.log(`[Top Selling Items] Top seller: ${topSellingItems[0]?.product?.name || 'None'}`);

    res.status(200).json(response);
    
  } catch (error) {
    console.error(`[Top Selling Items] Unexpected error: ${error.message}`, error.stack);
    return next(new AppError("Internal server error while processing top selling items", 500));
  }
});
```

#### Testing Checklist
- [ ] Test pagination through multiple pages
- [ ] Verify pagination metadata accuracy
- [ ] Test with different limit values
- [ ] Verify top selling items calculation

---

### 7. MEDIUM: getTopSellingVendors - No Pagination Metadata
**Location:** Lines 1286-1473  
**Severity:** MEDIUM  
**Impact:** Cannot paginate through top selling vendors, returns fixed limit

#### Issue Description
Similar to getTopSellingItems, this method accepts `limit` but doesn't implement pagination with page/offset or return pagination metadata.

#### Root Cause
```javascript
// Lines 1288-1289: Accepts limit but no page parameter
const { limit = 10, year, month } = req.query;
const limitNum = Math.max(1, Math.min(parseInt(limit) || 10, 50));

// Lines 1314-1343: Query only uses limit
const vendorSales = await db.OrderItem.findAll({
  // ... attributes and includes
  group: ["vendor_id"],
  order: [[literal("total_sales"), "DESC"]],
  limit: limitNum,  // ❌ No offset or pagination
  raw: true,
});

// Lines 1440-1461: No pagination metadata in response
const response = {
  status: "success",
  data: result,
  metadata: {
    // ... metadata without pagination
  },
  // ❌ Missing pagination object
};
```

#### Recommended Fix
Implement full pagination similar to getTopSellingItems:

```javascript
const getTopSellingVendors = catchAsync(async (req, res, next) => {
  try {
    const { limit = 10, page = 1, year, month } = req.query;  // ✅ ADD page parameter
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 10, 50));

    console.log(`[Top Selling Vendors] Request received - Year: ${year}, Month: ${month}, Page: ${page}, Limit: ${limitNum}`);
    
    let dateRange;
    try {
      dateRange = calculateDateRange(year, month);
    } catch (error) {
      console.error(`[Top Selling Vendors] Date validation error: ${error.message}`);
      return next(new AppError(error.message, 400));
    }
    
    const { startDate, endDate, targetYear, targetMonth, isFuture, isLeapYear } = dateRange;
    
    console.log(`[Top Selling Vendors] Processing vendors for ${formatMonthName(targetYear, targetMonth)} (${targetYear}-${targetMonth})`);
    if (isFuture) {
      console.log(`[Top Selling Vendors] Warning: Requested future period, defaulted to current month`);
    }
    if (isLeapYear && targetMonth === 2) {
      console.log(`[Top Selling Vendors] Leap year detected: ${targetYear}`);
    }

    const { offset } = paginate(page, limit);  // ✅ ADD offset calculation

    // ✅ FIX: Use findAndCountAll for pagination
    const { count, rows: vendorSales } = await db.OrderItem.findAndCountAll({
      attributes: [
        "vendor_id",
        [fn("SUM", col("sub_total")), "total_sales"],
        [fn("SUM", col("quantity")), "total_units_sold"],
        [fn("COUNT", fn("DISTINCT", col("order_id"))), "total_orders"],
      ],
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: [],
          where: {
            payment_status: "paid",
            order_status: { [Op.in]: ["shipped", "delivered", "completed"] },
            created_at: {
              [Op.gte]: startDate,
              [Op.lt]: endDate,
            },
          },
        },
      ],
      where: {
        vendor_id: { [Op.not]: null },
      },
      group: ["vendor_id"],
      order: [[literal("total_sales"), "DESC"]],
      limit: limitNum,
      offset,  // ✅ ADD offset
      raw: true,
      distinct: true,  // ✅ ADD distinct
    });

    // Handle count array from GROUP BY
    const totalVendors = Array.isArray(count) ? count.length : count;

    if (vendorSales.length === 0) {
      const isDefault = !year && !month;
      
      return res.status(200).json({
        status: "success",
        data: [],
        metadata: {
          period: formatMonthName(targetYear, targetMonth),
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          isFuture,
          isDefault,
          leapYear: isLeapYear,
          filters: {
            year: parseInt(year) || null,
            month: parseInt(month) || null,
          },
        },
        pagination: {  // ✅ ADD pagination metadata
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNextPage: false,
          hasPrevPage: false,
        },
        message: `No vendor sales data available for ${formatMonthName(targetYear, targetMonth)}.`,
      });
    }

    const vendorIds = vendorSales.map((v) => v.vendor_id);

    const vendors = await db.Vendor.findAll({
      where: { id: { [Op.in]: vendorIds } },
      attributes: ["id", "total_sales", "total_earnings", "status"],
      include: [
        {
          model: db.User,
          attributes: ["first_name", "last_name", "email"],
        },
        {
          model: db.Store,
          as: "store",
          attributes: ["business_name", "logo", "slug", "is_verified"],
        },
      ],
      order: [[literal(`FIELD(Vendor.id, ${vendorIds.join(",")})`)]],
      raw: false,
    });

    const salesMap = new Map(
      vendorSales.map((v) => [
        v.vendor_id,
        {
          total_sales: parseFloat(v.total_sales || 0),
          total_units_sold: parseInt(v.total_units_sold || 0),
          total_orders: parseInt(v.total_orders || 0),
        },
      ])
    );

    const result = vendors.map((vendor) => {
      const sales = salesMap.get(vendor.id) || {
        total_sales: 0,
        total_units_sold: 0,
        total_orders: 0,
      };
      const user = vendor.User;
      const store = vendor.store;

      return {
        id: vendor.id,
        name: user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown Vendor"
          : "Unknown Vendor",
        email: user?.email || null,
        business_name: store?.business_name || "No Store Name",
        store_slug: store?.slug || null,
        logo: store?.logo || null,
        is_verified: store?.is_verified || false,
        status: vendor.status,
        stats: {
          total_sales: sales.total_sales,
          total_units_sold: sales.total_units_sold,
          total_orders: sales.total_orders,
          avg_order_value:
            sales.total_orders > 0
              ? parseFloat((sales.total_sales / sales.total_orders).toFixed(2))
              : 0,
        },
      };
    });

    const isDefault = !year && !month;

    const response = {
      status: "success",
      data: result,
      metadata: {
        period: formatMonthName(targetYear, targetMonth),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        isFuture,
        isDefault,
        leapYear: isLeapYear,
        filters: {
          year: parseInt(year) || null,
          month: parseInt(month) || null,
        },
      },
      pagination: {  // ✅ ADD pagination metadata
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVendors / limitNum),
        totalItems: totalVendors,
        itemsPerPage: limitNum,
        hasNextPage: page < Math.ceil(totalVendors / limitNum),
        hasPrevPage: page > 1,
      },
      summary: {
        total_vendors_returned: result.length,
        top_performer: result[0]?.business_name || null,
      },
    };

    console.log(`[Top Selling Vendors] Successfully processed ${result.length} vendors for ${formatMonthName(targetYear, targetMonth)}`);
    console.log(`[Top Selling Vendors] Top performer: ${response.summary.top_performer}`);

    res.status(200).json(response);
    
  } catch (error) {
    console.error(`[Top Selling Vendors] Unexpected error: ${error.message}`, error.stack);
    return next(new AppError("Internal server error while processing top selling vendors", 500));
  }
});
```

#### Testing Checklist
- [ ] Test pagination through multiple pages
- [ ] Verify pagination metadata accuracy
- [ ] Test with different limit values
- [ ] Verify vendor sales calculation

---

## Low Severity Issues

### 8. LOW: getAdminDashboard - No Pagination (Not Required)
**Location:** Lines 1064-1209  
**Severity:** LOW  
**Impact:** None - this is an aggregate endpoint, pagination not applicable

#### Issue Description
This method returns aggregate statistics (counts, sums) for dashboard display. Pagination is not applicable to this use case, but it's documented here for completeness.

#### Analysis
```javascript
// Lines 1091-1168: Multiple aggregate queries
const totalVendors = await db.Vendor.count({ ... });
const monthlyIncome = await db.PaymentTransaction.sum("amount", { ... });
const totalProducts = await db.Product.count();
const monthlySales = await db.Order.sum("total_amount", { ... });
const orderStatuses = { ... }; // Multiple count queries
```

**Recommendation:** No action needed. This endpoint correctly returns aggregate data without pagination, which is the expected behavior for dashboard statistics.

---

## Methods with Correct Pagination Implementation

The following methods have correct pagination implementation and require no changes:

### ✅ getNewArrivals (Lines 132-192)
- Uses `findAndCountAll` with proper pagination
- Includes `distinct: true` to prevent duplicates
- Correctly uses `createPaginationResponse` helper
- **Status:** NO ISSUES

### ✅ getLatestJournal (Lines 367-382)
- Uses `findAndCountAll` with proper pagination
- Correctly implements offset and limit
- Uses `createPaginationResponse` helper
- **Status:** NO ISSUES

### ✅ getVendorProducts (Lines 562-646)
- **Excluded from audit per task requirements**
- Previously fixed in separate task
- **Status:** NO ISSUES

### ✅ getRecentOrders (Lines 1913-2028)
- Uses `findAndCountAll` with proper pagination
- Includes `distinct: true` for JOIN queries
- Correctly handles filters and pagination
- **Status:** NO ISSUES

### ✅ getAdminSalesStats (Lines 1518-1624)
- Returns aggregated monthly statistics
- Pagination not applicable to this use case
- **Status:** NO ISSUES

### ✅ getAdminTopCategories (Lines 1699-1850)
- Returns top 10 categories (fixed limit)
- Pagination not applicable for "top N" queries
- **Status:** NO ISSUES

---

## Summary of Required Changes

### Immediate Action Required (CRITICAL)
1. **getVendorEarningsBreakdown** - Fix count/data mismatch after filtering
2. **getVendorOverview** - Fix pagination count with GROUP BY

### High Priority (Within 1 Week)
3. **getTrendingNow** - Implement full pagination with offset
4. **getVendorOnboardingStats** - Fix count handling with HAVING clause
5. **getVendorTopSellingProducts** - Fix count query for grouped results

### Medium Priority (Within 2 Weeks)
6. **getTopSellingItems** - Add pagination metadata
7. **getTopSellingVendors** - Add pagination metadata

### Low Priority (Within 1 Month)
8. **getAdminDashboard** - No action needed (not applicable)

---

## Best Practices for Pagination Implementation

### 1. Always Use `findAndCountAll`
```javascript
// ✅ CORRECT
const { count, rows } = await Model.findAndCountAll({
  where: { ... },
  limit,
  offset,
  distinct: true,
});

// ❌ INCORRECT
const rows = await Model.findAll({ limit, offset });
const count = await Model.count({ where: { ... } });
```

### 2. Handle GROUP BY Count Arrays
```javascript
// When using GROUP BY, count may be an array
const totalItems = Array.isArray(count) ? count.length : count;
```

### 3. Use `distinct: true` with JOINs
```javascript
// Prevents duplicate rows from JOIN operations
const { count, rows } = await Model.findAndCountAll({
  include: [ ... ],
  distinct: true,  // ✅ Always use with includes
});
```

### 4. Filter in Database, Not in JavaScript
```javascript
// ❌ INCORRECT: Post-query filtering
const { count, rows } = await Model.findAndCountAll({ ... });
const validRows = rows.filter(row => row.isValid);

// ✅ CORRECT: Database-level filtering
const { count, rows } = await Model.findAndCountAll({
  where: { isValid: true },
});
```

### 5. Use Helper Functions Consistently
```javascript
// Use the existing paginate() helper
const { limit, offset } = paginate(page, limit);

// Use the existing createPaginationResponse() helper
const response = createPaginationResponse(data, page, limit, count);
```

---

## Testing Recommendations

### Unit Tests Required
1. Test pagination with empty results
2. Test pagination with single page
3. Test pagination with multiple pages
4. Test boundary conditions (page=1, page=max)
5. Test with GROUP BY queries
6. Test with HAVING clauses
7. Test with JOIN queries
8. Test with filters applied

### Integration Tests Required
1. Verify frontend pagination works correctly
2. Test pagination navigation (next/prev)
3. Verify totalItems matches data length
4. Test with large datasets (1000+ records)
5. Test with concurrent requests

### Performance Tests Required
1. Measure query execution time with pagination
2. Compare performance before/after fixes
3. Test with different limit values (10, 20, 50, 100)
4. Monitor database query plans

---

## Conclusion

This audit identified **8 pagination issues** across the dashboard controller:
- **2 CRITICAL** issues requiring immediate fixes
- **3 HIGH** priority issues
- **2 MEDIUM** priority issues
- **1 LOW** priority issue (no action needed)

All issues have been documented with:
- Clear problem descriptions
- Root cause analysis
- Detailed code fixes
- Testing checklists

**Recommended Action Plan:**
1. Week 1: Fix all CRITICAL issues
2. Week 2: Fix all HIGH priority issues
3. Week 3-4: Fix MEDIUM priority issues
4. Week 5: Complete testing and deployment

---

**Report Generated:** 2026-01-05  
**Audited By:** Kilo Code  
**Controller Version:** dashboard.controller.js (3643 lines)
